"""依 data/products.json、data/markets.json 把商品卡與出攤日程直接寫進 HTML
（讓 Google 不必跑 JS 就讀得到內容）。只替換 <!--xxx:yyy--> 與 <!--/xxx:yyy--> 之間的內容。
出攤日程以「執行當天」分成即將出攤／走過的市集；頁面上的 JS 會再依瀏覽當天重新判斷。"""
import datetime as dt
import json
import re
from html import escape

TODAY = dt.date.today()
HOME_MARKETS = 4   # 首頁「近期出攤」顯示幾筆（index.html 的 slice(0, 4) 要一起改）
IMG = '../image/acake/'

with open('data/products.json', encoding='utf-8') as f:
    P = json.load(f)
with open('data/markets.json', encoding='utf-8') as f:
    M = json.load(f)


def esc(s):
    return escape('' if s is None else str(s))


STATUS = {'regular': '常態供應', 'seasonal': '季節限定', 'ended': '本季已結束'}
PLUS = ('<svg class="plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
        '<svg class="ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>')


def img(im, sizes, alt, lazy=True):
    """響應式圖片：原圖寬超過 1.15 倍才提供 480／960 縮圖（和 process_images.py 一致）"""
    W = int(im.get('width') or 0)
    src = im['src']
    srcset = [f'{IMG}{t}/{src} {t}w' for t in (480, 960) if W > t * 1.15]
    attr = ''
    if srcset:
        srcset.append(f'{IMG}{src} {W}w')
        attr = f' srcset="{esc(", ".join(srcset))}" sizes="{sizes}" onerror="this.onerror=null;this.removeAttribute(\'srcset\')"'
    return (f'<img src="{IMG}{esc(src)}"{attr} alt="{esc(alt)}" width="{W or ""}" height="{im.get("height") or ""}"'
            + (' loading="lazy"' if lazy else '') + '>')


def tag(p):
    s = p.get('status', 'regular')
    return f'<span class="ac_tag{"" if s == "regular" else " is-" + s}">{STATUS[s]}</span>'


def price(p):
    return f'<span class="ac_price">{esc(p["price"])}</span>' if p.get('price') else '<span class="ac_price is-ask">價格請私訊</span>'


def via(p):
    """購買方式：7-11 有上架 → 可直接下單；沒有 → 需私訊預訂（已結束的不標）"""
    if p.get('status') == 'ended':
        return ''
    return ('<span class="ac_via is-shop">7-11 可直接下單</span>' if p.get('myship')
            else '<span class="ac_via">需私訊預訂</span>')


def card(p, sizes, el='li', extra=''):
    s = p.get('status', 'regular')
    return (f'<{el} class="ac_prod{" is-ended" if s == "ended" else ""}" data-cat="{esc(p["category"])}" data-status="{esc(s)}"{extra}>'
            f'<figure>{img(p["images"][0], sizes, p["name"])}{tag(p)}</figure>'
            f'<button class="ac_prod_open" type="button" data-prod="{esc(p["id"])}" aria-label="查看「{esc(p["name"])}」詳情"></button>'
            f'<div class="ac_prod_txt"><em>{esc(p["en"])}</em><h3>{esc(p["name"])}</h3><p>{esc(p.get("summary"))}</p>{via(p)}'
            f'<div class="ac_prod_foot">{price(p)}<button class="ac_add" type="button" data-add="{esc(p["id"])}" aria-label="加入私訊清單：{esc(p["name"])}">{PLUS}</button></div></div></{el}>')


def block(items, indent):
    pad = ' ' * indent
    return '\n' + ''.join(pad + i + '\n' for i in items) + pad[:-4] if items else ''


