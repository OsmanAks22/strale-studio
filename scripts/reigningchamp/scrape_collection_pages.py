"""Collection page chrome (title, description, sub-category tabs, facet groups) for each snapshot collection."""
import json, sys, time, urllib.request, re
from concurrent.futures import ThreadPoolExecutor
from bs4 import BeautifulSoup
S=sys.argv[1]
H={'User-Agent':'Mozilla/5.0'}
def get(u):
    for i in range(5):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=60).read().decode('utf-8','replace')
        except Exception as e:
            if getattr(e,'code',0)==404: return None
            time.sleep(2**i)
def txt(e): return ' '.join(e.get_text(' ',strip=True).split()) if e else ''
def scrape(h):
    html=get(f'https://reigningchamp.com/collections/{h}')
    if not html: return h,None
    s=BeautifulSoup(html,'lxml'); m=s.select_one('main')
    r={}
    ban=m.select_one('[id*=rc_banner]')
    r['heading']=txt(ban.select_one('h1, h2, .banner__heading')) if ban else ''
    r['description']=txt(ban.select_one('.banner__text, p')) if ban else ''
    r['tabs']=[{'label':txt(a),'href':a.get('href').replace('https://reigningchamp.com','')} for a in m.select('.rc-content-text__list a')]
    facets=[]
    for det in m.select('details[id^="Details-"]'):
        inputs=det.select('input[type=checkbox]')
        if not inputs: continue
        name=txt(det.select_one('summary'))
        vals=[]
        for i in inputs:
            lab=det.select_one(f'label[for="{i.get("id")}"]')
            vals.append({'param':i.get('name'),'value':i.get('value'),'label':txt(lab)})
        facets.append({'name':name,'values':vals})
    seen=set(); r['facets']=[f for f in facets if not (f['name'] in seen or seen.add(f['name']))]
    tiles=[]  # editorial tiles are not reproduced
    for li in m.select('[id*=listing] .content__item, [id*=listing] .collection-content'):
        im=li.select_one('img'); a=li.select_one('a[href]')
        if im: tiles.append({'image':'https:'+im['src'] if im['src'].startswith('//') else im['src'],'href':a.get('href') if a else None})
    r['tiles']=tiles
    return h,r
cols=json.load(open(f'{S}/raw/collections.json'))
import os
out=json.load(open(f"{S}/raw/collection_pages.json")) if os.path.exists(f"{S}/raw/collection_pages.json") else {}
with ThreadPoolExecutor(6) as ex:
    for h,r in ex.map(scrape,[c for c in cols if c not in out]):
        out[h]=r; print(h, r and (r['heading'], len(r['tabs']), [f['name'] for f in r['facets']], len(r['tiles'])), flush=True)
json.dump(out,open(f'{S}/raw/collection_pages.json','w'))
