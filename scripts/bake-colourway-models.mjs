/**
 * Bake a house's procedural acetate into a texture, and export that.
 *
 * Run: node scripts/bake-colourway-models.mjs arca-ii
 * Needs: Blender ≥ 4.5 (BLENDER=/path/to/blender to override).
 *
 * ---- What this is for ----
 *
 * The acetate in these files is a SHADER — `TEX_NOISE` → `TEX_WAVE` →
 * `COLORRAMP` into a Principled BSDF. Blender computes the pattern per
 * pixel while it renders. glTF has no way to carry that: the spec is
 * image textures and PBR factors, so a plain export collapses every
 * acetate to its flat base colour, which is why Tutti Frutti and Velvet
 * Rose arrive on the site as the same pale frame. Nothing about the
 * container fixes it — FBX and USD cannot carry it either, and three.js
 * could not evaluate Blender's nodes if they did.
 *
 * Baking is the fix: render the shader once, into an image, at author
 * time. After that it is an ordinary texture and every format carries it.
 *
 * ---- Why each object gets its own copy of the material ----
 *
 * `Main_frame`, `Leg` and `Leg.001` share one `Procedural_Acetate`. Baking
 * them into a single image would need their UVs to occupy different parts
 * of it, and they do not — each object is unwrapped into its own 0–1
 * square, so they would overwrite one another. Copying the material per
 * object gives each its own image and its own UV space, which costs a few
 * hundred kb and cannot be got wrong.
 *
 * ---- Why the output is a separate file ----
 *
 * Writes `<house>-<colourway>-baked.glb`, never over the plain export. A
 * bake is a judgement — resolution, and whether the pattern reads at
 * turntable scale — and the unbaked file is what you compare it against.
 * It is also how this avoids repeating the ARCA I mistake, where a
 * re-export silently replaced a better one.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "3d models");
const OUT = path.join(ROOT, "public", "models", "houses");

const HOUSE_DIRS = {
  "ahava": "AHAVA",
  "arca-i": "ARCA I",
  "arca-ii": "Arca II",
  "matriarca": "MATRIARCA",
  "monarca": "MONARCA",
  "patriarca": "PATRIARCA",
};

const BLENDER =
  process.env.BLENDER || "/Applications/Blender.app/Contents/MacOS/Blender";
/** Bake resolution. 2048 is where the knit-fine noise in these acetates
 *  stops softening at the size the turntable draws them. */
const SIZE = Number(process.env.BAKE_SIZE || 2048);
/** Cycles samples. This is an EMIT bake of a procedural colour — there is
 *  no light transport and so no noise to converge. Low is correct here,
 *  not a compromise. */
const SAMPLES = Number(process.env.BAKE_SAMPLES || 8);
/** Make the baked acetate solid rather than glass. On by default: see the
 *  note in the bake body for why a transmissive material throws the bake
 *  away. `OPAQUE=0` to keep the authored glass. */
const OPAQUE = process.env.OPAQUE === "0" ? "False" : "True";

const slug = (s) =>
  s.normalize("NFKD").replace(/[^\w\s-]/g, "").trim().toLowerCase().replace(/\s+/g, "-");

