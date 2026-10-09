import json, sys, time, urllib.request, re, os
from concurrent.futures import ThreadPoolExecutor
from bs4 import BeautifulSoup, NavigableString
S=sys.argv[1]; out=f'{S}/raw/pages.json'
H={'User-Agent':'Mozilla/5.0'}
def get(u):
    for i in range(5):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers=H),timeout=60).read().decode('utf-8','replace')
        except Exception as e:
            if getattr(e,'code',0)==404: return None
            time.sleep(2**i)
    return None
ALLOWED={'p','br','strong','b','em','i','u','a','ul','ol','li','h1','h2','h3','h4','h5','h6','table','thead','tbody','tr','th','td','img','figure','figcaption','blockquote','hr','details','summary','sup','sub'}
DROP={'script','style','svg','link','button','form','input','noscript','template','select','textarea','label','iframe','video','meta'}
def img_src(src):
    if not src: return None
    if src.startswith('//'): src='https:'+src
    src=re.sub(r'&width=\d+','',src)
    return src
def sanitize(el):
    el=BeautifulSoup(str(el),'lxml')
    for t in el.find_all(DROP): t.decompose()
    for t in el.find_all(True):
        if t.name in ('html','body'): continue
        if t.name not in ALLOWED:
            t.unwrap(); continue
        keep={}
        if t.name=='a' and t.get('href'): keep['href']=t['href']
        if t.name=='img':
            keep['src']=img_src(t.get('src')); keep['alt']=t.get('alt','')
        if t.name in ('td','th'):
            for k in ('colspan','rowspan'):
                if t.get(k): keep[k]=t[k]
        if t.get('id') and t.name in ('h1','h2','h3','h4','h5','h6','p','a','li','strong'): keep['id']=t['id']
        t.attrs=keep
    body=el.body or el
    html=''.join(str(c) for c in body.contents)
    html=re.sub(r'\s+',' ',html)
    html=re.sub(r'(<p>\s*(&nbsp;| )?\s*</p>\s*){2,}','<p></p>',html)
    return html.strip()
def text(el): return ' '.join(el.get_text(' ',strip=True).split()) if el else ''
def section(sec):
    sid=sec.get('id','')
    typ=re.sub(r'_[A-Za-z0-9]{6}$','',sid.split('__')[-1]) if '__' in sid else 'main'
    for t in sec(['script','style','link','noscript']): t.decompose()
    if typ=='rc_banner':
        imgs=sec.select('img')
        return {'type':'banner','image':img_src(imgs[0].get('src')) if imgs else None,'mobileImage':img_src(imgs[1].get('src')) if len(imgs)>1 else None,
                'heading':text(sec.select_one('.banner__heading, h1, h2')),'html':sanitize(sec.select_one('.banner__text')) if sec.select_one('.banner__text') else '',
                'links':[{'label':text(a),'href':a.get('href')} for a in sec.select('.banner__buttons a, .banner__content a') if text(a)]}
    if typ=='tabs':
        return {'type':'tabs','links':[{'label':text(a),'href':a.get('href'),'active':a.get('aria-selected')=='true'} for a in sec.select('a.tab__button')]}
    if typ in ('rc_content','multicolumn'):
        items=[]
        for li in sec.select('.content__item, .multicolumn-list__item'):
            im=li.select_one('img'); a=li.select_one('a[href]')
            h=li.select_one('h3, .content__text.subtitle, h2')
            body=li.select_one('.content__text.body--large, .content__text:not(.subtitle), .rte')
            btn=li.select_one('.content__button, .button')
            items.append({'image':img_src(im.get('src')) if im else None,'href':a.get('href') if a else None,'title':text(h),'html':sanitize(body) if body else '','button':text(btn) if btn else ''})
        heading=sec.select_one('.section__header h2, .title')
        return {'type':'cards','heading':text(heading),'items':items}
    if typ=='collapsible_content':
        return {'type':'accordion','heading':text(sec.select_one('.collapsible-content__heading, h2')),'items':[{'title':text(d.select_one('summary')),'html':sanitize(d.select_one('.accordion__content'))} for d in sec.select('details')]}
    if typ in ('rich_text',):
        hd=sec.select_one('.rich-text__heading'); tx=sec.select_one('.rich-text__text')
        btns=[{'label':text(a),'href':a.get('href')} for a in sec.select('.rich-text__buttons a')]
        hasform=bool(sec.select('form'))
        return {'type':'richText','heading':text(hd),'html':sanitize(tx) if tx else '','links':btns,'form':hasform}
    hasform=bool(sec.select('form'))
    return {'type':'html','source':typ,'html':sanitize(sec),'form':hasform}
def scrape(path):
    html=get('https://reigningchamp.com'+path)
    if html is None: return path,None
    s=BeautifulSoup(html,'lxml')
    title=s.title.get_text(strip=True) if s.title else ''
    m=s.select_one('main')
    secs=[section(x) for x in m.select(':scope > [id^=shopify-section]')]
    secs=[x for x in secs if x and (x.get('html') or x.get('items') or x.get('links') or x.get('image') or x.get('heading'))]
    links=sorted(set(a.get('href').split('#')[0].split('?')[0].replace('https://reigningchamp.com','') for a in m.select('a[href]') if a.get('href')))
    og=s.select_one('meta[property="og:image"]')
    return path,{'title':title,'sections':secs,'links':links,'ogImage':og.get('content') if og else None}
paths=[l.strip() for l in open(f'{S}/data/pages.txt') if l.strip()]
res={}
def run(ps):
    with ThreadPoolExecutor(6) as ex:
        for p,r in ex.map(scrape,ps): res[p]=r; print(p, 'ok' if r else 'MISS', len(r['sections']) if r else '', flush=True)
run(paths)
# blog listing pages
blog=[]
for n in range(1,15):
    h=get(f'https://reigningchamp.com/blogs/the-intermission?page={n}')
    if not h: break
    s=BeautifulSoup(h,'lxml')
    arts=[]
    for a in s.select('main a[href*="/blogs/the-intermission/"]'):
        hr=a['href'].split('?')[0]
        if hr not in [x['href'] for x in arts]+[x['href'] for x in blog]:
            card=a.find_parent(['article','li','div'])
            im=card.select_one('img') if card else None
            arts.append({'href':hr,'title':text(a) ,'image':img_src(im.get('src')) if im else None})
    arts=[x for x in arts]
    if not arts: break
    blog+=arts
# merge titles
seen={}
for b in blog:
    if b['href'] not in seen: seen[b['href']]=b
    elif b['title'] and not seen[b['href']]['title']: seen[b['href']]['title']=b['title']
    if b['image'] and not seen[b['href']]['image']: seen[b['href']]['image']=b['image']
blog=list(seen.values())
print('articles', len(blog))
res['__blog__']=blog
run([b['href'] for b in blog])
# one more round: linked /pages/* not yet scraped
extra=sorted({l for v in res.values() if isinstance(v,dict) for l in v.get('links',[]) if l.startswith('/pages/') and l not in res})
print('extra pages', extra)
run(extra)
json.dump(res,open(out,'w'))
