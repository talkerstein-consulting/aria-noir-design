"""
Reshape the flat scrape into models with colourways as variants.

The store sells every colourway as its own Shopify product, so scrape/arianoir/products/
has 36 records where the catalogue really has 7 models. This reads that scrape (it does
NOT re-fetch) and writes scrape/arianoir/models/<model>/ with one variant per colourway.

Nothing is inferred: the model is the literal title prefix, and the colourway is the
literal remainder of the title. Shopify's own `Color` option is kept as `shopifyColor`
but is NOT used as the colourway name -- it is a coarse bucket ("Pink" covers four
different Monarcas), so the title remainder is the only faithful name.
"""
import json, os, re, glob, shutil

ROOT = os.path.join("scrape", "arianoir")
SRC = os.path.join(ROOT, "products")
OUT = os.path.join(ROOT, "models")

# Which collection separates the eyewear from everything else. Taken from the store's
# own collections rather than from titles or product_type: `product_type` is the
# misspelt "accesories" on eyewear AND blank on some records, so it cannot carry this.
# Every scraped product falls in exactly one model collection, so the split is total.
APPAREL_COLLECTION = "apparel"
MODEL_COLLECTIONS = ["arca-i", "arca-ii", "matriarca", "patriarca", "monarca", "ahava",
                     APPAREL_COLLECTION]

# Longest first, so "ARCA II" wins over "ARCA".
MODELS = ["ARCA II", "ARCA I", "MATRIARCA", "PATRIARCA", "MONARCA", "AHAVA", "ALPACA SWEATER"]

def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

def split_title(title):
    t = " ".join(title.split())
    up = t.upper()
    for m in MODELS:
        if up.startswith(m):
            rest = t[len(m):].strip()
            rest = re.sub(r"^[-\u2013\u2014:]\s*", "", rest).strip()
            return m, rest
    return None, t

