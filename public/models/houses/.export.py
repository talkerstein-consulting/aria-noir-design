
import bpy, sys
out = sys.argv[sys.argv.index('--') + 1]
bpy.ops.export_scene.gltf(
    filepath=out,
    export_format='GLB',
    export_apply=True,          # bake modifiers — subsurf is not a web feature
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_yup=True,
)
