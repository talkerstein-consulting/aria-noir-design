# python build_html.py <before_dir> <after_dir> <items.json> <out_dir>
# Builds review.html (+ slices/) for print: per reviewed page, Jai's words,
# what changed, the first screen before/after, then the whole page before
# and after side by side, sliced so nothing is cut at a page break.
import json, os, sys, html
from PIL import Image

BEFORE, AFTER, ITEMS, OUT = sys.argv[1:5]
os.makedirs(os.path.join(OUT, "slices"), exist_ok=True)
data = json.load(open(ITEMS, encoding="utf8"))
E = html.escape

PAGES = [
    ("home", "Homepage", "/"), ("shop", "Shop All", "/shop"),
    ("arca-i", "ARCA I", "/arca-i"), ("arca-ii", "ARCA II", "/arca-ii"),
    ("ahava", "AHAVA", "/ahava"), ("patriarca", "PATRIARCA", "/patriarca"),
    ("monarca", "MONARCA", "/monarca"), ("matriarca", "MATRIARCA", "/matriarca"),
    ("shop-arca-i", "ARCA I, buy page", "/shop/arca-i"), ("shop-arca-ii", "ARCA II, buy page", "/shop/arca-ii"),
    ("shop-ahava", "AHAVA, buy page", "/shop/ahava"), ("shop-patriarca", "PATRIARCA, buy page", "/shop/patriarca"),
    ("about", "Maison / About", "/house/about"), ("gallery", "Gallery", "/gallery"),
]
EXTRA = data.get("new_pages", [])  # routes that did not exist before


def slices(key, view, col_w, slice_h):
    """Cut before/after full captures into equal-height strips at a common scale."""
    out = []
    for side, d in (("before", BEFORE), ("after", AFTER)):
        p = os.path.join(d, f"{key}-{view}-full.jpg")
        if not os.path.exists(p):
            out.append([])
            continue
        im = Image.open(p).convert("RGB")
        scale = col_w * 2 / im.width  # 2x for print sharpness
        im = im.resize((int(im.width * scale), int(im.height * scale)))
        strips, y, n = [], 0, 0
        while y < im.height:
            box = im.crop((0, y, im.width, min(im.height, y + slice_h * 2)))
            name = f"slices/{key}-{view}-{side}-{n:02d}.jpg"
            box.save(os.path.join(OUT, name), quality=72)
            strips.append((name, box.height / 2))
            y += slice_h * 2
            n += 1
        out.append(strips)
    return out


def rel(d, f):
    p = os.path.join(d, f)
    return p.replace("\\", "/") if os.path.exists(p) else None


STATUS = {"done": "Done", "kept": "Kept", "next": "Not yet", "partial": "Partly", "blocked": "Needs input"}
by_key = {p["key"]: p for p in data["pages"]}
for k, its in data.get("new_page_items", {}).items():
    by_key.setdefault(k, {"key": k, "name": k, "items": its})
parts = []

parts.append(f"""
<section class="cover">
  <p class="eyebrow">ARIA NOIR · MAISON</p>
  <h1>Website revisions<br>before and after</h1>
  <p class="sub">Jai's feedback of 5 November 2026, in his words, against the site as he reviewed it (staging) and as revised.</p>
  <p class="meta">Prepared for the build review · {E(data.get('date', ''))}</p>
</section>
<section class="page">
  <p class="eyebrow">HOW TO READ THIS</p>
  <h2>Sources</h2>
  <ul class="plain">
    <li><b>Review deck</b>: <i>ARIA NOIR, Website review for the build team</i>, Jai Jind, 5 November 2026. Quoted verbatim.</li>
    <li><b>Call notes</b>: the 5 November call with Jai, as noted by Rishon in #aria-noir. Jai's quoted words are his; the rest is the note-taker's summary.</li>
    <li><b>Raviv</b>: Raviv's follow-ups in #aria-noir relaying Jai, 5 November.</li>
    <li><b>Before</b>: aria-noir-design-staging.vercel.app, the site Jai reviewed, captured {E(data.get('before_date', ''))}.</li>
    <li><b>After</b>: the revised build (branch rems-branch, local), captured {E(data.get('after_date', ''))}. Not yet deployed.</li>
  </ul>
  <h2>Status keys</h2>
  <p><span class="tag done">Done</span> built · <span class="tag kept">Kept</span> Jai asked to keep it · <span class="tag partial">Partly</span> part built · <span class="tag next">Not yet</span> not built in this pass · <span class="tag blocked">Needs input</span> waiting on assets or a decision</p>
  <h2>Jai's three rules</h2>
  <div class="rules">{''.join(f'<div><h3>{E(r["t"])}</h3><blockquote>{E(r["q"])}</blockquote></div>' for r in data["principles"])}</div>
  <h2>From the call</h2>
  <p class="quotes">{' '.join(f'<q>{E(q)}</q>' for q in data["call_quotes"])}</p>
</section>
""")

