"""Turn the raw reigningchamp.com snapshot into the JSON the Next.js app reads.

usage: python3 build_catalog.py <workdir>

Reads <workdir>/raw/{products,collections,collection_pages,collection_aliases,pdp,pages}.json
(written by fetch_collections.py, scrape_collection_pages.py, scrape_products.py and
scrape_pages.py) and writes src/components/sites/reigningchamp/catalog/*.json.

Every internal link is rewritten to a local route when the snapshot contains it;
anything else keeps its absolute reigningchamp.com URL.
"""
import json
import os
import re
import sys
from urllib.parse import urlsplit

from bs4 import BeautifulSoup

S = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "src/components/sites/reigningchamp/catalog")
ORIGIN = "https://reigningchamp.com"


def load(name):
    return json.load(open(f"{S}/raw/{name}.json"))


raw_products = load("products")
raw_collections = load("collections")
collection_pages = load("collection_pages")
aliases = load("collection_aliases")
pdp = load("pdp")
raw_pages = load("pages")
blog_index = raw_pages.pop("__blog__")

PAGE_ALIASES = {
    "/policies/privacy-policy": "/pages/privacy-policy",
    "/policies/terms-of-service": "/pages/terms-of-service",
    "/policies/refund-policy": "/pages/refund-policy",
    "/policies/shipping-policy": "/pages/shipping-policy",
}
LOCAL_FIXED = {"/", "/cart", "/search", "/account", "/account/login", "/account/register", "/pages/wishlist"}
page_paths = {p for p, v in raw_pages.items() if v}


def local_href(href):
    """Map a source href to a local route, or keep it absolute when the clone lacks it."""
    if not href:
        return href
    href = href.strip()
    if href.startswith(("mailto:", "tel:", "#", "javascript:")):
        return href
    if href.startswith("//"):
        href = "https:" + href
    parts = urlsplit(href)
    if parts.netloc and parts.netloc not in ("reigningchamp.com", "www.reigningchamp.com"):
        return href
    path = re.sub(r"/+$", "", parts.path) or "/"
    query = f"?{parts.query}" if parts.query else ""
    frag = f"#{parts.fragment}" if parts.fragment else ""
    path = PAGE_ALIASES.get(path, path)
    if path in LOCAL_FIXED or path.startswith("/account"):
        return path + query + frag
    m = re.match(r"^/collections/([^/]+)(?:/products/([^/]+))?$", path)
    if m:
        if m.group(2):
            path = f"/products/{m.group(2)}"
        else:
            handle = aliases.get(m.group(1), m.group(1))
            if handle in collections:
                return f"/collections/{handle}{query}{frag}"
            return ORIGIN + path + query + frag
    m = re.match(r"^/products/([^/]+)$", path)
    if m:
        return path + frag if m.group(1) in products else ORIGIN + path + query + frag
    if path in page_paths:
        return path + query + frag
    return ORIGIN + path + query + frag


def rewrite_html(html):
    if not html:
        return ""
    soup = BeautifulSoup(html, "lxml")
    for a in soup.find_all("a", href=True):
        a["href"] = local_href(a["href"])
        if a["href"].startswith("http") and "reigningchamp.com" not in a["href"]:
            a["target"] = "_blank"
            a["rel"] = "noreferrer"
    for img in soup.find_all("img"):
        if img.get("src", "").startswith("//"):
            img["src"] = "https:" + img["src"]
    body = soup.body or soup
    return "".join(str(c) for c in body.contents).strip()


def tag_values(p, key):
    return [t.split(":", 1)[1].strip() for t in p["tags"] if t.lower().startswith(key + ":")]


def first(p, key):
    vals = tag_values(p, key)
    return vals[0] if vals else None


SIZE_ABBR = {
    "Extra Small": "XS", "Small": "S", "Medium": "M", "Large": "L",
    "Extra Large": "XL", "XX Large": "XXL", "XXX Large": "XXXL", "One Size": "O/S",
}

collections = {h: c for h, c in raw_collections.items() if c["products"]}
products = {}
for handle, p in raw_products.items():
    variants = []
    for v in p["variants"]:
        variants.append({
            "id": v["id"],
            "title": v["title"],
            "options": [o for o in (v.get("option1"), v.get("option2"), v.get("option3")) if o is not None],
            "price": float(v["price"]),
            "compareAtPrice": float(v["compare_at_price"]) if v.get("compare_at_price") and float(v["compare_at_price"]) > float(v["price"]) else None,
            "available": bool(v.get("available")),
            "image": (v.get("featured_image") or {}).get("src"),
        })
    prices = [v["price"] for v in variants] or [0]
    compare = [v["compareAtPrice"] for v in variants if v["compareAtPrice"]]
    products[handle] = {
        "handle": handle,
        "title": p["title"],
        "productType": p["product_type"],
        "createdAt": p["created_at"],
        "publishedAt": p["published_at"],
        "description": p["body_html"] or "",
        "subType": first(p, "sub-type"),
        "type": first(p, "type"),
        "colour": first(p, "colour"),
        "colourHex": ("#" + first(p, "colour-hex")) if first(p, "colour-hex") else None,
        "colourFilter": first(p, "colour-filter"),
        "fit": first(p, "fit"),
        "neckline": first(p, "neckline"),
        "sleeve": first(p, "sleeve"),
        "inseam": first(p, "inseam"),
        "fastener": first(p, "fastener"),
        "department": first(p, "department"),
        "fabricGroup": first(p, "fabric-group"),
        "fabric": first(p, "fabric"),
        "isNew": "NEW" in p["tags"] or "collection:new" in p["tags"],
        "price": min(prices),
        "compareAtPrice": max(compare) if compare else None,
        "available": any(v["available"] for v in variants),
        "options": [{"name": o["name"], "values": o["values"]} for o in p["options"]],
        "variants": variants,
        "images": [{"src": i["src"], "width": i["width"], "height": i["height"], "alt": i.get("alt") or p["title"]} for i in p["images"]],
    }

