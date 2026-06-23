/**
 * 音乐浮窗播放器 — 半透明 · 可拖拽 · 右下角定位
 *
 * 功能：
 *   1. 轮询 MetingJS 并手动初始化（DOMContentLoaded 已触发）
 *   2. CDN 加载失败时从备用地址加载
 *   3. 拖拽浮窗（鼠标 / 触摸）
 *   4. 位置持久化到 localStorage
 *   5. 音乐专页自动隐藏浮窗
 */
(function () {
  'use strict';

  var path = document.location.pathname;
  var isMusicPage =
    path === '/music/' || path === '/music' || path.indexOf('/music/') === 0;

  // ═══════════════════════════════════════════
  // 1. MetingJS 初始化
  // ═══════════════════════════════════════════

  function tryLoadMeting() {
    if (typeof loadMeting === 'function') {
      try {
        loadMeting();
        console.log('[music-player] MetingJS 初始化完成');
        return true;
      } catch (e) {
        console.warn('[music-player] loadMeting 调用失败：', e);
        return false;
      }
    }
    return false;
  }

  function loadMetingFallback() {
    var url = window.METING_JS_FALLBACK;
    if (!url) return;
    console.log('[music-player] 从备用 CDN 加载 MetingJS：' + url);
    var s = document.createElement('script');
    s.src = url;
    s.onload = function () {
      console.log('[music-player] 备用 MetingJS 加载成功');
      setTimeout(tryLoadMeting, 200);
    };
    s.onerror = function () {
      console.error('[music-player] 备用 MetingJS 加载失败');
    };
    document.body.appendChild(s);
  }

  var pollCount = 0;
  var metingPoll = setInterval(function () {
    pollCount++;
    if (tryLoadMeting()) {
      clearInterval(metingPoll);
      return;
    }
    if (pollCount === 10) loadMetingFallback();
    if (pollCount >= 40) {
      clearInterval(metingPoll);
      console.warn('[music-player] MetingJS 加载超时');
    }
  }, 300);

  // ═══════════════════════════════════════════
  // 2. 音乐专页隐藏浮窗
  // ═══════════════════════════════════════════

  var floatWin = document.getElementById('music-float-window');
  if (!floatWin) return;

  if (isMusicPage) {
    floatWin.style.display = 'none';
    return;
  }

  // ═══════════════════════════════════════════
  // 3. 拖拽功能（鼠标 + 触摸）
  // ═══════════════════════════════════════════

  var dragHandle = document.getElementById('music-float-drag');
  if (!dragHandle) return;

  var isDragging = false;
  var startX, startY, startLeft, startTop;

  /** 从 localStorage 恢复位置 */
  function loadPosition() {
    try {
      var saved = localStorage.getItem('music-float-pos');
      if (saved) {
        var pos = JSON.parse(saved);
        if (typeof pos.left === 'number' && typeof pos.top === 'number') {
          floatWin.style.right = 'auto';
          floatWin.style.bottom = 'auto';
          floatWin.style.left = pos.left + 'px';
          floatWin.style.top = pos.top + 'px';
        }
      }
    } catch (e) { /* ignore */ }
  }

  /** 保存位置 */
  function savePosition() {
    try {
      localStorage.setItem('music-float-pos', JSON.stringify({
        left: floatWin.offsetLeft,
        top: floatWin.offsetTop
      }));
    } catch (e) { /* ignore */ }
  }

  /** 限制浮窗在可视区域内 */
  function clampPosition(left, top) {
    var maxLeft = window.innerWidth - floatWin.offsetWidth - 8;
    var maxTop = window.innerHeight - floatWin.offsetHeight - 8;
    return {
      left: Math.max(8, Math.min(left, maxLeft)),
      top: Math.max(8, Math.min(top, maxTop))
    };
  }

  function onDragStart(e) {
    if (e.target.closest('.aplayer-list')) return; // 不拦截播放列表点击
    isDragging = true;
    floatWin.classList.add('dragging');

    // 切换到 left/top 定位
    var rect = floatWin.getBoundingClientRect();
    floatWin.style.right = 'auto';
    floatWin.style.bottom = 'auto';
    floatWin.style.left = rect.left + 'px';
    floatWin.style.top = rect.top + 'px';

    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startX = clientX;
    startY = clientY;
    startLeft = rect.left;
    startTop = rect.top;

    e.preventDefault();
  }

  function onDragMove(e) {
    if (!isDragging) return;
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;
    var dx = clientX - startX;
    var dy = clientY - startY;
    var clamped = clampPosition(startLeft + dx, startTop + dy);
    floatWin.style.left = clamped.left + 'px';
    floatWin.style.top = clamped.top + 'px';
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    floatWin.classList.remove('dragging');
    savePosition();
  }

  // 鼠标事件
  dragHandle.addEventListener('mousedown', onDragStart);
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);

  // 触摸事件
  dragHandle.addEventListener('touchstart', onDragStart, { passive: false });
  document.addEventListener('touchmove', onDragMove, { passive: false });
  document.addEventListener('touchend', onDragEnd);

  // 窗口大小变化时修正位置
  window.addEventListener('resize', function () {
    if (floatWin.style.left) {
      var clamped = clampPosition(
        parseFloat(floatWin.style.left),
        parseFloat(floatWin.style.top)
      );
      floatWin.style.left = clamped.left + 'px';
      floatWin.style.top = clamped.top + 'px';
    }
  });

  // 恢复保存的位置
  loadPosition();

  console.log('[music-player] 浮窗播放器就绪');
})();
