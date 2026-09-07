import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import pug from 'pug';
import moment from 'moment-timezone';
import { load } from 'cheerio';
import { marked } from 'marked';
import { escapeHTML, stripHTML, highlight } from 'hexo-util';
import { readConfiguration, readYaml, root, themeDirectory } from './theme-config.mjs';
import { optimizeHtml } from './optimize-html.mjs';

export class Collection {
  constructor(data = []) { this.data = data; }
  get length() { return this.data.length; }
  toArray() { return this.data.slice(); }
  map(fn) { return this.data.map(fn); }
  forEach(fn) { return this.data.forEach(fn); }
  each(fn) { return this.data.forEach(fn); }
  filter(fn) { return new Collection(this.data.filter(fn)); }
  limit(n) { return new Collection(this.data.slice(0, n)); }
  sort(key = 'date', direction = 1) { return new Collection(this.data.slice().sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * direction)); }
}

export function themeContent(html) {
  const $ = load(html ?? '', {}, false);
  $('pre > code').each((_, element) => {
    const code = $(element);
    const lang = code.parent().attr('data-language') || (code.attr('class') || '').replace('language-', '');
    code.parent().replaceWith(highlight(code.text(), { lang, gutter: true, hljs: false, autoDetect: false }));
  });
  return $.html();
}

function tableOfContents(html) {
  const $ = load(html || '', {}, false);
  const roots = [];
  const stack = [];
  $('h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]').each((_, element) => {
    const node = { level: Number(element.tagName[1]), id: $(element).attr('id'), text: $(element).text(), children: [] };
    while (stack.length && stack.at(-1).level >= node.level) stack.pop();
    (stack.at(-1)?.children ?? roots).push(node);
    stack.push(node);
  });
  const render = (nodes, nested = false) => `<ol class="${nested ? 'toc-child' : 'toc'}">${nodes.map((node) => `<li class="toc-item toc-level-${node.level}"><a class="toc-link" href="#${encodeURIComponent(node.id)}"><span class="toc-text">${escapeHTML(node.text)}</span></a>${node.children.length ? render(node.children, true) : ''}</li>`).join('')}</ol>`;
  return roots.length ? render(roots) : '';
}

// Register the existing theme's pure template helpers without starting Hexo.
function themeHelpers(site, config, theme) {
  const helpers = {};
  const bridge = { config, theme: { config: theme }, version: 'Astro', locals: { get: (key) => site[key] } };
  bridge.extend = { helper: { register: (name, fn) => { helpers[name] = fn; } } };
  for (const name of ['page', 'inject_head_js', 'related_post', 'series']) {
    const filename = path.join(themeDirectory, `scripts/helpers/${name}.js`);
    const require = createRequire(filename);
    new Function('hexo', 'require', fs.readFileSync(filename, 'utf8'))(bridge, require);
  }
  helpers.seriesContext = (post) => {
    const group = site.seriesGroups.find((group) => group.name === post.series);
    if (!group) return null;
    const index = group.posts.findIndex((item) => item.path === post.path);
    return { ...group, current: index + 1, percent: Math.round((index + 1) / group.count * 100), previous: group.posts[index - 1], next: group.posts[index + 1] };
  };
  return helpers;
}

const templates = new Map();
export function renderTheme(page, site, template = 'page') {
  const { config, theme } = readConfiguration();
  const translations = readYaml(path.join(themeDirectory, 'languages/zh-CN.yml'));
  const urlFor = (url = '') => /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(String(url)) ? String(url) : '/' + String(url).replace(/^\//, '');
  const fullUrl = (url = '') => new URL(urlFor(url), config.url).href;
  const date = (value, format = config.date_format) => moment(value).tz(config.timezone).format(format);
  const words = (content) => stripHTML(content || '').match(/[\u3400-\u9fff]|[A-Za-z0-9_]+/g)?.length ?? 0;
  const globals = {
    config, theme, site, page, url: fullUrl(page.path), path: page.path,
    globalPageType: page.layout, pageTitle: page.title || config.title,
    is_home: () => page.layout === 'home', is_post: () => page.layout === 'post',
    url_for: urlFor, full_url_for: fullUrl, date, full_date: (value) => date(value, 'YYYY-MM-DD HH:mm:ss'),
    date_xml: (value) => moment(value).toISOString(), time: date,
    _p: (key, ...args) => {
      const value = key.split('.').reduce((value, part) => value?.[part], translations);
      let index = 0;
      return String(value ?? key).replace(/%[sd]/g, () => args[index++] ?? '');
    },
    trim: (text) => String(text).trim(), strip_html: stripHTML, escape_html: escapeHTML, markdown: (text) => marked.parse(text || ''),
    wordcount: words, totalcount: () => site.posts.map((post) => words(post.content)).reduce((a, b) => a + b, 0),
    min2read: (content) => Math.max(1, Math.ceil(words(content) / 300)), toc: tableOfContents,
    favicon_tag: (url) => `<link rel="icon" href="${escapeHTML(urlFor(url))}">`,
    open_graph: (options) => `<meta name="description" content="${escapeHTML(page.description || config.description)}"><meta property="og:title" content="${escapeHTML(page.title || config.title)}"><meta property="og:url" content="${fullUrl(page.path)}"><meta property="og:image" content="${escapeHTML(options.image)}">`,
    fragment_cache: (_key, fn) => fn(),
    list_categories: () => `<ul class="category-list">${site.categories.map((item) => `<li class="category-list-item"><a class="category-list-link" href="${urlFor(item.path)}">${escapeHTML(item.name)}</a><span class="category-list-count">${item.length}</span></li>`).join('')}</ul>`,
    paginator: () => Array.from({ length: page.total || 1 }, (_, index) => `<a class="page-number${index + 1 === page.current ? ' current' : ''}" href="${index ? `/page/${index + 1}/` : '/'}">${index + 1}</a>`).join(''),
    showToc: page.layout === 'post' && Boolean(tableOfContents(page.content)),
    needLoadCountJs: false, loadSubJs: false, commentsJsLoad: false,
  };
  for (const [name, fn] of Object.entries(themeHelpers(site, config, theme))) globals[name] = fn.bind(globals);
  const renderFile = (name, data = {}) => {
    const filename = path.join(themeDirectory, 'layout', `${name}.pug`);
    if (!templates.has(filename) || import.meta.env?.DEV) templates.set(filename, pug.compileFile(filename));
    return templates.get(filename)({ ...globals, ...data });
  };
  globals.partial = renderFile;
  return optimizeHtml(renderFile(template).replace(/<a href="https:\/\/hexo.io">Hexo(?: [^<]*)?<\/a>/, '<a href="https://astro.build">Astro</a>'));
}