# summary table
rows = []
for p in list(data["pages"]) + [{"name": e["name"], "items": data.get("new_page_items", {}).get(e["key"], [])} for e in EXTRA]:
    for it in p["items"]:
        rows.append(f'<tr><td>{E(p["name"])}</td><td>{E(it["jai"][:140])}{"…" if len(it["jai"])>140 else ""}</td><td><span class="tag {it["status"]}">{STATUS[it["status"]]}</span></td></tr>')
parts.append(f'<section class="page"><p class="eyebrow">SUMMARY</p><h2>Every note and where it stands</h2><table class="sum"><thead><tr><th>Page</th><th>Jai\'s note</th><th>Status</th></tr></thead><tbody>{"".join(rows)}</tbody></table></section>')

ordered = [(k, n, r) for k, n, r in PAGES]
for key, name, route in ordered + [(e["key"], e["name"], e["route"]) for e in EXTRA]:
    meta = by_key.get(key)
    notes = ""
    if meta:
        notes = "".join(
            f'<div class="note"><blockquote>{E(it["jai"])}<cite>{E(it["src"])}</cite></blockquote>'
            f'<p class="change"><span class="tag {it["status"]}">{STATUS[it["status"]]}</span> {E(it["change"])}</p></div>'
            for it in meta["items"]
        )
    # also attach notes from pages that reuse this page's shots (footer, nav)
    for p in data["pages"]:
        if p.get("shot") == key and p["key"] != key:
            notes += f'<h3 class="sub">{E(p["name"])}</h3>' + "".join(
                f'<div class="note"><blockquote>{E(it["jai"])}<cite>{E(it["src"])}</cite></blockquote>'
                f'<p class="change"><span class="tag {it["status"]}">{STATUS[it["status"]]}</span> {E(it["change"])}</p></div>'
                for it in p["items"])
    bd, ad = rel(BEFORE, f"{key}-desktop-fold.jpg"), rel(AFTER, f"{key}-desktop-fold.jpg")
    bm, am = rel(BEFORE, f"{key}-mobile-fold.jpg"), rel(AFTER, f"{key}-mobile-fold.jpg")
    def img(p, cls):
        return f'<img class="{cls}" src="file:///{p}">' if p else f'<div class="{cls} missing">Not in this version</div>'
    parts.append(f"""
<section class="page">
  <p class="eyebrow">{E(route)}</p>
  <h2>{E(name)}</h2>
  {notes or '<p class="muted">No page-specific note from Jai. Shown for completeness: shared changes (navigation, footer, spacing) apply here too.</p>'}
  <h3 class="sub">First screen, desktop</h3>
  <div class="pair"><figure>{img(bd,'shot')}<figcaption>Before</figcaption></figure><figure>{img(ad,'shot')}<figcaption>After</figcaption></figure></div>
  <h3 class="sub">First screen, phone</h3>
  <div class="pair phone"><figure>{img(bm,'shot')}<figcaption>Before</figcaption></figure><figure>{img(am,'shot')}<figcaption>After</figcaption></figure></div>
</section>""")
    for view, col_w, slice_h, label in (("desktop", 330, 430, "desktop"), ("mobile", 200, 430, "phone")):
        b, a = slices(key, view, col_w, slice_h)
        if not b and not a:
            continue
        n = max(len(b), len(a))
        strips = []
        for i in range(n):
            bi = f'<img src="{b[i][0]}" style="width:{col_w}px">' if i < len(b) else '<div class="end">End of page</div>'
            ai = f'<img src="{a[i][0]}" style="width:{col_w}px">' if i < len(a) else '<div class="end">End of page</div>'
            strips.append(f'<div class="strip"><div style="width:{col_w}px">{bi}</div><div style="width:{col_w}px">{ai}</div></div>')
        parts.append(f'<section class="page long"><p class="eyebrow">{E(route)} · WHOLE PAGE · {label.upper()}</p><div class="heads"><span style="width:{col_w}px">Before</span><span style="width:{col_w}px">After</span></div>{"".join(strips)}</section>')

