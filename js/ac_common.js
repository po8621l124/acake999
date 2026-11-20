/* A. CAKE 共通互動：header、浮動聯絡鈕、輪播、標題斷行；私訊清單、商品抽屜、市集日期 */
(function () {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var body = document.body;
    var header = document.querySelector('.ac_header');

    /* ---------- Header：捲動後縮小 ---------- */
    function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 30); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- 輪播 .ac_car：箭頭（可放在頁面任何位置，用 aria-controls 對應）、頁碼圓點、滑鼠拖曳 ---------- */
    [].forEach.call(document.querySelectorAll('.ac_car'), function (car) {
        var track = car.querySelector('.ac_car_track'); if (!track) return;
        var dotsEl = car.querySelector('.ac_car_dots');
        var prev = document.querySelector('.ac_arw.prev[aria-controls="' + track.id + '"]') || car.querySelector('.ac_arw.prev');
        var next = document.querySelector('.ac_arw.next[aria-controls="' + track.id + '"]') || car.querySelector('.ac_arw.next');
        function pageW() { return track.clientWidth; }
        function pages() { return Math.max(1, Math.ceil((track.scrollWidth - 4) / pageW())); }
        function drawDots() {
            if (!dotsEl) return;
            var n = pages(); dotsEl.innerHTML = '';
            if (n < 2) return;
            for (var i = 0; i < n; i++) (function (i) {
                var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', '第 ' + (i + 1) + ' 頁');
                b.addEventListener('click', function () { track.scrollTo({ left: i * pageW(), behavior: reduce ? 'auto' : 'smooth' }); });
                dotsEl.appendChild(b);
            })(i);
        }
        function update() {
            var max = track.scrollWidth - track.clientWidth;
            var atS = track.scrollLeft <= 2, atE = track.scrollLeft >= max - 2;
            track.classList.toggle('is-start', atS); track.classList.toggle('is-end', atE);
            if (prev) prev.disabled = atS;
            if (next) next.disabled = atE;
            if (dotsEl) {
                var cur = atE ? dotsEl.children.length - 1 : Math.round(track.scrollLeft / pageW());
                [].forEach.call(dotsEl.children, function (d, i) { d.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
            }
        }
        function step() { var c = track.children[0]; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 24) : 300; }
        if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
        if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
        track.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', function () { drawDots(); update(); });
        drawDots(); update();
        /* 滑鼠拖曳 */
        var down = false, sx = 0, sl0 = 0, moved = false;
        track.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl0 = track.scrollLeft; });
        window.addEventListener('pointermove', function (e) {
            if (!down) return;
            var dx = e.clientX - sx;
            if (Math.abs(dx) > 5) { moved = true; track.classList.add('is-drag'); }
            if (moved) track.scrollLeft = sl0 - dx;
        });
        window.addEventListener('pointerup', function () { if (!down) return; down = false; setTimeout(function () { track.classList.remove('is-drag'); }, 0); });
        track.addEventListener('dragstart', function (e) { e.preventDefault(); });
    });

    /* ---------- 浮動聯絡按鈕：點開小卡，點外面或 Esc 收起 ---------- */
    (function () {
        var fab = document.querySelector('.ac_fab'); if (!fab) return;
        var btn = fab.querySelector('.ac_fab_btn'), card = fab.querySelector('.ac_fab_card');
        card.inert = true;
        function set(open) {
            fab.classList.toggle('is-open', open);
            btn.setAttribute('aria-expanded', open);
            card.inert = !open;
            if (open) { var a = card.querySelector('a'); if (a) setTimeout(function () { a.focus({ preventScroll: true }); }, 150); }
        }
        btn.addEventListener('click', function () { set(!fab.classList.contains('is-open')); });
        document.addEventListener('click', function (e) { if (fab.classList.contains('is-open') && !fab.contains(e.target)) set(false); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && fab.classList.contains('is-open')) { set(false); btn.focus(); } });
        [].forEach.call(card.querySelectorAll('a'), function (a) { a.addEventListener('click', function () { set(false); }); });
    })();

    /* ---------- 標題斷行：依「｜」分段，每段不從中間斷開 ---------- */
    window.acSegment = function (el) {
        if (!el || el.children.length || el.textContent.indexOf('｜') < 0) return;
        var parts = el.textContent.split('｜');
        el.textContent = '';
        parts.forEach(function (t, i) {
            var s = document.createElement('span'); s.className = 'ac_s'; s.textContent = t.trim() + (i < parts.length - 1 ? '｜' : '');
            el.appendChild(s);
        });
    };
    [].forEach.call(document.querySelectorAll('.hs_box h1, .hs_box h2, .hs_box h3'), window.acSegment);

    /* 需要時才載入外掛（Leaflet、PhotoSwipe），同一支只載一次 */
    var loaded = {};
    window.acLoad = function (js, css) {
        if (css && !document.querySelector('link[href="' + css + '"]')) {
            var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = css; document.head.appendChild(l);
        }
        return loaded[js] || (loaded[js] = new Promise(function (ok, ng) {
            var s = document.createElement('script'); s.src = js; s.onload = ok; s.onerror = function () { delete loaded[js]; ng(); };
            document.head.appendChild(s);
        }));
    };

    /* 讀頁面內的 JSON 資料（去掉 render.py 的標記註解） */
    window.acJson = function (el) { return el.textContent.replace(/<!--\/?[\w:]+-->/g, ''); };

    /* ---------- 市集卡：依今天日期標示「進行中／倒數 N 天」 ---------- */
    window.acToday = function () { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
    window.acDate = function (s) { var p = String(s).split('-'); return new Date(+p[0], p[1] - 1, +p[2]); };
    window.acMarketWhen = function (root) {
        var t = window.acToday();
        [].forEach.call((root || document).querySelectorAll('.ac_mk[data-start]'), function (li) {
            var s = window.acDate(li.getAttribute('data-start')), e = window.acDate(li.getAttribute('data-end') || li.getAttribute('data-start'));
            var days = Math.round((s - t) / 864e5), txt = '';
            li.classList.remove('is-now', 'is-soon');
            if (t >= s && t <= e) { txt = '出攤中'; li.classList.add('is-now'); }
            else if (days === 1) { txt = '明天見'; li.classList.add('is-soon'); }
            else if (days > 1 && days <= 7) { txt = '倒數 ' + days + ' 天'; li.classList.add('is-soon'); }
            else if (days > 7) txt = days + ' 天後';
            var w = li.querySelector('.ac_mk_when'); if (w) w.textContent = txt;
        });
    };
    /* 依瀏覽當天重新分組（render.py 寫進 HTML 的版本以「建置當天」為準，可能已過期） */
    window.acMarkets = function () {
        var el = document.getElementById('ac_markets'); if (!el) return null;
        var t = window.acToday(), list = JSON.parse(window.acJson(el)).map(function (m) {
            m._s = window.acDate(m.start); m._e = m.end ? window.acDate(m.end) : m._s; return m;
        });
        return {
            upcoming: list.filter(function (m) { return m._e >= t; }).sort(function (a, b) { return a._s - b._s; }),
            past: list.filter(function (m) { return m._e < t; }).sort(function (a, b) { return b._s - a._s; })
        };
    };
    var WD = '日一二三四五六';
    function p2(n) { return (n < 10 ? '0' : '') + n; }
    window.acMkDate = function (m) {
        var s = m._s, e = m._e, same = +s === +e;
        return {
            a: (s.getMonth() + 1) + '.' + p2(s.getDate()),
            b: same ? '' : (e.getMonth() === s.getMonth() ? p2(e.getDate()) : (e.getMonth() + 1) + '.' + p2(e.getDate())),
            wd: '週' + WD[s.getDay()] + (same ? '' : '–' + WD[e.getDay()])
        };
    };
    function ymd(d) { return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
    window.acMkCard = function (m) {
        var d = window.acMkDate(m), e = window.acEsc;
        var meta = [m.place, m.hours].filter(Boolean).join('・');
        return '<li class="ac_mk" data-start="' + ymd(m._s) + '" data-end="' + ymd(m._e) + '"><div class="ac_mk_date"><b>' + d.a + '</b>' + (d.b ? '<span>– ' + d.b + '</span>' : '') + '<i>' + d.wd + '</i></div>' +
            '<div class="ac_mk_txt"><span class="ac_mk_city">' + e(m.city) + '</span><h3>' + e(m.name) + '</h3><p>' + e(meta) + '</p>' + (m.note ? '<small>' + e(m.note) + '</small>' : '') + '</div><span class="ac_mk_when" aria-hidden="true"></span></li>';
    };
    window.acMkRow = function (m) {
        var d = window.acMkDate(m), e = window.acEsc;
        return '<li data-start="' + ymd(m._s) + '"><time datetime="' + ymd(m._s) + '">' + m._s.getFullYear() + '.' + d.a + (d.b ? ' – ' + d.b : '') + '</time><b>' + e(m.name) + '</b><span>' + e(m.city) + '・' + e(m.place) + '</span></li>';
    };

    /* =========================================================
       私訊清單（存在瀏覽器 localStorage，只是幫客人整理私訊內容，不是購物車、不會送出）
       ========================================================= */
    var IMG = '../image/acake/';
    /* 原圖寬超過 1.15 倍才有縮圖（和 process_images.py 一致） */
    window.acImg = function (im, t) { return im && im.width > t * 1.15 ? IMG + t + '/' + im.src : IMG + (im ? im.src : ''); };

    /* 價格：規格選項／司康口味的單價，或只有一個價格的商品（「NT$ 135」）。不知道就回傳 null */
    window.acMoney = function (n) { return 'NT$ ' + Math.round(n).toLocaleString('en-US'); };
    window.acOpts = function (p) { return (p && p.options || []).filter(function (o) { return o && o.name; }); };
    function num(v) { return typeof v === 'number' && isFinite(v) && v > 0 ? v : null; }
    window.acUnit = function (it) {
        var D = window.AC_DATA, p = D && D.products.filter(function (x) { return x.id === it.id; })[0];
        if (!p) return num(it.price);
        if (it.opt) {
            var src = p.id === 'classic' ? D.flavors : window.acOpts(p);
            var o = src.filter(function (x) { return x.name === it.opt; })[0];
            return o ? num(o.price) : null;
        }
        var m = /^NT\$\s*([\d,]+)$/.exec(String(p.price || '').trim());
        return m ? +m[1].replace(/,/g, '') : null;
    };
    /* 清單裡的小字：規格＋單價 */
    window.acOptLine = function (it) {
        var u = window.acUnit(it);
        return [it.opt, u ? window.acMoney(u) : ''].filter(Boolean).join('・');
    };

    var KEY = 'ac_bag_v1', subs = [];
    function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
    function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }
    var bag = load();
    function emit() { save(bag); subs.forEach(function (f) { f(bag); }); }
    window.acBag = {
        items: function () { return bag.slice(); },
        count: function () { return bag.reduce(function (n, it) { return n + it.qty; }, 0); },
        qty: function (key) { var it = bag.filter(function (x) { return x.key === key; })[0]; return it ? it.qty : 0; },
        add: function (it, n) {
            var key = it.id + (it.opt ? '|' + it.opt : '');
            var cur = bag.filter(function (x) { return x.key === key; })[0];
            if (cur) cur.qty = Math.min(99, cur.qty + (n || 1));
            else bag.push({ key: key, id: it.id, name: it.name, opt: it.opt || '', img: it.img || '', price: num(it.price), qty: n || 1 });
            emit();
        },
        set: function (key, n) {
            bag = bag.map(function (x) { if (x.key === key) x.qty = Math.max(0, Math.min(99, n)); return x; }).filter(function (x) { return x.qty > 0; });
            emit();
        },
        remove: function (key) { bag = bag.filter(function (x) { return x.key !== key; }); emit(); },
        clear: function () { bag = []; emit(); },
        on: function (f) { subs.push(f); f(bag); }
    };
    /* 其他分頁改了清單，這頁同步 */
    window.addEventListener('storage', function (e) { if (e.key === KEY) { bag = load(); subs.forEach(function (f) { f(bag); }); } });

    /* ---------- 抽屜開關（共用滑入／滑出動畫） ---------- */
    window.acOpen = function (dw) { dw.classList.remove('is-closing'); if (!dw.open) dw.showModal(); };
    window.acClose = function (dw) {
        if (!dw.open || dw.classList.contains('is-closing')) return;
        if (reduce) { dw.close(); return; }
        dw.classList.add('is-closing');
        setTimeout(function () { dw.classList.remove('is-closing'); dw.close(); }, 430);
    };
    function wireDrawer(dw) {
        dw.addEventListener('cancel', function (e) { e.preventDefault(); if (!dw.querySelector('.pswp')) window.acClose(dw); });   /* 照片放大中按 Esc 只關放大 */
        dw.addEventListener('click', function (e) { if (e.target === dw) window.acClose(dw); });
        var x = dw.querySelector('.ac_dw_close');
        if (x) x.addEventListener('click', function () { window.acClose(dw); });
    }

    /* ---------- 清單抽屜 ---------- */
    var bagDw = document.querySelector('.ac_bag');
    var bagBtns = [].slice.call(document.querySelectorAll('[data-bag]'));
    var toast = document.querySelector('.ac_toast');
    function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
    window.acEsc = esc;
    function qtyHtml(q, cls) {
        return '<div class="ac_qty ' + (cls || '') + '"><button type="button" data-d="-1" aria-label="減少">−</button><output>' + q + '</output><button type="button" data-d="1" aria-label="增加"' + (q >= 99 ? ' disabled' : '') + '>+</button></div>';
    }
    window.acQtyHtml = qtyHtml;
    if (bagDw) {
        wireDrawer(bagDw);
        var list = bagDw.querySelector('.ac_bag_list'), empty = bagDw.querySelector('.ac_bag_empty'), go = bagDw.querySelector('.ac_bag_go');
        window.acBag.on(function (items) {
            list.innerHTML = items.map(function (it) {
                return '<li data-key="' + esc(it.key) + '"><img src="' + esc(it.img) + '" alt="" width="64" height="64" loading="lazy"><div><b>' + esc(it.name) + '</b>' + (window.acOptLine(it) ? '<small>' + esc(window.acOptLine(it)) + '</small>' : '') + '</div>' +
                    '<div class="ac_bag_r">' + qtyHtml(it.qty, 'sm') + '<button class="ac_bag_del" type="button">移除</button></div></li>';
            }).join('');
            empty.hidden = items.length > 0;
            go.hidden = items.length === 0;
            var n = window.acBag.count();
            bagBtns.forEach(function (btn) {
                btn.querySelector('b').textContent = n;
                btn.classList.toggle('has-item', n > 0);
                btn.setAttribute('aria-label', '私訊清單（' + n + ' 件）');
            });
        });
        list.addEventListener('click', function (e) {
            var li = e.target.closest('li'); if (!li) return;
            var key = li.getAttribute('data-key');
            var b = e.target.closest('[data-d]');
            if (b) window.acBag.set(key, window.acBag.qty(key) + (+b.getAttribute('data-d')));
            if (e.target.closest('.ac_bag_del')) window.acBag.remove(key);
        });
        bagBtns.forEach(function (btn) { btn.addEventListener('click', function () { window.acOpen(bagDw); }); });
        /* 在訂購頁按「整理成私訊文字」：直接關抽屜捲到小幫手 */
        go.addEventListener('click', function (e) {
            if (page === 'order.html') { e.preventDefault(); window.acClose(bagDw); var t = document.getElementById('helper'); if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
        });
    }
    var page = location.pathname.split('/').pop() || 'index.html';

    /* 加入後提示 */
    var tTimer;
    window.acToast = function (msg, withBtn) {
        if (!toast) return;
        toast.querySelector('span').textContent = msg;
        toast.querySelector('button').hidden = !withBtn;
        toast.classList.add('is-show');
        clearTimeout(tTimer);
        tTimer = setTimeout(function () { toast.classList.remove('is-show'); }, 3200);
    };
    if (toast) toast.querySelector('button').addEventListener('click', function () { toast.classList.remove('is-show'); if (bagDw) window.acOpen(bagDw); });
    function bump() { if (reduce) return; bagBtns.forEach(function (b) { b.classList.remove('is-bump'); void b.offsetWidth; b.classList.add('is-bump'); }); }

    /* =========================================================
       商品詳情抽屜：頁面有 <script id="ac_data" type="application/json"> 才啟用
       觸發：[data-prod="id"] 開啟詳情、[data-add="id"] 直接加入清單
       ========================================================= */
    var dataEl = document.getElementById('ac_data');
    if (!dataEl) return;
    var DATA = JSON.parse(window.acJson(dataEl));
    var byId = {};
    DATA.products.forEach(function (p) { byId[p.id] = p; });
    var STATUS = { regular: '常態供應', seasonal: '季節限定', ended: '本季已結束' };
    window.AC_DATA = DATA;

    function addProduct(p, n, opt) {
        var it = { id: p.id, name: p.name, opt: opt, img: window.acImg(p.images[0], 480) };
        it.price = window.acUnit(it);
        window.acBag.add(it, n);
        bump();
        var first = window.acBag.count() === n;
        window.acToast(first ? '已加入私訊清單（不是購物車，最後整理成訊息傳給 A娜）' : '已加入：' + p.name + (opt ? '・' + opt : '') + ' × ' + n, true);
    }

    var dw = document.createElement('dialog');
    dw.className = 'ac_dw ac_pdw';
    dw.setAttribute('aria-labelledby', 'ac_pdw_h');
    dw.innerHTML =
        '<div class="ac_dw_in">' +
            '<button class="ac_dw_close" type="button" aria-label="關閉">' + window.AC_ICONS.close + '</button>' +
            '<div class="ac_dw_body">' +
                '<div class="ac_dw_gal"><button class="ac_dw_zoom" type="button" aria-label="放大照片"><img src="" alt="" width="600" height="600"><i aria-hidden="true"></i></button></div>' +
                '<div class="ac_dw_thumbs"></div>' +
                '<div class="ac_dw_txt"></div>' +
            '</div>' +
            '<div class="ac_dw_foot"></div>' +
        '</div>';
    (document.querySelector('.hs_box') || document.body).appendChild(dw);
    wireDrawer(dw);
    var gImg = dw.querySelector('.ac_dw_gal img'), thumbs = dw.querySelector('.ac_dw_thumbs'), txt = dw.querySelector('.ac_dw_txt'), foot = dw.querySelector('.ac_dw_foot'), body = dw.querySelector('.ac_dw_body');
    var curP = null, curQ = 1, curI = 0;   /* 7-11 有賣的商品，抽屜裡不放數量（數量在賣貨便選） */

    function setImg(i) {
        var im = curP.images[i]; curI = i;
        var go = function () { gImg.src = window.acImg(im, 960); gImg.alt = curP.name; gImg.classList.remove('is-swap'); };
        if (reduce || !gImg.getAttribute('src')) go(); else { gImg.classList.add('is-swap'); setTimeout(go, 200); }
        [].forEach.call(thumbs.children, function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    }
    /* 口味／規格膠囊：點一下加一份，數量顯示在膠囊上 */
    function chipsHtml() {
        var list = curP.id === 'classic' ? DATA.flavors : window.acOpts(curP);
        return list.map(function (f) {
            var q = window.acBag.qty(curP.id + '|' + f.name), pr = typeof f.price === 'number' && f.price > 0 ? window.acMoney(f.price) : '';
            return '<button class="ac_chip' + (q ? ' is-on' : '') + '" type="button" data-flv="' + esc(f.name) + '"><span>' + esc(f.name) + (pr ? '<i>' + pr + '</i>' : '') + '</span><b>' + q + '</b></button>';
        }).join('');
    }
    function hasChips(p) { return p.id === 'classic' || window.acOpts(p).length > 0; }
    function renderFoot() {
        if (curP.status === 'ended') {
            foot.innerHTML = '<a class="ac_btn" href="' + window.AC_LINKS.ig + '" target="_blank" rel="noopener"><span>本季已結束・追蹤 IG 等下一檔</span><i></i></a>';
        } else if (hasChips(curP) && curP.myship) {
            foot.innerHTML = '<a class="ac_btn fill" href="' + window.AC_LINKS.shop + '" target="_blank" rel="noopener"><span>到 7-11 賣貨便下單</span><i></i></a>' +
                '<button class="ac_btn ac_pdw_bag" type="button"><span>看私訊清單</span><i></i></button>';
        } else if (hasChips(curP)) {
            foot.innerHTML = '<button class="ac_btn fill ac_pdw_bag" type="button"><span>看私訊清單</span><i></i></button>';
        } else if (curP.myship) {
            foot.innerHTML = '<a class="ac_btn fill" href="' + window.AC_LINKS.shop + '" target="_blank" rel="noopener"><span>到 7-11 賣貨便下單</span><i></i></a>' +
                '<button class="ac_btn ac_pdw_add" type="button"><span>加入私訊清單</span><i></i></button>';
        } else {
            foot.innerHTML = qtyHtml(curQ) + '<button class="ac_btn fill ac_pdw_add" type="button"><span>加入私訊清單</span><i></i></button>';
            foot.querySelector('[data-d="-1"]').disabled = curQ <= 1;
        }
    }
    function open(id) {
        var p = byId[id]; if (!p) return;
        curP = p; curQ = 1;
        gImg.removeAttribute('src');
        thumbs.innerHTML = p.images.length > 1 ? p.images.map(function (im, k) {
            return '<button type="button" aria-label="第 ' + (k + 1) + ' 張照片"><img src="' + window.acImg(im, 480) + '" alt="" loading="lazy"></button>';
        }).join('') : '';
        thumbs.hidden = p.images.length < 2;
        setImg(0);
        var specs = (p.specs || []).map(function (s) { return '<dt>' + esc(s.name) + '</dt><dd>' + esc(s.value) + '</dd>'; }).join('');
        var links = '<a href="' + window.AC_LINKS.shop + '" target="_blank" rel="noopener">' + window.AC_ICONS.bag + '7-11 賣貨便</a>' +
            (p.instagram ? '<a href="https://www.instagram.com/p/' + esc(p.instagram) + '/" target="_blank" rel="noopener">' + window.AC_ICONS.ig + '看 IG 貼文</a>' : '');
        txt.innerHTML =
            '<span class="ac_tag' + (p.status !== 'regular' ? ' is-' + p.status : '') + '">' + STATUS[p.status] + '</span>' +
            '<em>' + esc(p.en) + '</em><h2 id="ac_pdw_h">' + esc(p.name) + '</h2>' +
            (p.price ? '<span class="ac_price">' + esc(p.price) + '</span>' : '<span class="ac_price is-ask">價格請私訊詢問</span>') +
            (p.status === 'ended' ? '' : p.myship
                ? '<p class="ac_dw_via is-shop"><b>7-11 可直接下單</b>可以到賣貨便直接付款下單；想混搭口味、指定取貨日或自取，再加入私訊清單。</p>'
                : '<p class="ac_dw_via"><b>需私訊預訂</b>這款沒有上架賣貨便，請加入私訊清單，整理好後傳給 A娜 確認。</p>') +
            '<p class="ac_dw_desc">' + esc(p.desc) + '</p>' +
            (p.id === 'classic' ? '<div class="ac_dw_flv_t"><b>選口味加入私訊清單</b><p>點一下加一顆，可以混搭多種口味。想直接付款，請到 7-11 賣貨便選口味下單。</p><div class="ac_dw_flv">' + chipsHtml() + '</div></div>'
                : hasChips(p) && p.status !== 'ended' ? '<div class="ac_dw_flv_t"><b>選規格加入私訊清單</b><p>點一下加一份，可以混搭不同規格。' + (p.myship ? '想直接付款，請到 7-11 賣貨便下單。' : '') + '</p><div class="ac_dw_flv">' + chipsHtml() + '</div></div>' : '') +
            (specs ? '<dl class="ac_dw_spec">' + specs + '</dl>' : '') +
            '<div class="ac_dw_links">' + links + '</div>';
        if (window.acSegment) window.acSegment(txt.querySelector('h2'));
        renderFoot();
        body.scrollTop = 0;
        window.acOpen(dw);
        if (history.replaceState) { var u = new URL(location.href); u.searchParams.set('p', id); history.replaceState(null, '', u); }
    }
    window.acOpenProduct = open;
    dw.addEventListener('close', function () {
        if (history.replaceState) { var u = new URL(location.href); u.searchParams.delete('p'); history.replaceState(null, '', u); }
    });
    /* 點主圖放大（PhotoSwipe，第一次點才載入）；左右滑看其他張，關掉時主圖停在最後看的那張 */
    dw.querySelector('.ac_dw_zoom').addEventListener('click', function () {
        var p = curP;
        window.acLoad('../js/photoswipe.umd.min.js', '../css/photoswipe.css').then(function () {
            if (curP !== p || !dw.open) return;
            var ps = new window.PhotoSwipe({
                dataSource: p.images.map(function (im) {
                    return { src: IMG + im.src, width: im.width, height: im.height, alt: p.name, element: gImg, thumbCropped: true };
                }),
                index: curI,
                appendToEl: dw,          /* 抽屜是 showModal 的最上層，放外面會被蓋住 */
                bgOpacity: .92,
                showHideAnimationType: reduce ? 'none' : 'zoom',
                closeTitle: '關閉', zoomTitle: '縮放', arrowPrevTitle: '上一張', arrowNextTitle: '下一張',
                errorMsg: '照片載入失敗'
            });
            ps.on('close', function () {
                var i = ps.currIndex;
                if (i !== curI) { curI = i; gImg.src = window.acImg(p.images[i], 960); [].forEach.call(thumbs.children, function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); }); }
            });
            ps.init();
        });
    });
    thumbs.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setImg([].indexOf.call(thumbs.children, b)); });
    txt.addEventListener('click', function (e) {
        var c = e.target.closest('[data-flv]'); if (!c) return;
        addProduct(curP, 1, c.getAttribute('data-flv'));
    });
    foot.addEventListener('click', function (e) {
        var d = e.target.closest('[data-d]');
        if (d) { curQ = Math.max(1, Math.min(99, curQ + (+d.getAttribute('data-d')))); foot.querySelector('output').textContent = curQ; foot.querySelector('[data-d="-1"]').disabled = curQ <= 1; }
        if (e.target.closest('.ac_pdw_add')) { addProduct(curP, curP.myship ? 1 : curQ); window.acClose(dw); }
        if (e.target.closest('.ac_pdw_bag')) { window.acClose(dw); setTimeout(function () { if (bagDw) window.acOpen(bagDw); }, reduce ? 0 : 450); }
    });
    /* 口味膠囊的數量跟清單同步 */
    window.acBag.on(function () {
        if (!curP || !hasChips(curP)) return;
        [].forEach.call(txt.querySelectorAll('[data-flv]'), function (c) {
            var q = window.acBag.qty(curP.id + '|' + c.getAttribute('data-flv'));
            c.classList.toggle('is-on', q > 0); c.querySelector('b').textContent = q;
        });
    });

    /* 卡片：開詳情／加入清單（事件委派，篩選或重繪後也有效） */
    document.addEventListener('click', function (e) {
        var o = e.target.closest('[data-prod]');
        if (o) { open(o.getAttribute('data-prod')); return; }
        var a = e.target.closest('[data-add]');
        if (a) {
            var p = byId[a.getAttribute('data-add')]; if (!p) return;
            if (hasChips(p)) { open(p.id); return; }   /* 有口味／規格的要先選 */
            addProduct(p, 1);
            a.classList.add('is-added'); setTimeout(function () { a.classList.remove('is-added'); }, 1600);
        }
    });
    /* 網址帶 ?p=id 直接開詳情（分享連結用） */
    var p0 = new URL(location.href).searchParams.get('p');
    if (p0 && byId[p0]) setTimeout(function () { open(p0); }, 300);

})();
