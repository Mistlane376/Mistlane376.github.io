/**
 * 音乐播放器 — 自定义按钮方案
 *
 * 自定义按钮注入到 APlayer 外部（兄弟节点），不受 APlayer 重渲染影响。
 * 点击按钮 → 程序化点击原生 APlayer 按钮（或直接操作 audio 元素）。
 *
 * 浮窗：白色卡片 + 橙色动画条（ahmed150up2 风格）
 * 音乐专页：玻璃拟态卡片 + 浮动圆球（Tsiangana 风格）
 */
(function () {
  'use strict';

  var path = document.location.pathname;
  var isMusicPage = path === '/music/' || path === '/music' || path.indexOf('/music/') === 0;
  var SPEEDS = [0.75, 1.0, 1.25, 1.5, 2.0];
  var enhanceTimer = null;
  var _apDiagDone = false;

  // ═══════ 工具函数 ═══════

  function getAPlayerInstance(container) {
    if (window.APlayer && window.APlayer.instances && window.APlayer.instances.length) {
      return window.APlayer.instances[window.APlayer.instances.length - 1];
    }
    if (container) {
      var el = container.querySelector('.aplayer');
      if (el && el.aplayer) return el.aplayer;
    }
    var all = document.querySelectorAll('.aplayer');
    for (var i = 0; i < all.length; i++) {
      if (all[i].aplayer) return all[i].aplayer;
    }
    if (!_apDiagDone) {
      _apDiagDone = true;
      console.warn('[播放器] APlayer 实例无法直接获取（window.APlayer.instances 不存在），将使用原生按钮点击 + audio 回退模式');
    }
    return null;
  }

  function getAudio(container) {
    var ap = getAPlayerInstance(container);
    if (ap && ap.audio) return ap.audio;
    var audio = container ? container.querySelector('audio') : null;
    if (audio) return audio;
    audio = document.querySelector('.aplayer audio');
    if (audio) return audio;
    return document.querySelector('audio');
  }

  // ═══════ 隐藏原生图标 ═══════

  function hideNativeIcons(aplayerEl) {
    if (!aplayerEl) return;
    var controller = aplayerEl.querySelector('.aplayer-controller');
    if (!controller) return;
    var icons = controller.querySelectorAll('.aplayer-icon');
    for (var i = 0; i < icons.length; i++) {
      icons[i].style.setProperty('display', 'none', 'important');
    }
    var times = controller.querySelectorAll('.aplayer-time');
    for (var j = 0; j < times.length; j++) {
      times[j].style.setProperty('display', 'none', 'important');
    }
  }

  // ═══════ 自定义按钮构建 ═══════

  function buildButtonBar(isFloat) {
    var bar = document.createElement('div');
    bar.className = isFloat ? 'custom-float-btnbar' : 'custom-card-btnbar';
    var cls = isFloat ? 'cbtn' : 'cbtn-card';

    function btn(extra, html, title) {
      var b = document.createElement('button');
      b.className = cls + ' ' + extra;
      b.innerHTML = html;
      b.title = title;
      bar.appendChild(b);
      return b;
    }

    btn('cbtn-prev', '⏮', '上一曲');
    var btnPlay = btn('cbtn-play', '▶', '播放/暂停');
    btn('cbtn-next', '⏭', '下一曲');
    btn('cbtn-list', '☰', '播放列表');
    var btnSpeed = btn('cbtn-speed', '1.0x', '倍速');

    return { bar: bar, play: btnPlay, speed: btnSpeed };
  }

  // ═══════ 自定义按钮注入（APlayer 外部） ═══════

  function injectCustomButtons(aplayerEl) {
    if (!aplayerEl) return;
    var isFloat = !!aplayerEl.closest('.music-float-player');
    var isCard  = !!aplayerEl.closest('.music-page-aplayer');
    if (!isFloat && !isCard) return;

    var parent = isFloat
      ? document.querySelector('.music-float-player')
      : document.querySelector('.music-page-aplayer');
    if (!parent) return;

    // 已注入？
    if (parent.querySelector('.custom-float-btnbar, .custom-card-btnbar')) return;

    hideNativeIcons(aplayerEl);

    var result = buildButtonBar(isFloat);
    var btnBar = result.bar;
    var btnPlay = result.play;
    var btnSpeed = result.speed;

    parent.appendChild(btnBar);

    // 查找原生按钮
    function nativeBtn(cls) {
      return parent.querySelector('.aplayer .aplayer-controller .aplayer-icon-' + cls);
    }

    // 事件绑定
    var allBtns = btnBar.querySelectorAll('button');
    var btnPrev = allBtns[0];
    var btnNext = allBtns[2];
    var btnList = allBtns[3];

    btnPrev.addEventListener('click', function (e) {
      e.stopPropagation(); e.preventDefault();
      var n = nativeBtn('back'); if (n) n.click();
    });
    btnNext.addEventListener('click', function (e) {
      e.stopPropagation(); e.preventDefault();
      var n = nativeBtn('forward'); if (n) n.click();
    });
    btnPlay.addEventListener('click', function (e) {
      e.stopPropagation(); e.preventDefault();
      var n = nativeBtn('play');
      if (n) { n.click(); } else {
        var audio = getAudio(parent);
        if (audio) { if (audio.paused) audio.play(); else audio.pause(); }
      }
    });
    btnList.addEventListener('click', function (e) {
      e.stopPropagation(); e.preventDefault();
      var list = aplayerEl.querySelector('.aplayer-list');
      if (!list) return;
      var cur = list.style.display || getComputedStyle(list).display;
      if (cur === 'none' || cur === '') {
        list.style.setProperty('display', 'block', 'important');
      } else {
        list.style.setProperty('display', 'none', 'important');
      }
    });
    btnSpeed.addEventListener('click', function (e) {
      e.stopPropagation(); e.preventDefault();
      var audio = getAudio(parent);
      if (!audio) return;
      var cur = audio.playbackRate || 1;
      var idx = SPEEDS.indexOf(cur);
      if (idx === -1) idx = SPEEDS.indexOf(1.0);
      var next = SPEEDS[(idx + 1) % SPEEDS.length];
      audio.playbackRate = next;
      btnSpeed.textContent = next.toFixed(2).replace(/0+$/, '').replace(/\.$/, '') + 'x';
    });

    // 状态同步
    setInterval(function () {
      var audio = getAudio(parent);
      btnPlay.innerHTML = (audio && !audio.paused) ? '⏸' : '▶';
      if (audio && !audio.paused) {
        aplayerEl.classList.add('playing');
      } else {
        aplayerEl.classList.remove('playing');
      }
    }, 600);

    console.log('[播放器] 自定义按钮已注入',
      '类型:', isFloat ? '浮窗' : '音乐页',
      '按钮数:', btnBar.children.length);

    // ═══════ 3 秒后 API 诊断 ═══════
    setTimeout(function () {
      var listItems = aplayerEl.querySelectorAll('.aplayer-list ol li');
      var audio = document.querySelector('.aplayer audio') || document.querySelector('audio');
      var title = aplayerEl.querySelector('.aplayer-title');
      console.log('=== [播放器诊断] ===');
      console.log('  歌单歌曲数:', listItems.length);
      console.log('  audio 元素:', audio ? '存在 src=' + (audio.src ? audio.src.substring(0, 60) + '...' : '(空)') : '不存在');
      console.log('  当前显示:', (title ? title.textContent : 'N/A'));
      if (!audio && listItems.length === 1) {
        console.warn('  ⚠ 只有 1 首歌且无 audio 元素 → API 可能未返回音频直链');
        console.warn('  → 请在 Console 运行以下命令检查API:');
        console.warn('  fetch("https://api.injahow.cn/meting/?server=netease&type=playlist&id=18083014843&r="+Math.random()).then(r=>r.json()).then(d=>{console.log("歌曲数:",d.length);d.forEach((s,i)=>{console.log(i,s.title,"url:",s.url||"空","pic:",s.pic||"空")})})');
      }
    }, 3000);
  }

  // ═══════ 其他注入 ═══════

  function injectNowPlayingHeading() {
    var fp = document.querySelector('.music-float-player');
    if (!fp || fp.querySelector('.music-float-heading')) return;
    var ap = fp.querySelector('.aplayer');
    if (!ap) return;
    var h = document.createElement('div');
    h.className = 'music-float-heading';
    h.innerHTML = '<span class="music-float-heading-icon">♪</span> 正在播放';
    fp.insertBefore(h, ap);
  }

  function injectEqBars(aplayerEl) {
    if (aplayerEl.querySelector('.aplayer-eq-bars')) return;
    var music = aplayerEl.querySelector('.aplayer-music');
    if (!music) return;
    var bars = document.createElement('span');
    bars.className = 'aplayer-eq-bars';
    bars.innerHTML = '<span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span>';
    music.appendChild(bars);
  }

  function injectTimePills(aplayerEl) {
    if (aplayerEl.dataset._pills === '1') return;
    var ctrl = aplayerEl.querySelector('.aplayer-controller');
    if (!ctrl || ctrl.querySelector('.aplayer-time-pill')) return;
    var barWrap = ctrl.querySelector('.aplayer-bar-wrap');
    if (!barWrap) return;
    var cur = document.createElement('span');
    cur.className = 'aplayer-time-pill cur'; cur.textContent = '00:00';
    var dur = document.createElement('span');
    dur.className = 'aplayer-time-pill dur'; dur.textContent = '00:00';
    try { ctrl.insertBefore(cur, barWrap); ctrl.insertBefore(dur, barWrap.nextSibling); } catch (e) {}
    aplayerEl.dataset._pills = '1';
    setInterval(function () {
      var t = ctrl.querySelectorAll('.aplayer-time');
      if (t.length >= 1) cur.textContent = t[0].textContent;
      if (t.length >= 2) dur.textContent = t[1].textContent;
    }, 500);
  }

  function injectCardDecorations() {
    var pa = document.querySelector('.music-page-aplayer');
    if (!pa || pa.dataset._decor === '1') return;
    var ap = pa.querySelector('.aplayer');
    if (!ap) return;
    var g = document.createElement('div'); g.className = 'music-glass-overlay'; pa.insertBefore(g, ap);
    var c = document.createElement('div'); c.className = 'music-card-circle-two'; pa.insertBefore(c, ap);
    var b = document.createElement('div'); b.className = 'music-card-badge'; b.textContent = 'MUSIC'; pa.insertBefore(b, ap);
    var ia = document.createElement('div'); ia.className = 'music-card-icon-area'; ia.textContent = '🎵'; ia.title = '播放/暂停';
    ia.addEventListener('click', function () {
      var nb = pa.querySelector('.aplayer-icon-play'); if (nb) nb.click();
    });
    pa.insertBefore(ia, ap);
    pa.dataset._decor = '1';
  }

  function isPlayerReady(aplayerEl) {
    return aplayerEl && aplayerEl.querySelector('.aplayer-music') && aplayerEl.querySelector('.aplayer-title');
  }

  function enhanceOnePlayer(aplayerEl) {
    if (!aplayerEl || !isPlayerReady(aplayerEl)) return;
    hideNativeIcons(aplayerEl);
    if (aplayerEl.dataset._enhanced === '1') return;
    injectEqBars(aplayerEl);
    injectTimePills(aplayerEl);
    injectCustomButtons(aplayerEl);
    aplayerEl.dataset._enhanced = '1';
  }

  function enhanceAllPlayers() {
    if (enhanceTimer) clearTimeout(enhanceTimer);
    enhanceTimer = setTimeout(function () {
      enhanceTimer = null;
      injectNowPlayingHeading();
      if (isMusicPage) injectCardDecorations();
      var players = document.querySelectorAll('.aplayer');
      for (var i = 0; i < players.length; i++) {
        try { enhanceOnePlayer(players[i]); } catch (e) {}
      }
    }, 200);
  }

  // ═══════ MetingJS 初始化 ═══════

  function tryLoadMeting() {
    if (typeof loadMeting === 'function') {
      try {
        loadMeting();
        setTimeout(enhanceAllPlayers, 500);
        setTimeout(enhanceAllPlayers, 1200);
        setTimeout(enhanceAllPlayers, 2500);
        setTimeout(enhanceAllPlayers, 4000);
        return true;
      } catch (e) { return false; }
    }
    return false;
  }

  function loadMetingFallback() {
    if (!window.METING_JS_FALLBACK) return;
    var s = document.createElement('script');
    s.src = window.METING_JS_FALLBACK;
    s.onload = function () { setTimeout(tryLoadMeting, 300); };
    document.body.appendChild(s);
  }

  var pollCount = 0;
  var metingPoll = setInterval(function () {
    pollCount++;
    if (tryLoadMeting()) { clearInterval(metingPoll); return; }
    if (pollCount === 10) loadMetingFallback();
    if (pollCount >= 40) clearInterval(metingPoll);
  }, 300);

  var bodyObserver = new MutationObserver(function () { enhanceAllPlayers(); });
  bodyObserver.observe(document.body, { childList: true, subtree: true });
  setTimeout(function () { bodyObserver.disconnect(); }, 20000);

  // ═══════ 音乐页隐藏浮窗 ═══════

  var floatWin = document.getElementById('music-float-window');
  if (!floatWin) return;

  if (isMusicPage) { floatWin.style.display = 'none'; return; }

  // ═══════ 拖拽 ═══════

  var dragHandle = document.getElementById('music-float-drag');
  if (!dragHandle) return;

  var isDragging = false, startX, startY, startLeft, startTop;

  function loadPos() {
    try {
      var p = JSON.parse(localStorage.getItem('music-float-pos'));
      if (p && typeof p.left === 'number') {
        floatWin.style.right = 'auto'; floatWin.style.bottom = 'auto';
        floatWin.style.left = p.left + 'px'; floatWin.style.top = p.top + 'px';
      }
    } catch (e) {}
  }

  function savePos() {
    try {
      localStorage.setItem('music-float-pos', JSON.stringify({ left: floatWin.offsetLeft, top: floatWin.offsetTop }));
    } catch (e) {}
  }

  function clamp(l, t) {
    return {
      left: Math.max(8, Math.min(l, window.innerWidth - floatWin.offsetWidth - 8)),
      top:  Math.max(8, Math.min(t, window.innerHeight - floatWin.offsetHeight - 8))
    };
  }

  function onStart(e) {
    if (e.target.closest('.aplayer-list') || e.target.closest('.aplayer-bar-wrap') ||
        e.target.closest('.cbtn') || e.target.closest('button') || e.target.closest('.music-card-icon-area')) return;
    isDragging = true; floatWin.classList.add('dragging');
    var r = floatWin.getBoundingClientRect();
    floatWin.style.right = 'auto'; floatWin.style.bottom = 'auto';
    floatWin.style.left = r.left + 'px'; floatWin.style.top = r.top + 'px';
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    startLeft = r.left; startTop = r.top;
    e.preventDefault();
  }

  function onMove(e) {
    if (!isDragging) return;
    var cx = e.touches ? e.touches[0].clientX : e.clientX;
    var cy = e.touches ? e.touches[0].clientY : e.clientY;
    var c = clamp(startLeft + cx - startX, startTop + cy - startY);
    floatWin.style.left = c.left + 'px'; floatWin.style.top = c.top + 'px';
  }

  function onEnd() {
    if (!isDragging) return;
    isDragging = false; floatWin.classList.remove('dragging'); savePos();
  }

  dragHandle.addEventListener('mousedown', onStart);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
  dragHandle.addEventListener('touchstart', onStart, { passive: false });
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onEnd);

  window.addEventListener('resize', function () {
    if (floatWin.style.left) {
      var c = clamp(parseFloat(floatWin.style.left), parseFloat(floatWin.style.top));
      floatWin.style.left = c.left + 'px'; floatWin.style.top = c.top + 'px';
    }
  });

  loadPos();
})();
