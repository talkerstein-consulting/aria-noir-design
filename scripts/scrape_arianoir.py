import json, os, re, sys, time, urllib.parse
import requests
from html.parser import HTMLParser

BASE = "https://arianoir.com"
OUT = os.path.join(os.getcwd(), "scrape", "arianoir")
S = requests.Session()
S.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"})

def get(url, **kw):
    for i in range(3):
        try:
            r = S.get(url, timeout=60, **kw)
            if r.status_code == 200:
                return r
            print("  !! %s -> %s" % (url, r.status_code))
        except Exception as e:
            print("  !! %s -> %s" % (url, e))
        time.sleep(2)
    return None

class Text(HTMLParser):
    SKIP = {"script", "style", "noscript", "svg", "head"}
    def __init__(self):
        super().__init__()
        self.out = []
        self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP: self.skip += 1
        if tag in ("p","div","br","li","tr","h1","h2","h3","h4","h5","h6","section"): self.out.append("\n")
    def handle_endtag(self, tag):
        if tag in self.SKIP and self.skip: self.skip -= 1
    def handle_data(self, d):
        if not self.skip:
            t = d.strip()
            if t: self.out.append(t + " ")

def to_text(html):
    p = Text(); p.feed(html)
    t = "".join(p.out)
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n\s*\n\s*\n+", "\n\n", t)
    return "\n".join(l.strip() for l in t.splitlines()).strip()

def slug(s):
    return re.sub(r"[^a-zA-Z0-9._-]+", "-", s).strip("-")[:120]

def save(path, data, binary=False):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb" if binary else "w", encoding=None if binary else "utf-8") as f:
        f.write(data)

def download(url, path):
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return True
    r = get(url)
    if not r: return False
    save(path, r.content, binary=True)
    return True

def full(url):
    if url.startswith("//"): return "https:" + url
    return url

def orig(url):
    # strip shopify size suffix & query to get the original file
    u = full(url).split("?")[0]
    u = re.sub(r"_(\d+x\d*|\d*x\d+|small|medium|large|grande|compact|master|pico|icon|thumb)(?=\.(jpg|jpeg|png|webp|gif))", "", u, flags=re.I)
    return u

def sitemap_urls(url):
    r = get(url)
    if not r: return []
    return re.findall(r"<loc>([^<]+)</loc>", r.text)