def main():
    # product.json omits `available`; the storefront products.json listing carries it,
    # so availability is read from that snapshot rather than inferred.
    avail = {int(k): v for k, v in json.load(
        open(os.path.join(ROOT, "availability.json"), encoding="utf-8")).items()}

    # handle -> every collection it appears in, from the saved collection listings.
    memberships = {}
    for cf in sorted(glob.glob(os.path.join(ROOT, "collections", "*", "products.json"))):
        cname = os.path.basename(os.path.dirname(cf))
        for cp in json.load(open(cf, encoding="utf-8"))["products"]:
            memberships.setdefault(cp["handle"], []).append(cname)

    def category(handle):
        cols = memberships.get(handle, [])
        if APPAREL_COLLECTION in cols:
            return "apparel"
        if any(c in cols for c in MODEL_COLLECTIONS):
            return "eyewear"
        return "uncategorised"

    groups = {}
    for f in sorted(glob.glob(os.path.join(SRC, "*", "product.json"))):
        p = json.load(open(f, encoding="utf-8"))
        model, colour = split_title(p["title"])
        if not model:
            print("UNMATCHED TITLE (left out):", p["title"])
            continue
        groups.setdefault((category(p["handle"]), model), []).append(
            (os.path.dirname(f), colour, p))

    index = {}
    for (cat, model), entries in sorted(groups.items()):
        ms = slug(model)
        d = os.path.join(OUT, cat, ms)
        os.makedirs(d, exist_ok=True)
        entries.sort(key=lambda e: e[1])

        variants = []
        for srcdir, colour, p in entries:
            cs = slug(colour)
            imgdir = os.path.join(d, "images", cs)
            os.makedirs(imgdir, exist_ok=True)
            names = []
            for img in sorted(glob.glob(os.path.join(srcdir, "images", "*"))):
                dst = os.path.join(imgdir, os.path.basename(img))
                if not os.path.exists(dst):
                    shutil.copy2(img, dst)
                names.append("images/%s/%s" % (cs, os.path.basename(img)))

            sizes = []
            for v in p["variants"]:
                sizes.append({
                    "title": v["title"], "sku": v["sku"], "price": v["price"],
                    "compareAtPrice": v["compare_at_price"], "available": avail.get(v["id"]),
                    "variantId": v["id"],
                })
            variants.append({
                "colorway": colour,
                "slug": cs,
                "sourceHandle": p["handle"],
                "sourceUrl": "https://arianoir.com/products/%s" % p["handle"],
                "productId": p["id"],
                "collections": memberships.get(p["handle"], []),
                "shopifyColor": next((o["values"] for o in p["options"] if o["name"].lower() == "color"), None),
                "sizes": sizes,
                "price": sizes[0]["price"],
                "compareAtPrice": sizes[0]["compareAtPrice"],
                "bodyHtml": p["body_html"],
                "tags": p["tags"],
                "images": names,
            })

        # Descriptions are per-colourway on the store; where every colourway shares
        # the same one it is the model's copy, so hoist it. Otherwise leave it per
        # variant and say so rather than picking a winner.
        bodies = {v["bodyHtml"] for v in variants}
        shared = bodies.pop() if len(bodies) == 1 else None

        model_json = {
            "model": model,
            "slug": ms,
            "category": cat,
            "collection": next((c for c in memberships.get(entries[0][2]["handle"], [])
                                if c in MODEL_COLLECTIONS), None),
            "colorwayCount": len(variants),
            "sharedDescriptionHtml": shared,
            "descriptionVariesByColorway": shared is None,
            "variants": variants,
        }
        json.dump(model_json, open(os.path.join(d, "model.json"), "w", encoding="utf-8"),
                  indent=2, ensure_ascii=False)

        L = ["# %s\n" % model,
             "Category: **%s** — store collection `%s`\n" % (cat, model_json["collection"]),
             "%d colorways, sold on the store as %d separate products.\n"
             % (len(variants), len(variants))]
        if shared:
            L.append("## Description (shared by every colorway)\n\n%s\n" % shared)
        else:
            L.append("_Description differs per colorway; see each variant below._\n")
        L.append("## Colorways\n")
        # NB: "store variant" is Shopify's own variant title. On the eyewear that is
        # the colour again (one variant per product); only the sweaters carry sizes.
        L.append("| Colorway | Price | Compare at | Store variant(s) | In stock | Images | Source handle |")
        L.append("|---|---|---|---|---|---|---|")
        for v in variants:
            stock = ", ".join(
                "%s: %s" % (s["title"], {True: "yes", False: "no"}.get(s["available"], "unknown"))
                for s in v["sizes"])
            L.append("| %s | %s | %s | %s | %s | %d | `%s` |" % (
                v["colorway"], v["price"], v["compareAtPrice"] or "-",
                ", ".join(s["title"] for s in v["sizes"]), stock,
                len(v["images"]), v["sourceHandle"]))
        for v in variants:
            L.append("\n### %s\n" % v["colorway"])
            L.append("- Source: %s" % v["sourceUrl"])
            L.append("- SKU(s): %s" % ", ".join(s["sku"] or "-" for s in v["sizes"]))
            L.append("- Collections: %s" % ", ".join(v["collections"]))
            L.append("- Shopify `Color` option: %s" % (", ".join(v["shopifyColor"]) if v["shopifyColor"] else "-"))
            for n in v["images"]:
                L.append("- `%s`" % n)
            if shared is None:
                L.append("\n%s\n" % v["bodyHtml"])
        open(os.path.join(d, "info.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")

        index.setdefault(cat, []).append({
            "model": model, "slug": ms, "path": "%s/%s" % (cat, ms),
            "collection": model_json["collection"],
            "colorways": [v["colorway"] for v in variants]})
        print("%-9s %-16s %d colorways" % (cat, model, len(variants)))

    json.dump(index, open(os.path.join(OUT, "index.json"), "w", encoding="utf-8"),
              indent=2, ensure_ascii=False)

main()
