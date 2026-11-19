/* =========================================================
   A. CAKE 共用 header / 手機底部分頁列 / footer / 私訊清單抽屜
   用法（同步插入，不需伺服器，file:// 也能用）：
     header 位置：<script src="../js/ac_layout.js" data-part="header"></script>
     footer 位置：<script src="../js/ac_layout.js" data-part="footer"></script>（放在 .hs_box 內）
   修改選單、頁尾或聯絡方式只要改這支檔案，5 頁會一起更新。
   ========================================================= */
(function () {
    var IG = 'https://www.instagram.com/acake999/';
    var FB = 'https://www.facebook.com/aaa.cake/';
    var LINE = 'https://page.line.me/yzg4109n';
    var SHOP = 'https://myship.7-11.com.tw/general/detail/GM2601282916278';
    window.AC_LINKS = { ig: IG, fb: FB, line: LINE, shop: SHOP };

    var fbIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 3H17v3.5h-2.2a1 1 0 0 0-1 1V10H17l-.5 3.5h-2.7V21h-3.6v-7.5H8V10h2.2V7a4 4 0 0 1 4-4z"/></svg>';
    var igIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>';
    var lineIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M12 4C7 4 3 7.2 3 11.1c0 3.5 3.1 6.4 7.4 7l-.5 2.4c-.1.4.3.7.7.5l3.4-2.2c4.4-.5 7-3.7 7-7.7C21 7.2 17 4 12 4z"/><path d="M7.5 9.5v3.5h2M11.5 9.5V13M13.8 13V9.5l2.4 3.5V9.5"/></svg>';
    var bagIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>';
    var chatIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5h16v10.5H10l-4.5 3.5V16H4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>';
    var homeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M4 11L12 4l8 7"/><path d="M6 9.5V20h12V9.5"/></svg>';
    var sconeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M4 16c0-5 3.6-9 8-9s8 4 8 9z"/><path d="M3 16h18v3H3z"/><path d="M9 11.5l1 1M13.5 10l.8 1.2M15 13l1 .6"/></svg>';
    var tentIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l2-4h14l2 4"/><path d="M3 9c0 1.4 1 2.4 2.25 2.4S7.5 10.4 7.5 9c0 1.4 1 2.4 2.25 2.4S12 10.4 12 9c0 1.4 1 2.4 2.25 2.4S16.5 10.4 16.5 9c0 1.4 1 2.4 2.25 2.4S21 10.4 21 9"/><path d="M5 11.4V20h14v-8.6"/></svg>';
    var noteIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 13.5h6M9 17h4"/></svg>';
    var closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    window.AC_ICONS = { ig: igIcon, fb: fbIcon, line: lineIcon, bag: bagIcon, chat: chatIcon, close: closeIcon };

    /* 選單項目：改這裡就好 */
    var NAV = [
        { href: 'index.html',   zh: '首頁',     en: 'Home',     inNav: false },
        { href: 'about.html',   zh: '關於',     en: 'About',    inNav: true },
        { href: 'products.html#menu', zh: '商品', en: 'Products', inNav: true },
        { href: 'markets.html', zh: '出攤日程', en: 'Markets',  inNav: true },
        { href: 'order.html',   zh: '訂購方式', en: 'Order',    inNav: true }
    ];

    var page = location.pathname.split('/').pop() || 'index.html';
    function cur(href) { return href.split('#')[0] === page ? ' aria-current="page"' : ''; }

    function navItem(n) { return '<li><a href="' + n.href + '"' + cur(n.href) + '>' + n.zh + '</a></li>'; }
    var navL = [NAV[2], NAV[3]].map(navItem).join('');   /* 商品、出攤日程 */
    var navR = [NAV[1], NAV[4]].map(navItem).join('');   /* 關於、訂購方式 */
    var DOCK = [
        { href: 'index.html', zh: '首頁', icon: homeIcon },
        { href: 'products.html#menu', zh: '商品', icon: sconeIcon },
        { href: 'markets.html', zh: '出攤', icon: tentIcon },
        { href: 'order.html', zh: '訂購', icon: noteIcon }
    ];
    var dockLinks = DOCK.map(function (n) { return '<li><a href="' + n.href + '"' + cur(n.href) + '>' + n.icon + '<span>' + n.zh + '</span></a></li>'; }).join('');
    var footerLinks = NAV.map(function (n) { return '<li><a href="' + n.href + '"' + cur(n.href) + '>' + n.zh + '</a></li>'; }).join('');

    /* 桌機：置中的深藍吊牌 Logo，選單分在兩側；手機：上方只留吊牌，選單改成底部分頁列 */
    var HEADER =
        '<a class="ac_skip" href="#main">跳到主要內容</a>' +
        '<header class="ac_header">' +
            '<div class="ac_header_in">' +
                '<nav class="ac_nav ac_nav_l" aria-label="主選單（商品）"><ul>' + navL + '</ul></nav>' +
                '<a class="ac_logo" href="index.html" aria-label="A. cake 首頁"><i>A. cake</i><span>scones · taichung</span></a>' +
                '<div class="ac_nav_r">' +
                    '<nav class="ac_nav" aria-label="主選單（關於）"><ul>' + navR + '</ul></nav>' +
                    '<button class="ac_hd_bag" type="button" data-bag aria-haspopup="dialog" aria-label="私訊清單">' + chatIcon + '<em>私訊清單</em><b aria-hidden="true">0</b></button>' +
                '</div>' +
            '</div>' +
        '</header>' +
        '<nav class="ac_dock" aria-label="快速選單"><ul>' + dockLinks +
            '<li><button type="button" data-bag aria-haspopup="dialog" aria-label="私訊清單">' + chatIcon + '<span>清單</span><b aria-hidden="true">0</b></button></li>' +
        '</ul></nav>' +
        /* 浮動聯絡按鈕：「問 A娜」→ 小卡列出 IG／LINE／FB */
        '<div class="ac_fab">' +
            '<div class="ac_fab_card" id="ac_fab_card" role="dialog" aria-label="聯絡 A娜">' +
                '<p class="ac_fab_t"><b>有問題，問 A娜</b><span>口味、數量、取貨、客製點心都可以私訊討論</span></p>' +
                '<ul>' +
                    '<li><a href="' + IG + '" target="_blank" rel="noopener"><i>' + igIcon + '</i><span><b>Instagram 私訊</b><small>@acake999</small></span></a></li>' +
                    '<li><a href="' + LINE + '" target="_blank" rel="noopener"><i>' + lineIcon + '</i><span><b>LINE 官方帳號</b><small>@yzg4109n</small></span></a></li>' +
                    '<li><a href="' + FB + '" target="_blank" rel="noopener"><i>' + fbIcon + '</i><span><b>Facebook 粉專</b><small>A. cake</small></span></a></li>' +
                '</ul>' +
            '</div>' +
            '<button class="ac_fab_btn" type="button" aria-expanded="false" aria-controls="ac_fab_card" aria-label="聯絡 A娜：Instagram、LINE、Facebook">' +
                '<span class="ac_fab_av" aria-hidden="true"><b>A.</b>' + closeIcon + '</span><em>問 A娜</em>' +
            '</button>' +
        '</div>';

    var footArw = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    var FOOTER =
        '<footer class="ac_footer">' +
            '<div class="ac_footer_awn" aria-hidden="true"></div>' +
            '<div class="ac_footer_in">' +
                '<div class="ac_footer_a">' +
                    '<a class="ac_footer_logo" href="index.html" aria-label="A. cake 首頁"><i>A. cake</i></a>' +
                    '<p>今天也來一顆司康吧。</p>' +
                    '<ul class="ac_footer_nav">' + footerLinks + '</ul>' +
                '</div>' +
                '<ul class="ac_footer_b">' +
                    '<li>' +
                        '<span class="ac_footer_ico">' + bagIcon + '</span>' +
                        '<h3>線上訂購</h3>' +
                        '<p>7-11 賣貨便冷凍店到店，接單後製作，約 5 個工作天出貨。</p>' +
                        '<a href="' + SHOP + '" target="_blank" rel="noopener">前往賣貨便' + footArw + '</a>' +
                    '</li>' +
                    '<li>' +
                        '<span class="ac_footer_ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M4 11L12 4l8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-6h4v6"/></svg></span>' +
                        '<h3>工作室自取</h3>' +
                        '<p>台中市大里區，採預約制。私訊口味、數量與時間即可。</p>' +
                        '<a href="' + LINE + '" target="_blank" rel="noopener">LINE ＠yzg4109n' + footArw + '</a>' +
                    '</li>' +
                    '<li>' +
                        '<span class="ac_footer_ico">' + igIcon + '</span>' +
                        '<h3>追蹤 A. cake</h3>' +
                        '<p>新口味、出攤日程與限定品，都會先在 IG 公告。</p>' +
                        '<div class="ac_footer_sns">' +
                            '<a href="' + IG + '" target="_blank" rel="noopener" aria-label="Instagram @acake999">' + igIcon + '</a>' +
                            '<a href="' + FB + '" target="_blank" rel="noopener" aria-label="Facebook 粉專">' + fbIcon + '</a>' +
                            '<a href="' + LINE + '" target="_blank" rel="noopener" aria-label="LINE 官方帳號">' + lineIcon + '</a>' +
                        '</div>' +
                    '</li>' +
                '</ul>' +
                '<div class="ac_footer_c">' +
                    '<p>© ' + new Date().getFullYear() + ' A. cake ‘ scones</p>' +
                    '<p>Real Food, Great Taste, Happy Tummy.</p>' +
                '</div>' +
            '</div>' +
        '</footer>' +
        /* 私訊清單抽屜（內容由 ac_common.js 填入） */
        '<dialog class="ac_dw ac_bag" aria-labelledby="ac_bag_h">' +
            '<div class="ac_dw_in">' +
                '<button class="ac_dw_close" type="button" aria-label="關閉">' + closeIcon + '</button>' +
                '<div class="ac_dw_body">' +
                    '<div class="ac_bag_head"><em>Message List</em><h2 id="ac_bag_h">私訊清單</h2><p>這不是購物車，網站不能結帳。清單會整理成一段訊息，傳到 IG 或 LINE，等 A娜 回覆確認數量、價格與取貨時間，才算訂好。</p></div>' +
                    '<ul class="ac_bag_list"></ul>' +
                    '<div class="ac_bag_empty" hidden><p>清單還是空的</p><a class="ac_btn" href="products.html#menu"><span>去挑商品</span><i></i></a></div>' +
                    '<div class="ac_bag_sum"><p>想直接付款下單？標示「7-11 可直接下單」的商品，可以到 <a href="' + SHOP + '" target="_blank" rel="noopener">7-11 賣貨便</a> 結帳，不必私訊。</p></div>' +
                '</div>' +
                '<div class="ac_dw_foot">' +
                    '<a class="ac_btn fill ac_bag_go" href="order.html#helper"><span>整理成私訊文字</span><i></i></a>' +
                '</div>' +
            '</div>' +
        '</dialog>' +
        '<div class="ac_toast" role="status" aria-live="polite"><span></span><button type="button">查看私訊清單</button></div>';

    var me = document.currentScript;
    var part = me && me.getAttribute('data-part');
    if (part === 'header') me.insertAdjacentHTML('beforebegin', HEADER);
    if (part === 'footer') me.insertAdjacentHTML('beforebegin', FOOTER);
})();