def main():
    index = {"source": BASE, "products": [], "pages": [], "collections": []}

    # ---------- sitemaps ----------
    subs = sitemap_urls(BASE + "/sitemap.xml")
    prod_urls, page_urls, coll_urls = [], [], []
    for s in subs:
        s = s.replace("&amp;", "&")
        if "products" in s: prod_urls = sitemap_urls(s)
        elif "pages" in s: page_urls = sitemap_urls(s)
        elif "collections" in s: coll_urls = sitemap_urls(s)

    # ---------- products ----------
    handles = [u.rstrip("/").split("/")[-1] for u in prod_urls if "/products/" in u]
    for h in handles:
        print("PRODUCT", h)
        d = os.path.join(OUT, "products", h)
        r = get("%s/products/%s.json" % (BASE, h))
        if not r:
            continue
        p = r.json()["product"]
        save(os.path.join(d, "product.json"), json.dumps(p, indent=2, ensure_ascii=False))
        page = get("%s/products/%s" % (BASE, h))
        if page:
            save(os.path.join(d, "page.html"), page.text)
            save(os.path.join(d, "page.txt"), to_text(page.text))

        # info.md
        L = []
        L.append("# %s\n" % p["title"])
        L.append("- URL: %s/products/%s" % (BASE, h))
        L.append("- Handle: %s" % p["handle"])
        L.append("- Product type: %s" % p.get("product_type",""))
        L.append("- Vendor: %s" % p.get("vendor",""))
        L.append("- Tags: %s" % p.get("tags",""))
        L.append("- Published: %s" % p.get("published_at",""))
        L.append("\n## Description (raw HTML)\n\n%s\n" % p.get("body_html",""))
        L.append("## Description (text)\n\n%s\n" % to_text(p.get("body_html","") or ""))
        L.append("## Options\n")
        for o in p.get("options", []):
            L.append("- %s: %s" % (o["name"], ", ".join(o.get("values", []))))
        L.append("\n## Variants\n")
        L.append("| Title | SKU | Price | Compare at | Available |")
        L.append("|---|---|---|---|---|")
        for v in p.get("variants", []):
            L.append("| %s | %s | %s | %s | %s |" % (v.get("title"), v.get("sku"), v.get("price"), v.get("compare_at_price"), v.get("available")))
        L.append("\n## Images\n")

        imgs = p.get("images", [])
        for i, im in enumerate(imgs, 1):
            u = orig(im["src"])
            name = "%02d-%s" % (i, slug(os.path.basename(urllib.parse.urlparse(u).path)))
            ok = download(u, os.path.join(d, "images", name))
            L.append("- `images/%s` — %s (%sx%s)%s" % (name, u, im.get("width"), im.get("height"), "" if ok else "  [DOWNLOAD FAILED]"))

        # images embedded in the description
        extra = [orig(x) for x in re.findall(r'<img[^>]+src="([^"]+)"', p.get("body_html","") or "")]
        if extra:
            L.append("\n### Images embedded in description\n")
            for i, u in enumerate(extra, 1):
                name = "desc-%02d-%s" % (i, slug(os.path.basename(urllib.parse.urlparse(u).path)))
                ok = download(u, os.path.join(d, "images", name))
                L.append("- `images/%s` — %s%s" % (name, u, "" if ok else "  [DOWNLOAD FAILED]"))

        save(os.path.join(d, "info.md"), "\n".join(L) + "\n")
        index["products"].append({"handle": h, "title": p["title"], "url": "%s/products/%s" % (BASE, h),
                                  "images": len(imgs), "variants": len(p.get("variants", []))})

    # ---------- pages ----------
    for u in page_urls:
        h = u.rstrip("/").split("/")[-1]
        print("PAGE", h)
        r = get(u)
        if not r: continue
        d = os.path.join(OUT, "pages", h)
        save(os.path.join(d, "page.html"), r.text)
        txt = to_text(r.text)
        save(os.path.join(d, "page.txt"), txt)
        save(os.path.join(d, "info.md"), "# %s\n\n- URL: %s\n\n---\n\n%s\n" % (h, u, txt))
        for i, src in enumerate(re.findall(r'<img[^>]+src="([^"]+)"', r.text), 1):
            if "cdn.shopify" not in src: continue
            uu = orig(src)
            download(uu, os.path.join(d, "images", "%02d-%s" % (i, slug(os.path.basename(urllib.parse.urlparse(uu).path)))))
        index["pages"].append({"handle": h, "url": u})

    # ---------- collections ----------
    for u in coll_urls + [BASE + "/"]:
        h = u.rstrip("/").split("/")[-1] or "home"
        print("COLLECTION", h)
        r = get(u)
        if not r: continue
        d = os.path.join(OUT, "collections", h)
        save(os.path.join(d, "page.html"), r.text)
        save(os.path.join(d, "page.txt"), to_text(r.text))
        pr = get(u + "/products.json?limit=250") if "/collections/" in u else None
        if pr:
            try:
                save(os.path.join(d, "products.json"), json.dumps(pr.json(), indent=2, ensure_ascii=False))
            except Exception: pass
        for i, src in enumerate(re.findall(r'<img[^>]+src="([^"]+)"', r.text), 1):
            if "cdn.shopify" not in src: continue
            uu = orig(src)
            download(uu, os.path.join(d, "images", "%02d-%s" % (i, slug(os.path.basename(urllib.parse.urlparse(uu).path)))))
        index["collections"].append({"handle": h, "url": u})

    save(os.path.join(OUT, "index.json"), json.dumps(index, indent=2, ensure_ascii=False))
    print("DONE")

main()
