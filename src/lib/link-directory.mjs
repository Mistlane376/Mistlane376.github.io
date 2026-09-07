// Render the same directory structure before first paint, rather than inserting
// a 290px hero and statistics above already-visible cards in the browser.
export function renderLinkDirectory($) {
  const directory = $('.type-link .flink');
  if (!directory.length || directory.attr('data-directory-ready')) return;
  const lists = directory.find('.flink-list');
  const items = lists.find('.flink-list-item');
  if (!items.length) return;
  const domains = new Set();
  items.find('a[href]').each((_, link) => {
    try { domains.add(new URL($(link).attr('href')).hostname.replace(/^www\./, '')); } catch {}
  });
  let categories = 0;
  lists.each((index, node) => {
    const list = $(node);
    const count = list.find('.flink-list-item').length;
    if (!count) return;
    categories++;
    const heading = list.prevAll('h2').first();
    const section = $('<header class="link-directory-section-heading"><div><span>LINK COLLECTION</span><h2></h2></div><small></small></header>');
    section.find('h2').text(heading.text().trim() || `友链 ${index + 1}`);
    section.find('small').text(`${count} 个站点`);
    list.before(section);
  });
  directory.prepend(`<div class="link-directory-hero-copy"><span class="link-directory-kicker"><i class="fas fa-link" aria-hidden="true"></i> FRIEND LINK DIRECTORY</span><h1>友链</h1><p>收藏值得长期回访的个人站点与创作空间。</p></div><section class="link-directory-summary" aria-label="友链统计"><div class="link-directory-stats"><div><strong>${items.length}</strong><span>个友链</span></div><div><strong>${categories}</strong><span>种类型</span></div><div><strong>${domains.size}</strong><span>个独立域名</span></div></div></section>`);
  directory.attr('data-directory-ready', 'true');
}
