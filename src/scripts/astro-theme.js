(() => {
  // Home cards are inserted after PJAX's initial scan. Register those links too.
  const refreshLinks = () => queueMicrotask(() => window.pjax?.refresh(document));
  document.addEventListener('DOMContentLoaded', refreshLinks);
  document.addEventListener('pjax:complete', refreshLinks);
})();