# Detail-page content lives in its own file so collection pages stay light.
details = {}
for handle in products:
    d = pdp.get(handle) or {}
    rel = d.get("related")
    details[handle] = {
        "description": rewrite_html(products[handle].pop("description")),
        "breadcrumbs": [{"label": b["label"], "href": local_href(b["href"])} for b in d.get("breadcrumbs", [])],
        "modelInfo": d.get("modelInfo", ""),
        "details": rewrite_html(d.get("details", "")),
        "fit": rewrite_html(d.get("fit", "")),
        "fabricCare": rewrite_html(d.get("fabricCare", "")),
        "shippingReturns": rewrite_html(d.get("shippingReturns", "")),
        "bodyMeasurements": d.get("bodyMeasurements") or [],
        "itemMeasurements": d.get("itemMeasurements"),
        "related": {
            "title": rel["title"],
            "href": local_href(rel["href"]) if rel.get("href") else None,
            "handles": [h for h in rel["handles"] if h in products and h != handle],
        } if rel else None,
    }

out_collections = {}
for handle, c in collections.items():
    page = collection_pages.get(handle) or {}
    out_collections[handle] = {
        "handle": handle,
        "title": c["title"],
        "heading": page.get("heading") or c["title"],
        "description": page.get("description") or re.sub(r"<[^>]+>", "", c.get("description") or "").strip(),
        "tabs": [{"label": t["label"], "href": local_href(t["href"])} for t in page.get("tabs", [])],
        "facets": [f["name"] for f in page.get("facets", [])] or ["Category", "Colour", "Size"],
        "products": [h for h in c["products"] if h in products],
    }


def rewrite_section(sec):
    sec = dict(sec)
    if "html" in sec:
        sec["html"] = rewrite_html(sec["html"])
    for key in ("links",):
        if key in sec:
            sec[key] = [dict(l, href=local_href(l.get("href"))) for l in sec[key]]
    if "items" in sec:
        sec["items"] = [dict(i, href=local_href(i.get("href")) if i.get("href") else None, html=rewrite_html(i.get("html", ""))) for i in sec["items"]]
    if sec.get("type") == "html" and sec.get("source") == "rc_featured_collection":
        handles = re.findall(r'href="/products/([^"#?]+)"', sec["html"])
        heading = BeautifulSoup(sec["html"], "lxml").find(["h2", "h3"])
        sec = {"type": "products", "heading": heading.get_text(" ", strip=True) if heading else "",
               "handles": list(dict.fromkeys(h for h in handles if h in products))}
    return sec


def clean_title(t):
    return re.sub(r"\s*\|\s*Reigning Champ.*$", "", t or "").strip()


out_pages = {}
articles = {}
for path, v in raw_pages.items():
    if not v:
        continue
    entry = {"path": path, "title": clean_title(v["title"]), "image": v.get("ogImage"),
             "sections": [rewrite_section(s) for s in v["sections"]]}
    entry["sections"] = [s for s in entry["sections"] if s.get("type") != "cards" or s.get("items")]
    if path.startswith("/blogs/the-intermission/"):
        articles[path.rsplit("/", 1)[1]] = entry
    else:
        out_pages[path.rsplit("/", 1)[1] if path.startswith("/pages/") else path] = entry

blog = {
    "title": "The Intermission",
    "articles": [
        {"handle": b["href"].rsplit("/", 1)[1], "title": articles.get(b["href"].rsplit("/", 1)[1], {}).get("title") or b["title"],
         "image": b["image"]}
        for b in blog_index if b["href"].rsplit("/", 1)[1] in articles
    ],
}
blog["articles"] = [a for a in blog["articles"]]
for handle, art in articles.items():
    art["handle"] = handle
blog_page = out_pages.pop("/blogs/the-intermission", None)

os.makedirs(OUT, exist_ok=True)


def dump(name, data):
    path = os.path.join(OUT, name)
    with open(path, "w") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(name, f"{os.path.getsize(path) / 1024:.0f} KB")


dump("products.json", products)
dump("product-details.json", details)
dump("collections.json", out_collections)
dump("pages.json", out_pages)
dump("blog.json", {**blog, "posts": articles})
dump("aliases.json", {"collections": {k: v for k, v in aliases.items() if v in out_collections}, "pages": PAGE_ALIASES})
