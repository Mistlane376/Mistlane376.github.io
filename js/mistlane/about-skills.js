/**
 * About 页面技能条动画
 */

(function() {
  'use strict';

  // 等待 DOM 加载完成
  document.addEventListener('DOMContentLoaded', function() {
    // 获取所有技能条
    const skillFills = document.querySelectorAll('.skill-fill');

    if (skillFills.length === 0) return;

    // 使用 Intersection Observer 监听元素是否进入视口
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 元素进入视口，触发动画
          const fill = entry.target;
          const width = fill.style.getPropertyValue('--skill-width');

          // 先设置为 0，然后延迟一帧后设置实际宽度触发过渡
          fill.style.width = '0%';

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              fill.style.width = width;
            });
          });

          // 动画完成后取消观察
          observer.unobserve(fill);
        }
      });
    }, {
      threshold: 0.5, // 50% 可见时触发
      rootMargin: '0px 0px -50px 0px'
    });

    // 观察每个技能条
    skillFills.forEach(fill => {
      observer.observe(fill);
    });
  });

})();
