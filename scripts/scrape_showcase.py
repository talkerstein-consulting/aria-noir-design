"""Mirror the asset sources from Jai's showcase site (arianoir-showcase.pages.dev).

    python scripts/scrape_showcase.py turntables   # 360-frame WebP turntables, every colourway
    python scripts/scrape_showcase.py assets       # films, GLB models, shop cards, curated photo bank, pages

Output goes to scrape/showcase/ (gitignored, like scrape/arianoir). Like
scrape_arianoir.py, it holds the ORIGINALS. What the site serves is derived
from them at web weight into public/.

Turntables: the registry is scrub/index.json. Each colourway ships as two
zips, <slug>.zip (degrees 0-179) and <slug>-part2.zip (180-359), at 1600x1200
WebP. Both unzip into one folder numbered 0000..0359. The 2400px PNG masters
(170-290 MB each) live on Jai's R2 and are not fetched here.

Cloudflare Pages answers a missing path with the SPA's index.html and a 200,
so every download is checked by Content-Type, not by status code.
"""
import json, os, re, sys, time, zipfile, io, urllib.parse
import requests

BASE = "https://arianoir-showcase.pages.dev/"
OUT = os.path.join(os.getcwd(), "scrape", "showcase")
S = requests.Session()
S.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"})
MEDIA = ("jpg", "jpeg", "png", "webp", "gif", "svg", "mp4", "webm", "mp3", "m4a", "glb", "pdf", "ico", "zip")


def get(url):
    for i in range(4):
        try:
            r = S.get(url, timeout=180)
            if r.status_code == 200:
                return r
            print("  !! %s -> %s" % (url, r.status_code))
            if r.status_code == 404:
                return None
        except Exception as e:
            print("  !! %s -> %s" % (url, e))
        time.sleep(2 * (i + 1))
    return None


def is_html(r):
    return "text/html" in r.headers.get("Content-Type", "")


def save(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)


def turntables():
    reg = get(BASE + "scrub/index.json").json()
    save(os.path.join(OUT, "turntable", "index.json"), json.dumps(reg, indent=2).encode())
    report = {}
    for slug, e in reg.items():
        dest = os.path.join(OUT, "turntable", slug)
        have = len([f for f in os.listdir(dest) if f.endswith(".webp")]) if os.path.isdir(dest) else 0
        if have >= 360:
            report[slug] = have
            print("  = %s (%d frames, skipped)" % (slug, have))
            continue
        os.makedirs(dest, exist_ok=True)
        for part in (slug + ".zip", slug + "-part2.zip"):
            r = get(BASE + "source-3d/turntable/" + part)
            if not r or is_html(r):
                print("  !! %s missing" % part)
                continue
            with zipfile.ZipFile(io.BytesIO(r.content)) as z:
                for n in z.namelist():
                    if n.lower().endswith(".webp"):
                        save(os.path.join(dest, os.path.basename(n)), z.read(n))
        report[slug] = len([f for f in os.listdir(dest) if f.endswith(".webp")])
        print("  + %s %s %d frames" % (slug, e.get("title", ""), report[slug]))
    save(os.path.join(OUT, "turntable", "_report.json"), json.dumps(report, indent=2).encode())
    short = {k: v for k, v in report.items() if v != 360}
    print("\n%d colourways, %d frames. Not 360: %s" % (len(report), sum(report.values()), short or "none"))


PAGES = ["", "about/", "collection/", "fit/", "review/", "source-3d/", "gallery-manager.html"]


def assets():
    seen_pages, urls = set(), set()
    queue = [BASE + p for p in PAGES]
    while queue:
        u = queue.pop()
        if u in seen_pages:
            continue
        seen_pages.add(u)
        r = get(u)
        if not r or not is_html(r) and not u.endswith(".js"):
            continue
        text = r.text
        rel = urllib.parse.urlparse(u).path.lstrip("/") or "index.html"
        if rel.endswith("/"):
            rel += "index.html"
        save(os.path.join(OUT, "pages", rel), r.content)
        for m in re.finditer(r"""["'(]((?:\.{1,2}/|/)?[A-Za-z0-9_\-./%]+\.(?:""" + "|".join(MEDIA) + r"""))(?:\?[^"')]*)?["')]""", text, re.I):
            full = urllib.parse.urljoin(u, m.group(1))
            if full.startswith(BASE) and "/scrub/" not in full and "/source-3d/turntable/" not in full:
                urls.add(full.split("?")[0])
        for m in re.finditer(r"""href=["']((?:\./|/)?bank/[a-z0-9\-]+/index\.html)""", text):
            queue.append(urllib.parse.urljoin(u, m.group(1)).split("?")[0])
    ok = bad = 0
    for full in sorted(urls):
        rel = urllib.parse.unquote(full[len(BASE):])
        path = os.path.join(OUT, "files", rel)
        if os.path.exists(path) and os.path.getsize(path) > 0:
            ok += 1
            continue
        r = get(full)
        if not r or is_html(r):
            bad += 1
            continue
        save(path, r.content)
        ok += 1
    print("\n%d pages, %d files saved, %d unavailable" % (len(seen_pages), ok, bad))


if __name__ == "__main__":
    {"turntables": turntables, "assets": assets}[sys.argv[1] if len(sys.argv) > 1 else "turntables"]()
