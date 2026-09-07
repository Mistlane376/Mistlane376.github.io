(() => {
  const updateVisibility = () => { document.documentElement.dataset.pageHidden = String(document.hidden); };
  document.addEventListener('visibilitychange', updateVisibility);
  updateVisibility();
  // Home cards are inserted after PJAX's initial scan. Register those links too.
  const refreshLinks = () => queueMicrotask(() => window.pjax?.refresh(document));
  document.addEventListener('DOMContentLoaded', refreshLinks);
  document.addEventListener('pjax:complete', refreshLinks);

  // Twikoo 1.7.15 renders icon-only actions and can replace them after replies.
  // Watch only the comment subtree, not the whole page or React/Svelte islands.
  let commentObserver;
  const enhanceComments = () => {
    commentObserver?.disconnect();
    const root = document.getElementById('post-comment');
    if (!root) return;
    const update = () => {
      root.querySelectorAll('textarea:not([aria-label])').forEach(input => input.setAttribute('aria-label', '评论内容'));
      root.querySelectorAll('a.__markdown').forEach(link => link.setAttribute('aria-label', 'Markdown 语法帮助'));
      root.querySelectorAll('.tk-action-link').forEach(button => {
        const path = button.querySelector('.tk-action-icon:not(.tk-action-icon-solid) path')?.getAttribute('d') || '';
        // Identify the pinned version's thumbs-up, thumbs-down and reply icons.
        const label = path.startsWith('M171.5') ? (button.classList.contains('tk-liked') ? '取消点赞' : '点赞评论')
          : path.startsWith('M360 32') ? (button.classList.contains('tk-disliked') ? '取消不赞同' : '不赞同评论')
          : path.startsWith('M51.9') ? '回复评论' : button.getAttribute('title');
        if (label) button.setAttribute('aria-label', label);
      });
      root.querySelectorAll('img.tk-avatar-img, img.tk-owo-emotion').forEach(img => {
        const size = img.classList.contains('tk-avatar-img') ? 48 : 24;
        if (!img.hasAttribute('width')) img.setAttribute('width', String(size));
        if (!img.hasAttribute('height')) img.setAttribute('height', String(size));
      });
    };
    update();
    commentObserver = new MutationObserver(update);
    commentObserver.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  };
  document.addEventListener('DOMContentLoaded', enhanceComments);
  document.addEventListener('pjax:complete', enhanceComments);
  document.addEventListener('pjax:send', () => commentObserver?.disconnect());
})();
