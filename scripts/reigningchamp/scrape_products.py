import json, sys, time, urllib.request, os, re
from concurrent.futures import ThreadPoolExecutor
from bs4 import BeautifulSoup
S=sys.argv[1]; handles_file=sys.argv[2]; out=sys.argv[3]
H={'User-Agent':'Mozilla/5.0'}
def get(u):
    for i in range(5):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=60).read().decode('utf-8','replace')
        except Exception as e:
            if getattr(e,'code',0)==404: return None
            time.sleep(2**i)
    return None
def clean_html(el):
    if el is None: return ''
    for t in el(['script','style','svg','button']): t.decompose()
    for t in el.find_all(True):
        for a in list(t.attrs):
            if a not in ('href',): del t.attrs[a]
    return ''.join(str(c) for c in el.contents).strip()
def measures(block):
    rows=[]
    if block is None: return rows
    for m in block.select('.size-guide__body-measures'):
        lab=m.select_one('label')
        if not lab: continue
        vals={}
        for d in m.select('.size-guide__body-measure'):
            if d.get('data-unit')!='in': continue
            vals[d['data-size']]=[s.get('data-initial-measurement') for s in d.select('span')]
        rows.append({'label':lab.get_text(strip=True),'values':vals})
    return rows
def item_table(block):
    if block is None: return None
    t=block.select_one('table')
    if t is None: return None
    rows=[[c.get_text(' ',strip=True) for c in tr.select('th,td')] for tr in t.select('tr')]
    return rows
def scrape(h):
    html=get(f'https://reigningchamp.com/products/{h}')
    if html is None: return h, None
    s=BeautifulSoup(html,'lxml')
    r={}
    bc=s.select_one('.breadcrumbs--product .breadcrumbs-list') or s.select_one('.breadcrumbs-list')
    r['breadcrumbs']=[{'label':a.get_text(strip=True),'href':a.get('href')} for a in (bc.select('a') if bc else [])]
    mi=s.select_one('.product__model-info'); r['modelInfo']=mi.get_text(' ',strip=True) if mi else ''
    for key,idp in [('details','Tab-details-'),('fit','Tab-fit-'),('fabricCare','Tab-fabric-and-care-'),('shippingReturns','Tab-shipping-returns-')]:
        el=s.select_one(f'[id^="{idp}"]'); r[key]=clean_html(el)
    sg=s.select_one('size-guide')
    r['bodyMeasurements']=measures(sg.select_one('.size-guide__body') if sg else None)
    # item measurements: inches table
    im=None
    if sg:
        tb=sg.select_one('.size-guide__measurements .size-guide__table')
        if tb:
            keys=[k.get_text(strip=True) for k in tb.select('.size-guide__keys .size-guide__key')][1:]
            rows=[]
            for c in tb.select('.size-guide__class'):
                k=c.select_one('.size-guide__key')
                rows.append([k.get_text(strip=True) if k else '']+[m.get_text(strip=True) for m in c.select('.size-guide__measurement[data-unit="in"]')])
            im={'keys':keys,'rows':rows}
    r['itemMeasurements']=im
    # related section "More X" with view all link
    rel=None
    for sec in s.select('.rc-featured-content'):
        h2=sec.select_one('h2')
        if h2 and h2.get_text(strip=True).lower().startswith('more'):
            a=sec.select_one('a[href*="/collections/"]')
            rel={'title':h2.get_text(strip=True),'href':a.get('href') if a else None,'handles':list(dict.fromkeys(x.get('href').split('/products/')[1].split('?')[0] for x in sec.select('a[href*="/products/"]')))}
            break
    r['related']=rel
    others=[]
    for lab in s.select('.product__info-container [class*=other]'):
        pass
    return h, r
handles=json.load(open(handles_file))
res=json.load(open(out)) if os.path.exists(out) else {}
todo=[h for h in handles if h not in res]
print('todo',len(todo), flush=True)
with ThreadPoolExecutor(8) as ex:
    for n,(h,r) in enumerate(ex.map(scrape,todo)):
        res[h]=r
        if n%50==0:
            print(n, h, flush=True); json.dump(res,open(out,'w'))
json.dump(res,open(out,'w'))
print('done', len(res), sum(1 for v in res.values() if v is None))
