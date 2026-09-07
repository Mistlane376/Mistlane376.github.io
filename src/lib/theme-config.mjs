import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import yaml from 'js-yaml';

export const root = process.cwd();
export const themeDirectory = path.join(root, 'themes/mistlane');
export const readYaml = (file) => yaml.load(fs.readFileSync(file, 'utf8'));
const require = createRequire(import.meta.url);
const merge = (base, extra) => {
  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      base[key] = merge(base[key] && typeof base[key] === 'object' ? base[key] : {}, value);
    } else base[key] = value;
  }
  return base;
};

export function readConfiguration() {
  const config = { root: '/', search: { path: 'search.xml' }, ...readYaml(path.join(root, '_config.yml')) };
  const defaults = structuredClone(require(path.join(themeDirectory, 'scripts/common/default_config.js')));
  const theme = merge(merge(defaults, readYaml(path.join(themeDirectory, '_config.yml'))), readYaml(path.join(root, '_config.mistlane.yml')));
  if (theme.comments.use) theme.comments.use = Array.isArray(theme.comments.use) ? theme.comments.use : theme.comments.use.split(',').map((name) => name.trim());
  const plugins = readYaml(path.join(themeDirectory, 'plugins.yml'));
  theme.asset = Object.fromEntries(Object.entries(plugins).map(([key, { name, version, file }]) => [key, `https://cdn.jsdelivr.net/npm/${name}@${version}/${file}`]));
  Object.assign(theme.asset, Object.fromEntries(Object.entries(theme.CDN.option ?? {}).filter(([, value]) => value)));
  Object.assign(theme.asset, { main_css: '/css/index.css', main: '/js/main.js', utils: '/js/utils.js', translate: '/js/tw_cn.js', local_search: '/js/search/local-search.js', pjax: '/js/pjax.min.js', fontawesome: '/vendor/fontawesome/css/all.min.css' });
  // Math is already rendered by Astro; retain its local stylesheet during PJAX navigation.
  theme.math.use = false;
  theme.inject.head.push('<link rel="stylesheet" href="/vendor/katex/katex.min.css">');
  theme.inject.head.push('<link rel="alternate" type="application/atom+xml" title="Mistlane" href="/atom.xml">');
  theme.asset.typed = '/vendor/typed/typed.umd.js';
  theme.inject.bottom.push('<script defer src="/js/astro-theme.js"></script>');
  return { config, theme };
}
