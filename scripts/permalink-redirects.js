/**
 * 旧永久链接跳转页
 *
 * 一部分早期文章的 abbrlink 是手写的，带了空格甚至前导空格
 * （例如 `Interval DP` → `/posts/Interval%20DP/`）。这类地址能访问，
 * 但复制、Markdown 链接、部分 CDN / 分享卡会解析出错，所以统一改成了
 * kebab-case。改完之后旧地址不能直接 404，否则搜索引擎和外部引用全断。
 *
 * 这里在 `hexo generate` 之后往 public/ 里补一份最轻量的 meta refresh 壳页：
 * 不用主题布局，只负责把浏览器和爬虫送到新地址，同时用 canonical 告诉
 * 搜索引擎"真正的内容在那边"。
 */

const fs = require('fs');
const path = require('path');

// 旧 slug -> 新 slug。只在永久链接发生迁移时追加，历史条目不要删。
const RETIRED_SLUGS = {
  'Interval DP': 'interval-dp',
  'Learning about HTML': 'learning-about-html',
  'Probability DP': 'probability-dp',
  'Recent competition review questions': 'recent-competition-review-questions',
  'Nowcoder Weekly Contest - Round 155': 'nowcoder-weekly-contest-round-155',
  'Nowcoder Weekly Contest - Round 156': 'nowcoder-weekly-contest-round-156'
};

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

const stubHtml = (newUrl) => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>页面已迁移</title>
<meta name="robots" content="noindex, follow">
<meta http-equiv="refresh" content="0; url=${escapeHtml(newUrl)}">
<link rel="canonical" href="${escapeHtml(newUrl)}">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f6f8f7;color:#2b3733;font:400 14px/1.7 -apple-system,"Segoe UI",system-ui,sans-serif}a{color:#18756f}</style>
</head>
<body>
<p>此地址已迁移到 <a href="${escapeHtml(newUrl)}">${escapeHtml(newUrl)}</a>，正在跳转…</p>
<script>location.replace(${JSON.stringify(newUrl).replace(/</g, '\\u003c')} + location.search + location.hash);</script>
</body>
</html>
`;

hexo.extend.filter.register('after_generate', () => {
  const publicDir = hexo.public_dir;
  const siteUrl = (hexo.config.url || '').replace(/\/+$/, '');
  const written = [];

  Object.entries(RETIRED_SLUGS).forEach(([oldSlug, newSlug]) => {
    const dir = path.join(publicDir, 'posts', oldSlug);
    const newUrl = `${siteUrl}/posts/${newSlug}/`;
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), stubHtml(newUrl));
      written.push(`/posts/${oldSlug}/ -> /posts/${newSlug}/`);
    } catch (error) {
      hexo.log.warn(`[permalink] 无法写入旧链接跳转页 ${oldSlug}: ${error.message}`);
    }
  });

  if (written.length) {
    hexo.log.info(`[permalink] 已生成 ${written.length} 个旧链接跳转页: ${written.join(', ')}`);
  }
});
