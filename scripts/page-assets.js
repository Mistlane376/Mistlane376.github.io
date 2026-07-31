/**
 * Load feature assets only on the pages that use them.
 * Keeping this at build time avoids a global runtime router and lets browsers
 * cache each feature independently.
 */
const pageAssets = [
  { test: /^index\.html$/, scripts: ['/js/home-hero.js'] },
  { test: /^archive\/index\.html$/, scripts: ['/js/archive-hub.js'] },
  { test: /^categories\/index\.html$/, scripts: ['/js/category-cards.js'] },
  { test: /^categories\/[^/]+\/index\.html$/, scripts: ['/js/category-detail.js'] },
  { test: /^album\/index\.html$/, styles: ['/css/album.css'], scripts: ['/js/album.js'] },
  { test: /^about\/index\.html$/, styles: ['/css/about-envelope.css'] },
  { test: /^link\/index\.html$/, scripts: ['/js/link-directory.js'] },
  {
    test: /^posts\/[^/]+\/index\.html$/,
    styles: ['/css/comments.css']
  }
];

hexo.extend.filter.register('after_render:html', function (content, data) {
  const path = data && data.path;
  if (!path || content.includes('data-page-assets="true"')) return content;

  const assets = pageAssets.find((entry) => entry.test.test(path));
  if (!assets) return content;

  const styles = (assets.styles || [])
    .map((href) => `  <link data-page-assets="true" rel="stylesheet" href="${href}">`)
    .join('\n');
  const scripts = (assets.scripts || [])
    .map((src) => `  <script data-page-assets="true" defer src="${src}"></script>`)
    .join('\n');

  if (styles) content = content.replace('</head>', `${styles}\n</head>`);
  if (scripts) content = content.replace('</body>', `${scripts}\n</body>`);
  return content;
});
