/**
 * 音乐浮窗播放器 — 多页面共享，PJAX 持久化
 *
 * 浮窗在 PJAX 导航时不销毁不中断，首次加载自动播放。
 * 支持拖拽移动，位置持久化到 localStorage。
 */
(function () {
  'use strict';

  var enhanceTimer = null;

  // ═══════ 工具函数 ═══════

  function getAPlayerInstance() {
    if (window.APlayer && window.APlayer.instances && window.APlayer.instances.length) {
      return window.APlayer.instances[window.APlayer.instances.length - 1];
    }
    var all = document.querySelectorAll('.aplayer');
    for (var i = 0; i < all.length; i++) {
      if (all[i].aplayer) return all[i].aplayer;
    }
    return null;
  }

  function getAudio() {
    var ap = getAPlayerInstance();
    if (ap && ap.audio) return ap.audio;
    return document.querySelector('.aplayer audio') || document.querySelector('audio');
  }

  // ═══════ 隐藏原生图标 ═══════

  function hideNativeIcons(aplayerEl) {
    if (!aplayerEl) return;
    var ctrl = aplayerEl.querySelector('.aplayer-controller');
    if (!ctrl) return;
    // 改用 opacity:0 + pointer-events:none，保留元素在 DOM 中，避免 APlayer 内部报错
    var icons = ctrl.querySelectorAll('.aplayer-icon');
    for (var i = 0; i < icons.length; i++) {
      icons[i].style.setProperty('opacity', '0', 'important');
      icons[i].style.setProperty('pointer-events', 'none', 'important');
    }
    var times = ctrl.querySelectorAll('.aplayer-time');
    for (var j = 0; j < times.length; j++) {
      times[j].style.setProperty('opacity', '0', 'important');
      times[j].style.setProperty('pointer-events', 'none', 'important');
    }
  }

  // ═══════ 自定义按钮构建 ═══════

  function buildButtonBar() {
    var bar = document.createElement('div');
    bar.className = 'custom-float-btnbar';

    function btn(extra, html, title) {
      var b = document.createElement('button');
      b.className = 'cbtn ' + extra;
      b.innerHTML = html;
      b.title = title;
      bar.appendChild(b);
      return b;
    }

    btn('cbtn-prev', '⏮', '上一曲');
    var btnPlay = btn('cbtn-play', '▶', '播放/暂停');
    btn('cbtn-next', '⏭', '下一曲');

    return { bar: bar, play: btnPlay };
  }

  function injectCustomButtons(aplayerEl) {
    if (!aplayerEl || !aplayerEl.closest('.music-float-player')) return;
    var parent = document.querySelector('.music-float-player');
    if (!parent || parent.querySelector('.custom-float-btnbar')) return;

    hideNativeIcons(aplayerEl);

    var result = buildButtonBar();
    var btnBar = result.bar;
    var btnPlay = result.play;

    parent.appendChild(btnBar);

    function nativeBtn(cls) {
      return parent.querySelector('.aplayer .aplayer-controller .aplayer-icon-' + cls);
    }

    var allBtns = btnBar.querySelectorAll('button');
    var btnPrev = allBtns[0];
    var btnNext = allBtns[2];

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
      btnPlay.classList.add('cbtn-pop');
      setTimeout(function () { btnPlay.classList.remove('cbtn-pop'); }, 200);
      var n = nativeBtn('play');
      if (n) { n.click(); } else {
        var audio = getAudio();
        if (audio) { if (audio.paused) audio.play(); else audio.pause(); }
      }
    });

    setInterval(function () {
      var audio = getAudio();
      var playing = audio && !audio.paused;
      var newIcon = playing ? '⏸' : '▶';
      if (btnPlay.innerHTML !== newIcon) {
        btnPlay.innerHTML = newIcon;
        btnPlay.classList.add('cbtn-switch');
        setTimeout(function () { btnPlay.classList.remove('cbtn-switch'); }, 300);
      }
      if (playing) aplayerEl.classList.add('playing');
      else aplayerEl.classList.remove('playing');
    }, 600);

    console.log('[音乐浮窗] 自定义按钮已注入，按钮数:', btnBar.children.length);
  }

  // ═══════ 增强注入 ═══════

  function injectNowPlayingHeading() {
    var fp = document.querySelector('.music-float-player');
    if (!fp || fp.querySelector('.music-float-heading')) return;
    var ap = fp.querySelector('.aplayer');
    if (!ap) return;
    var h = document.createElement('div');
    h.className = 'music-float-heading';
    h.innerHTML = '<span class="music-float-heading-icon">♪</span> 正在播放'; // ♪ 正在播放
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

  function isPlayerReady(aplayerEl) {
    return aplayerEl && aplayerEl.querySelector('.aplayer-music') && aplayerEl.querySelector('.aplayer-title');
  }

  function enhanceOnePlayer(aplayerEl) {
    if (!aplayerEl || !isPlayerReady(aplayerEl)) return;
    hideNativeIcons(aplayerEl);
    if (aplayerEl.dataset._enhanced === '1') return;
    injectEqBars(aplayerEl);
    injectCustomButtons(aplayerEl);
    aplayerEl.dataset._enhanced = '1';

    // 标记为 fixed 防止 PJAX 销毁
    if (aplayerEl.closest('.music-float-player') && aplayerEl.aplayer) {
      aplayerEl.aplayer.options.fixed = true;
      aplayerEl.removeAttribute('data-server');
      aplayerEl.removeAttribute('data-type');
      aplayerEl.removeAttribute('data-id');
    }
  }

  function enhanceAllPlayers() {
    if (enhanceTimer) clearTimeout(enhanceTimer);
    enhanceTimer = setTimeout(function () {
      enhanceTimer = null;
      injectNowPlayingHeading();
      var players = document.querySelectorAll('.aplayer');
      for (var i = 0; i < players.length; i++) {
        try { enhanceOnePlayer(players[i]); } catch (e) {}
      }
    }, 200);
  }

  // ═══════ 浮窗 & PJAX 防重复 ═══════

  var floatWin = document.getElementById('music-float-window');
  if (!floatWin) return;

  // 每次页面脚本执行时确保浮窗可见
  floatWin.style.display = '';

  // PJAX 已初始化则跳过
  if (floatWin.dataset._initDone === '1') return;
  floatWin.dataset._initDone = '1';

  // ═══════ PJAX 播放保护（三层防御） ═══════

  // 快速轮询：实例一出现就标记 fixed
  var _fixPoll = setInterval(function () {
    var el = floatWin.querySelector('.aplayer');
    if (el && el.aplayer) { el.aplayer.options.fixed = true; clearInterval(_fixPoll); }
  }, 80);
  setTimeout(function () { clearInterval(_fixPoll); }, 20000);

  // 第 1 层：捕获阶段清空 window.aplayers，让 destroyAplayer 无物可毁
  document.addEventListener('pjax:send', function () {
    if (window.aplayers && window.aplayers.length) {
      floatWin._savedAplayers = window.aplayers;
      window.aplayers = [];
    }
    // 保存音频状态
    var audio = floatWin.querySelector('audio');
    if (audio) {
      floatWin._wasPlaying = audio.paused ? '0' : '1';
      floatWin._audioTime = audio.currentTime;
    }
  }, true); // ← capture 阶段，先于 Butterfly 的 bubble 监听器

  // 第 2 层：bubble 阶段再次确保 fixed（双重保险）
  document.addEventListener('pjax:send', function () {
    var el = floatWin.querySelector('.aplayer');
    if (el && el.aplayer) el.aplayer.options.fixed = true;
  });

  // 第 3 层：导航完成后恢复 aplayers 数组 + 恢复播放
  document.addEventListener('pjax:complete', function () {
    // 恢复 aplayers 数组
    if (floatWin._savedAplayers) {
      window.aplayers = floatWin._savedAplayers;
      delete floatWin._savedAplayers;
    }
    // 恢复播放
    if (floatWin._wasPlaying !== '1') return;
    delete floatWin._wasPlaying;
    var resume = function () {
      var audio = floatWin.querySelector('audio');
      if (audio && audio.paused && audio.src && audio.src !== window.location.href) {
        if (floatWin._audioTime) { audio.currentTime = parseFloat(floatWin._audioTime); delete floatWin._audioTime; }
        audio.play().catch(function () {});
      }
    };
    resume();
    setTimeout(resume, 200);
    setTimeout(resume, 600);
  });

  // ═══════ 折叠/展开按钮 ═══════

  var collapseBtn = document.createElement('button');
  collapseBtn.className = 'music-float-collapse-btn';
  collapseBtn.innerHTML = '−';
  collapseBtn.title = '折叠浮窗';
  floatWin.appendChild(collapseBtn);

  if (localStorage.getItem('music-float-collapsed') === '1') {
    floatWin.classList.add('collapsed');
    collapseBtn.innerHTML = '⋮';
    collapseBtn.title = '展开浮窗';
  }

  collapseBtn.addEventListener('click', function (e) {
    e.stopPropagation(); e.preventDefault();
    if (wasDragged) { wasDragged = false; return; }
    floatWin.classList.toggle('collapsed');
    var isCollapsed = floatWin.classList.contains('collapsed');
    localStorage.setItem('music-float-collapsed', isCollapsed ? '1' : '0');
    collapseBtn.innerHTML = isCollapsed ? '⋮' : '−';
    collapseBtn.title = isCollapsed ? '展开浮窗' : '折叠浮窗';
    if (floatWin.style.left) {
      var c = clamp(parseFloat(floatWin.style.left), parseFloat(floatWin.style.top));
      floatWin.style.left = c.left + 'px'; floatWin.style.top = c.top + 'px';
    }
  });

  // 点击折叠后的浮窗主体 → 展开
  floatWin.addEventListener('click', function (e) {
    if (!floatWin.classList.contains('collapsed')) return;
    if (wasDragged) { wasDragged = false; return; }
    if (e.target.closest('.aplayer-button') || e.target.closest('.aplayer-icon') ||
        e.target.closest('.aplayer-list') || e.target.closest('.aplayer-volume-wrap')) return;
    if (e.target === collapseBtn || collapseBtn.contains(e.target)) return;
    floatWin.classList.remove('collapsed');
    localStorage.setItem('music-float-collapsed', '0');
    collapseBtn.innerHTML = '−';
    collapseBtn.title = '折叠浮窗';
    if (floatWin.style.left) {
      var c = clamp(parseFloat(floatWin.style.left), parseFloat(floatWin.style.top));
      floatWin.style.left = c.left + 'px'; floatWin.style.top = c.top + 'px';
    }
  });

  // ═══════ 首次自动播放 ═══════

  function tryAutoPlay() {
    var ap = getAPlayerInstance();
    if (!ap || !ap.audio) return;
    if (!ap.audio.paused) return;
    if (!ap.audio.src || ap.audio.src === window.location.href) return;
    try { ap.play(); } catch (e) {}
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
        // 自动播放：等歌单加载完再尝试
        setTimeout(tryAutoPlay, 3000);
        setTimeout(tryAutoPlay, 6000);
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

  // ═══════ 拖拽 ═══════

  var dragHandle = document.getElementById('music-float-drag');
  if (!dragHandle) return;

  var isDragging = false, wasDragged = false, startX, startY, startLeft, startTop;

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
      localStorage.setItem('music-float-pos',
        JSON.stringify({ left: floatWin.offsetLeft, top: floatWin.offsetTop }));
    } catch (e) {}
  }

  function clamp(l, t) {
    return {
      left: Math.max(8, Math.min(l, window.innerWidth - floatWin.offsetWidth - 8)),
      top:  Math.max(8, Math.min(t, window.innerHeight - floatWin.offsetHeight - 8))
    };
  }

  function suppressPlayBtn() {
    var pb = floatWin.querySelector('.aplayer-button');
    if (pb && !pb.dataset._pesuppress) {
      pb.dataset._pesuppress = pb.style.pointerEvents || '';
      pb.style.pointerEvents = 'none';
    }
  }

  function restorePlayBtn() {
    var pb = floatWin.querySelector('.aplayer-button');
    if (pb && pb.dataset._pesuppress !== undefined) {
      pb.style.pointerEvents = pb.dataset._pesuppress;
      delete pb.dataset._pesuppress;
    }
  }

  function onStart(e, force) {
    if (!force) {
      if (e.target.closest('.aplayer-list') || e.target.closest('.aplayer-bar-wrap') ||
          e.target.closest('.cbtn') || e.target.closest('button')) return;
    }
    wasDragged = false;
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
    wasDragged = true;
    if (floatWin.classList.contains('collapsed')) suppressPlayBtn();
    var cx = e.touches ? e.touches[0].clientX : e.clientX;
    var cy = e.touches ? e.touches[0].clientY : e.clientY;
    var c = clamp(startLeft + cx - startX, startTop + cy - startY);
    floatWin.style.left = c.left + 'px'; floatWin.style.top = c.top + 'px';
  }

  function onEnd() {
    if (!isDragging) return;
    isDragging = false; floatWin.classList.remove('dragging'); savePos();
    if (wasDragged) { setTimeout(restorePlayBtn, 60); }
    else { restorePlayBtn(); }
  }

  dragHandle.addEventListener('mousedown', onStart);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
  dragHandle.addEventListener('touchstart', onStart, { passive: false });
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onEnd);

  // 折叠态下整个窗口可拖拽
  floatWin.addEventListener('mousedown', function (e) {
    if (floatWin.classList.contains('collapsed')) onStart(e, true);
  });
  floatWin.addEventListener('touchstart', function (e) {
    if (floatWin.classList.contains('collapsed')) onStart(e, true);
  }, { passive: false });

  window.addEventListener('resize', function () {
    if (floatWin.style.left) {
      var c = clamp(parseFloat(floatWin.style.left), parseFloat(floatWin.style.top));
      floatWin.style.left = c.left + 'px'; floatWin.style.top = c.top + 'px';
    }
  });

  loadPos();
})();