CSS = """
@page { size: A4; margin: 14mm 14mm 16mm; }
* { box-sizing: border-box; }
body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color: #1a1918; font-size: 10.5pt; line-height: 1.45; margin: 0; }
h1, h2, h3 { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 500; margin: 0 0 8px; }
h1 { font-size: 44pt; line-height: 1.05; }
h2 { font-size: 24pt; margin-top: 4px; }
h3 { font-size: 14pt; }
h3.sub { font-family: inherit; font-size: 9pt; letter-spacing: .14em; text-transform: uppercase; color: #6b5a3a; margin: 18px 0 8px; font-weight: 600; }
.eyebrow { font-size: 8pt; letter-spacing: .22em; color: #8a6d2f; font-weight: 600; margin: 0 0 4px; }
.cover { height: 260mm; display: flex; flex-direction: column; justify-content: center; page-break-after: always; }
.cover .sub { font-size: 13pt; max-width: 130mm; color: #444; }
.cover .meta { color: #8a6d2f; }
.page { page-break-before: always; }
.cover + .page { page-break-before: auto; }
.plain li { margin-bottom: 4px; }
.rules { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.rules > div { border: 1px solid #ddd4c4; padding: 10px; background: #faf8f4; }
blockquote { margin: 0; padding: 8px 12px; border-left: 3px solid #8a6d2f; background: #f6f2ea; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 12.5pt; }
blockquote cite { display: block; font-family: 'Inter', Arial, sans-serif; font-style: normal; font-size: 7.5pt; letter-spacing: .08em; color: #8a6d2f; margin-top: 4px; text-transform: uppercase; }
.quotes q { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 13pt; margin-right: 10px; }
.note { margin: 10px 0 12px; break-inside: avoid; }
.change { margin: 6px 0 0 2px; }
.tag { display: inline-block; font-size: 7pt; letter-spacing: .1em; text-transform: uppercase; padding: 2px 6px; border-radius: 2px; font-weight: 600; margin-right: 4px; }
.tag.done { background: #1f4d2b; color: #fff; } .tag.kept { background: #e5dfd2; color: #3a3326; }
.tag.next { background: #fff; color: #7a2e1f; border: 1px solid #7a2e1f; } .tag.partial { background: #c9a14a; color: #1a1918; }
.tag.blocked { background: #3a3326; color: #fff; }
table.sum { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
table.sum th, table.sum td { border-bottom: 1px solid #e5dfd2; padding: 5px 4px; text-align: left; vertical-align: top; }
table.sum tr { break-inside: avoid; }
.pair { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; break-inside: avoid; }
.pair.phone { grid-template-columns: 52mm 52mm; justify-content: start; }
figure { margin: 0; } figcaption { font-size: 8pt; letter-spacing: .12em; text-transform: uppercase; color: #6b5a3a; margin-top: 3px; }
.shot { width: 100%; border: 1px solid #ccc; display: block; }
.missing { height: 40mm; display: flex; align-items: center; justify-content: center; background: #f2efe8; color: #888; font-size: 9pt; }
.muted { color: #777; }
.long .heads { display: flex; gap: 14px; font-size: 8pt; letter-spacing: .12em; text-transform: uppercase; color: #6b5a3a; margin-bottom: 4px; }
.strip { display: flex; gap: 14px; break-inside: avoid; margin-bottom: 0; }
.strip img { display: block; }
.end { font-size: 8pt; color: #999; padding: 6px 0; }
"""
doc = f"""<!doctype html><html><head><meta charset="utf-8"><title>Aria Noir revisions</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>{''.join(parts)}</body></html>"""
open(os.path.join(OUT, "review.html"), "w", encoding="utf8").write(doc)
print("ok", os.path.join(OUT, "review.html"))