def data_json():
    """頁面 JS 用的精簡資料（抽屜、私訊小幫手）"""
    keep = ('id', 'name', 'en', 'category', 'status', 'myship', 'price', 'summary', 'desc', 'specs', 'instagram', 'images')
    d = {'categories': P['categories'], 'flavors': P['flavors'],
         'products': [{k: p.get(k) for k in keep} for p in P['products']]}
    return json.dumps(d, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def put(path, parts):
    with open(path, encoding='utf-8', newline='') as f:
        src = f.read()
    out = src
    for key, html in parts.items():
        pat = re.compile(rf'(<!--{key}-->).*?(<!--/{key}-->)', re.S)
        if not pat.search(out):
            raise SystemExit(f'{path} 找不到 <!--{key}--> 標記')
        out = pat.sub(lambda m: m.group(1) + html + m.group(2), out, count=1)
    if out != src:
        with open(path, 'w', encoding='utf-8', newline='') as f:
            f.write(out)
        print('已更新', path)


# ---------- 出攤日程 ----------
WD = '一二三四五六日'


def d(s):
    return dt.date.fromisoformat(s) if s else None


markets = []
for m in M['markets']:
    s, e = d(m['start']), d(m.get('end')) or d(m['start'])
    markets.append(dict(m, _s=s, _e=e))
upcoming = sorted([m for m in markets if m['_e'] >= TODAY], key=lambda m: m['_s'])
past = sorted([m for m in markets if m['_e'] < TODAY], key=lambda m: m['_s'], reverse=True)


def mdate(m):
    s, e = m['_s'], m['_e']
    a = f'{s.month}.{s.day:02d}'
    b = '' if e == s else (f'{e.day:02d}' if e.month == s.month else f'{e.month}.{e.day:02d}')
    wd = f'週{WD[s.weekday()]}' + ('' if e == s else f'–{WD[e.weekday()]}')
    return a, b, wd


def mk_card(m):
    a, b, wd = mdate(m)
    meta = '・'.join(x for x in (m.get('place'), m.get('hours')) if x)
    return (f'<li class="ac_mk" data-start="{m["_s"]}" data-end="{m["_e"]}">'
            f'<div class="ac_mk_date"><b>{a}</b>{"<span>– " + b + "</span>" if b else ""}<i>{wd}</i></div>'
            f'<div class="ac_mk_txt"><span class="ac_mk_city">{esc(m["city"])}</span><h3>{esc(m["name"])}</h3><p>{esc(meta)}</p>'
            + (f'<small>{esc(m["note"])}</small>' if m.get('note') else '') +
            '</div><span class="ac_mk_when" aria-hidden="true"></span></li>')


def mk_row(m):
    a, b, _ = mdate(m)
    return (f'<li data-start="{m["_s"]}" data-end="{m["_e"]}"><time datetime="{m["_s"]}">{m["_s"].year}.{a}{" – " + b if b else ""}</time>'
            f'<b>{esc(m["name"])}</b><span>{esc(m["city"])}・{esc(m.get("place"))}</span></li>')


def mk_data():
    keep = ('name', 'city', 'place', 'start', 'end', 'hours', 'note')
    return json.dumps([{k: m.get(k, '') for k in keep} for m in M['markets']], ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def mk_opts():
    return ''.join(f'<option value="{esc(mdate(m)[0] + " " + m["city"] + "｜" + m["name"])}">{esc(mdate(m)[0])}　{esc(m["city"])}｜{esc(m["name"])}</option>' for m in upcoming)


# ---------- 輸出 ----------
prods = P['products']
cats = P['categories']
filters = ['<li><button type="button" data-filter="all" aria-pressed="true"><span>全部</span><sup></sup></button></li>'] + [
    f'<li><button type="button" data-filter="{esc(c["id"])}" aria-pressed="false"><span>{esc(c["name"])}</span><sup></sup></button></li>' for c in cats]

groups = []
for g in dict.fromkeys(f['group'] for f in P['flavors']):
    names = ''.join(f'<li>{esc(f["name"])}</li>' for f in P['flavors'] if f['group'] == g)
    groups.append(f'<div class="acp_c_grp"><h3>{esc(g)}</h3><ul>{names}</ul></div>')

ld = {
    '@context': 'https://schema.org', '@type': 'ItemList', 'name': 'A. cake 商品',
    'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'item': {
        '@type': 'Product', 'name': p['name'], 'description': p.get('summary', ''),
        'image': 'https://po8621l124.github.io/acake999/image/acake/' + p['images'][0]['src'],
        'brand': {'@type': 'Brand', 'name': 'A. cake'}}} for i, p in enumerate(prods)]}

put('html/products.html', {
    'products:filter': ''.join(filters),
    'products:count': str(len(prods)),
    'products:grid': block([card(p, '(max-width: 576px) 50vw, (max-width: 1024px) 33vw, 25vw') for p in prods], 16),
    'products:flavors': block(groups, 16),
    'products:data': data_json(),
    'products:ld': json.dumps(ld, ensure_ascii=False),
})

feat = [card(p, '(max-width: 768px) 70vw, 320px', 'article') for p in prods if p.get('featured')]
put('html/index.html', {
    'products:featured': block(feat, 16),
    'products:data': data_json(),
    'markets:next': block([mk_card(m) for m in upcoming[:HOME_MARKETS]], 16),
    'markets:data': mk_data(),
})

put('html/markets.html', {
    'markets:upcoming': block([mk_card(m) for m in upcoming], 16),
    'markets:past': block([mk_row(m) for m in past], 16),
    'markets:data': mk_data(),
})

put('html/order.html', {
    'products:data': data_json(),
    'markets:options': mk_opts(),
    'markets:data': mk_data(),
})
