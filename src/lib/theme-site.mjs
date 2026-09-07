import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import moment from 'moment-timezone';
import { getCollection } from 'astro:content';
import { readConfiguration, readYaml, root } from './theme-config.mjs';
import { Collection, themeContent } from './theme-renderer.mjs';

const names = (value) => value ? (Array.isArray(value) ? value.flat(Infinity) : [value]) : [];
const taxonomyPath = (kind, name) => `${kind}/${String(name).replaceAll(' ', '-')}/`;
let builtSite;

async function buildSite() {
  const { config, theme } = readConfiguration();
  const entries = await getCollection('posts');
  const entryDates = (entry) => {
    // YAML timestamps without an offset represent the blog's local time, not UTC.
    const { data } = matter(fs.readFileSync(entry.filePath, 'utf8'), { engines: { yaml: (source) => yaml.load(source, { schema: yaml.JSON_SCHEMA }) } });
    const date = data.date ? moment.tz(String(data.date), config.timezone).toDate() : entry.data.date;
    const updated = data.updated ? moment.tz(String(data.updated), config.timezone).toDate() : date;
    return { date, updated };
  };
  const posts = entries.filter((entry) => !entry.data.draft).map((entry) => {
    const route = `posts/${entry.data.abbrlink ?? entry.id}/`;
    return { ...entry.data, _id: entry.id, layout: 'post', path: route, permalink: new URL(route, config.url).href,
      source: entry.filePath, content: themeContent(entry.rendered?.html), cover: entry.data.cover ?? theme.cover.default_cover,
      cover_type: 'img', ...entryDates(entry),
    };
  }).filter((post) => !post.date || +post.date <= Date.now()).sort((a, b) => +b.date - +a.date);
  const site = { posts: new Collection(posts), data: {} };
  for (const kind of ['tags', 'categories']) {
    const groups = new Map();
    for (const post of posts) for (const name of names(post[kind])) {
      if (!groups.has(name)) groups.set(name, { name, path: taxonomyPath(kind, name), posts: new Collection() });
      groups.get(name).posts.data.push(post);
    }
    site[kind] = new Collection([...groups.values()].map((group) => ({ ...group, length: group.posts.length })));
    for (const post of posts) post[kind] = new Collection(names(post[kind]).map((name) => site[kind].data.find((group) => group.name === name)));
  }
  posts.forEach((post, index) => { post.prev = posts[index - 1]; post.next = posts[index + 1]; });
  const series = new Map();
  for (const post of posts) if (post.series) {
    if (!series.has(post.series)) series.set(post.series, []);
    series.get(post.series).push(post);
  }
  site.seriesGroups = [...series].map(([name, items]) => ({ name, slug: encodeURIComponent(name), count: items.length,
    description: items.find((post) => post.series_description)?.series_description ?? '', latest: Math.max(...items.map((post) => +post.updated)),
    posts: items.slice().sort((a, b) => (a.series_order ?? Infinity) - (b.series_order ?? Infinity) || +a.date - +b.date).map((post, index) => ({ title: post.title, path: post.path, description: post.description, index: index + 1 })),
  }));
  site.data.link = readYaml(path.join(root, 'source/_data/link.yml'));
  const momentEntries = await getCollection('moments');
  site.moments = momentEntries.map((entry) => ({ ...entry.data, ...entryDates(entry), id: entry.id, images: names(entry.data.images), tags: names(entry.data.tags), content: entry.rendered?.html ?? '' }))
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || +new Date(b.date) - +new Date(a.date));

  const routes = new Map();
  const add = (route, page, template = 'page') => {
    const key = route.replace(/^\/+|\/+$/g, '');
    if (routes.has(key)) throw new Error(`Duplicate Astro route: ${route}`);
    routes.set(key, { template, page: { content: '', total: 1, ...page, path: key ? key + '/' : '', permalink: new URL(key ? key + '/' : '/', config.url).href } });
  };
  const perPage = config.per_page || 10;
  const pages = Math.max(1, Math.ceil(posts.length / perPage));
  for (let number = 1; number <= pages; number++) add(number === 1 ? '' : `page/${number}`, { layout: 'home', posts: new Collection(posts.slice((number - 1) * perPage, number * perPage)), current: number, total: pages }, 'index');
  for (const post of posts) add(post.path, post, 'post');
  for (const kind of ['tags', 'categories']) for (const group of site[kind].data) {
    const type = kind === 'tags' ? 'tag' : 'category';
    add(group.path, { layout: type, title: group.name, [type]: group.name, posts: group.posts }, type);
  }
  for (const entry of await getCollection('pages')) {
    const relative = path.relative(path.join(root, 'source'), path.resolve(entry.filePath)).replaceAll('\\', '/');
    const route = entry.data.permalink || relative.replace(/(?:\/index)?\.md$/, '');
    add(route, { ...entry.data, layout: 'page', content: themeContent(entry.rendered?.html) });
  }
  for (const directory of fs.readdirSync(path.join(root, 'source'), { withFileTypes: true })) {
    if (!directory.isDirectory() || directory.name.startsWith('_')) continue;
    const filename = path.join(root, 'source', directory.name, 'index.html');
    if (!fs.existsSync(filename)) continue;
    const document = matter(fs.readFileSync(filename, 'utf8'));
    if (Object.keys(document.data).length) add(document.data.permalink || directory.name, { ...document.data, layout: 'page', content: document.content });
  }
  add('series', { layout: 'page', title: '学习路径', type: 'series', comments: false, seriesGroups: site.seriesGroups });
  add('moments', { layout: 'page', title: '动态', type: 'moments', comments: false, moments: site.moments });
  site.routes = routes;
  return site;
}

export function getThemeSite() {
  if (import.meta.env.DEV) return buildSite();
  return builtSite ??= buildSite();
}