const PY = (out, size, samples, opaque) => `
import bpy

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = ${samples}
scene.cycles.device = 'CPU'
scene.render.bake.margin = 16

def principled(nt):
    for n in nt.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            return n
    return None

def is_procedural(mat):
    if not mat or not mat.node_tree:
        return False
    kinds = {n.type for n in mat.node_tree.nodes}
    if 'TEX_IMAGE' in kinds:
        return False
    return bool(kinds & {'TEX_NOISE','TEX_WAVE','TEX_VORONOI','TEX_MAGIC',
                         'TEX_GRADIENT','TEX_CHECKER','TEX_BRICK','TEX_MUSGRAVE'})

baked = 0
for obj in list(bpy.data.objects):
    if obj.type != 'MESH' or not obj.data.uv_layers:
        continue
    for slot in obj.material_slots:
        mat = slot.material
        if not is_procedural(mat):
            continue

        mine = mat.copy()
        mine.name = f"{mat.name}_{obj.name}_baked"
        slot.material = mine
        nt = mine.node_tree
        bsdf = principled(nt)
        if not bsdf:
            continue

        # ---- What actually feeds the colour ----
        # A DIFFUSE bake returns BLACK on these: the acetate is
        # transmissive, and glass has no diffuse component for Cycles to
        # bake. So the node graph behind Base Color is routed through an
        # EMISSION shader and baked as EMIT, which captures whatever colour
        # that graph produces regardless of the BSDF it was heading into.
        base = bsdf.inputs['Base Color']
        src_socket = base.links[0].from_socket if base.links else None

        out_node = next((n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL'), None)
        emit = nt.nodes.new('ShaderNodeEmission')
        emit.location = (bsdf.location.x, bsdf.location.y - 400)
        if src_socket is not None:
            nt.links.new(src_socket, emit.inputs['Color'])
        else:
            emit.inputs['Color'].default_value = base.default_value

        prev_surface = out_node.inputs['Surface'].links[0].from_socket if out_node.inputs['Surface'].links else None
        nt.links.new(emit.outputs['Emission'], out_node.inputs['Surface'])

        img = bpy.data.images.new(
            f"bake_{obj.name}", width=${size}, height=${size}, alpha=False
        )
        tex = nt.nodes.new('ShaderNodeTexImage')
        tex.image = img
        tex.location = (-600, 400)
        nt.nodes.active = tex

        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.bake(type='EMIT')

        # Put the real shader back and hand it the baked picture.
        if prev_surface is not None:
            nt.links.new(prev_surface, out_node.inputs['Surface'])
        nt.nodes.remove(emit)
        nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])

        # ---- Opaque, or the bake is invisible ----
        #
        # These acetates are authored as glass: transmission 1, alpha 0.7,
        # ior 1.33. That is right in Cycles, where the shader is evaluated
        # against a lit scene and the block reads as thick coloured
        # material. It is wrong in a glTF viewer: a transmission factor of
        # 1 means the renderer shows what is BEHIND the frame -- on this
        # site, black -- and the baked colour washes out to almost nothing.
        #
        # So the baked material is made solid: no transmission, full alpha,
        # OPAQUE blending. The texture is now the only thing saying what
        # colour the frame is, which is the whole point of baking it.
        # Clearcoat stays: that is polish on the surface, not
        # see-through-ness, and it keeps the acetate off matte plastic.
        if ${opaque}:
            for name in ('Transmission Weight', 'Transmission'):
                if name in bsdf.inputs:
                    bsdf.inputs[name].default_value = 0.0
            if 'Alpha' in bsdf.inputs:
                bsdf.inputs['Alpha'].default_value = 1.0
            mine.blend_method = 'OPAQUE'
            mine.use_backface_culling = False

        img.pack()
        baked += 1
        print(f"BAKED {obj.name} / {mat.name}")

print(f"BAKED_TOTAL {baked}")

bpy.ops.export_scene.gltf(
    filepath=r"${out}",
    export_format='GLB',
    export_draco_mesh_compression_enable=True,
    export_yup=True,
    export_cameras=False,
    export_lights=False,
    # WEBP, not the PNG 'AUTO' picks: three 2048 PNGs put a baked model at
    # 3.8MB, four times its unbaked geometry. The same bakes as webp land
    # near 1MB with no visible loss in a pattern this soft.
    export_image_format='WEBP',
    export_image_quality=85,
)
`;

function main() {
  const house = process.argv[2];
  if (!house || !HOUSE_DIRS[house]) {
    console.error(`Usage: node scripts/bake-colourway-models.mjs <${Object.keys(HOUSE_DIRS).join("|")}> [Colourway]`);
    process.exit(1);
  }
  if (!fs.existsSync(BLENDER)) {
    console.error(`Blender not found at ${BLENDER}.`);
    process.exit(1);
  }
  const only = process.argv[3];
  const dir = path.join(SRC, HOUSE_DIRS[house]);
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".blend"))
    .filter((f) => !only || f.toLowerCase().includes(only.toLowerCase()));

  if (!files.length) {
    console.error(`No .blend matched in ${dir}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT, { recursive: true });
  let ok = 0;
  for (const file of files) {
    const stem = file.replace(/\.blend$/i, "");
    const bare = stem.replace(new RegExp(`^${HOUSE_DIRS[house]}[-_ ]+`, "i"), "");
    const out = path.join(OUT, `${house}-${slug(bare)}-baked.glb`);
    process.stdout.write(`  ${bare} … `);
    try {
      const log = execFileSync(
        BLENDER,
        ["--background", path.join(dir, file), "--python-expr", PY(out, SIZE, SAMPLES, OPAQUE)],
        { encoding: "utf8", maxBuffer: 1 << 28 },
      );
      const n = (log.match(/BAKED_TOTAL (\d+)/) || [])[1] ?? "?";
      const kb = Math.round(fs.statSync(out).size / 1024);
      console.log(`baked ${n} material(s) → ${path.basename(out)} (${kb}kb)`);
      ok += 1;
    } catch (e) {
      console.log("FAILED");
      console.error(`    ${String(e.stdout || e.message).split("\n").slice(-6).join("\n    ")}`);
    }
  }
  console.log(`\n${ok}/${files.length} baked.`);
}

main();
