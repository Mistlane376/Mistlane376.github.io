/**
 * 音乐播放器 — Spotify 暗黑卡片
 *
 * APlayer 内置：上一曲 / 播放 / 下一曲 / 列表 / 音量
 * JS 注入：倍速按钮 · 均衡器动画条
 * 其他：拖拽 · 位置记忆 · MetingJS 初始化 · 备用 CDN
 */
(function () {
  'use strict';

  var path = document.location.pathname;
  var isMusicPage =
    path === '/music/' || path === '/music' || path.indexOf('/music/') === 0;

  // ═══════ 倍速 ═══════
  var SPEEDS = [0.75, 1.0, 1.25, 1.5, 2.0];

  /**
   * 给 APlayer 注入均衡器动画条（放在标题后面）
   */
  function injectEqBars(aplayerEl) {
    var music = aplayerEl.querySelector('.aplayer-music');
    if (!music || music.querySelector('.aplayer-eq-bars')) return;

    var bars = document.createElement('span');
    bars.className = 'aplayer-eq-bars';
    bars.innerHTML =
      '<span class="eq-bar"></span>' +
      '<span class="eq-bar"></span>' +
      '<span class="eq-bar"></span>' +
      '<span class="eq-bar"></span>' +
      '<span class="eq-bar"></span>';
    music.appendChild(bars);
  }

  /**
   * 监听 APlayer 播放/暂停状态，切换 .playing 类 → 控制均衡器显隐
   */
  function bindPlayingState(aplayerEl) {
    // APlayer 播放按钮被点击时切换 .aplayer-played 类
    var playBtn = aplayerEl.querySelector('.aplayer-icon-play');
    if (!playBtn || playBtn.dataset._eqBound) return;
    playBtn.dataset._eqBound = '1';

    var updateState = function () {
      var isPlaying = aplayerEl.querySelector('.aplayer-played') ||
                      playBtn.classList.contains('aplayer-played');
      if (isPlaying) {
        aplayerEl.classList.add('playing');
      } else {
        aplayerEl.classList.remove('playing');
      }
    };

    // 初始状态
    updateState();

    // 监听点击
    playBtn.addEventListener('click', function () {
      setTimeout(updateState, 100);
    });

    // MutationObserver 监听 class 变化
    var obs = new MutationObserver(updateState);
    obs.observe(playBtn, { attributes: true, attributeFilter: ['class'] });
  }

  /**
   * 给所有 APlayer 注入倍速按钮
   */
  function injectSpeedBtn(aplayerEl) {
    var controller = aplayerEl.querySelector('.aplayer-controller');
    if (!controller) return;
    if (controller.querySelector('.aplayer-speed-btn')) return;

    var btn = document.createElement('button');
    btn.className = 'aplayer-speed-btn';
    btn.textContent = '1.0x';
    btn.title = '倍速';

    var volumeWrap = controller.querySelector('.aplayer-volume-wrap');
    if (volumeWrap) {
      controller.insertBefore(btn, volumeWrap);
    } else {
      controller.appendChild(btn);
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var audio = aplayerEl.querySelector('audio') ||
                  document.querySelector('.aplayer audio');
      if (!audio) return;

      var cur = audio.playbackRate || 1;
      var idx = SPEEDS.indexOf(cur);
      if (idx === -1) idx = SPEEDS.indexOf(1.0);
      var next = SPEEDS[(idx + 1) % SPEEDS.length];
      audio.playbackRate = next;
      btn.textContent = next.toFixed(2).replace(/0+$/, '').replace(/\.$/, '') + 'x';
    });
  }

  /**
   * 给所有 .aplayer 实例注入增强功能
   */
  function enhanceAllPlayers() {
    var players = document.querySelectorAll('.aplayer');
    for (var i = 0; i < players.length; i++) {
      injectEqBars(players[i]);
      bindPlayingState(players[i]);
      injectSpeedBtn(players[i]);
      injectTimePills(players[i]);
    }
  }

  /**
   * 在进度条两侧注入时间药丸（替代被 CSS 隐藏的原生时间）
   */
  function injectTimePills(aplayerEl) {
    var controller = aplayerEl.querySelector('.aplayer-controller');
    if (!controller || controller.querySelector('.aplayer-time-pill')) return;
    var barWrap = controller.querySelector('.aplayer-bar-wrap');
    if (!barWrap) return;

    var times = controller.querySelectorAll('.aplayer-time');
    var curText = times.length >= 1 ? times[0].textContent : '00:00';
    var durText = times.length >= 2 ? times[1].textContent : '00:00';

    var curPill = document.createElement('span');
    curPill.className = 'aplayer-time-pill cur';
    curPill.textContent = curText;

    var durPill = document.createElement('span');
    durPill.className = 'aplayer-time-pill dur';
    durPill.textContent = durText;

    controller.insertBefore(curPill, barWrap);
    controller.insertBefore(durPill, barWrap.nextSibling);

    // 每 500ms 从隐藏的原生 time 同步
    var sync = setInterval(function () {
      var t = controller.querySelectorAll('.aplayer-time');
      if (t.length >= 1) curPill.textContent = t[0].textContent;
      if (t.length >= 2) durPill.textContent = t[1].textContent;
    }, 500);

    // 播放器销毁时清理
    var obs = new MutationObserver(function (mutations) {
      for (var m = 0; m < mutations.length; m++) {
        for (var r = 0; r < mutations[m].removedNodes.length; r++) {
          if (mutations[m].removedNodes[r] === aplayerEl) {
            clearInterval(sync); obs.disconnect(); return;
          }
        }
      }
    });
    if (aplayerEl.parentNode) obs.observe(aplayerEl.parentNode, { childList: true });
  }

  // ═══════ 1. MetingJS 初始化 ═══════

  function tryLoadMeting() {
    if (typeof loadMeting === 'function') {
      try {
        loadMeting();
        setTimeout(enhanceAllPlayers, 600);
        setTimeout(enhanceAllPlayers, 2000);
        return true;
      } catch (e) { return false; }
    }
    return false;
  }

  function loadMetingFallback() {
    var url = window.METING_JS_FALLBACK;
    if (!url) return;
    var s = document.createElement('script');
    s.src = url;
    s.onload = function () { setTimeout(tryLoadMeting, 200); };
    document.body.appendChild(s);
  }

  var pollCount = 0;
  var metingPoll = setInterval(function () {
    pollCount++;
    if (tryLoadMeting()) { clearInterval(metingPoll); return; }
    if (pollCount === 10) loadMetingFallback();
    if (pollCount >= 40) clearInterval(metingPoll);
  }, 300);

  // 监听 APlayer DOM 创建（API 返回数据后才渲染）
  var bodyObserver = new MutationObserver(function () {
    enhanceAllPlayers();
  });
  bodyObserver.observe(document.body, { childList: true, subtree: true });
  setTimeout(function () { bodyObserver.disconnect(); }, 20000);

  // ═══════ 2. 音乐专页隐藏浮窗 ═══════

  var floatWin = document.getElementById('music-float-window');
  if (!floatWin) return;

  if (isMusicPage) {
    floatWin.style.display = 'none';
    return;
  }

  // ═══════ 3. 拖拽 ═══════

  var dragHandle = document.getElementById('music-float-drag');
  if (!dragHandle) return;

  var isDragging = false, startX, startY, startLeft, startTop;

  function loadPos() {
    try {
      var p = JSON.parse(localStorage.getItem('music-float-pos'));
      if (p && typeof p.left === 'number') {
        floatWin.style.right = 'auto';
        floatWin.style.bottom = 'auto';
        floatWin.style.left = p.left + 'px';
        floatWin.style.top = p.top + 'px';
      }
    } catch (e) {}
  }

  function savePos() {
    try {
      localStorage.setItem('music-float-pos', JSON.stringify({
        left: floatWin.offsetLeft, top: floatWin.offsetTop
      }));
    } catch (e) {}
  }

  function clamp(l, t) {
    return {
      left: Math.max(8, Math.min(l, innerWidth - floatWin.offsetWidth - 8)),
      top: Math.max(8, Math.min(t, innerHeight - floatWin.offsetHeight - 8))
    };
  }

  function onStart(e) {
    if (e.target.closest('.aplayer-list')) return;
    if (e.target.closest('.aplayer-bar-wrap')) return;
    if (e.target.closest('.aplayer-icon')) return;
    if (e.target.closest('.aplayer-speed-btn')) return;
    if (e.target.closest('button')) return;

    isDragging = true;
    floatWin.classList.add('dragging');
    var r = floatWin.getBoundingClientRect();
    floatWin.style.right = 'auto';
    floatWin.style.bottom = 'auto';
    floatWin.style.left = r.left + 'px';
    floatWin.style.top = r.top + 'px';
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
    floatWin.style.left = c.left + 'px';
    floatWin.style.top = c.top + 'px';
  }

  function onEnd() {
    if (!isDragging) return;
    isDragging = false;
    floatWin.classList.remove('dragging');
    savePos();
  }

  dragHandle.addEventListener('mousedown', onStart);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
  dragHandle.addEventListener('touchstart', onStart, { passive: false });
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onEnd);

  addEventListener('resize', function () {
    if (floatWin.style.left) {
      var c = clamp(parseFloat(floatWin.style.left), parseFloat(floatWin.style.top));
      floatWin.style.left = c.left + 'px';
      floatWin.style.top = c.top + 'px';
    }
  });

  loadPos();
})();
