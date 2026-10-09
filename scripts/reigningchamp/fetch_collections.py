"""Snapshot Shopify collections (products.json) for the handles listed in a text file.

usage: python3 fetch_collections.py <workdir> <handles.txt>
Merges into <workdir>/raw/collections.json and <workdir>/raw/products.json.
"""
import json, sys, time, urllib.request, os
S=sys.argv[1]; handles=open(sys.argv[2]).read().split()
H={'User-Agent':'Mozilla/5.0'}
def get(u):
    for i in range(5):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=60).read()
        except Exception as e:
            if getattr(e,'code',0)==404: return None
            time.sleep(2**i)
    raise SystemExit('fail '+u)
cp=f'{S}/raw/collections.json'; pp=f'{S}/raw/products.json'
cols=json.load(open(cp)) if os.path.exists(cp) else {}
allp=json.load(open(pp)) if os.path.exists(pp) else {}
meta={c['handle']:c for c in json.loads(get('https://reigningchamp.com/collections.json?limit=250'))['collections']}
for h in handles:
    if h in cols: continue
    prods=[]; page=1
    while True:
        raw=get(f'https://reigningchamp.com/collections/{h}/products.json?limit=250&page={page}')
        if raw is None: break
        d=json.loads(raw)['products']; prods+=d
        if len(d)<250: break
        page+=1
    cols[h]={'title':meta.get(h,{}).get('title',h),'description':meta.get(h,{}).get('description',''),'products':[p['handle'] for p in prods]}
    for p in prods: allp.setdefault(p['handle'],p)
    print(h, len(prods), cols[h]['title'], flush=True)
json.dump(cols,open(cp,'w')); json.dump(allp,open(pp,'w'))
print('collections',len(cols),'products',len(allp))
