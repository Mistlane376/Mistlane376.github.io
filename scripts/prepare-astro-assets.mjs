import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { join, basename } from 'node:path';
import stylus from 'stylus';
import nib from 'nib';
import { readConfiguration, root, themeDirectory } from '../src/lib/theme-config.mjs';

const destination = join(root, 'astro.public');
const { config, theme } = readConfiguration();
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
const assetsOnly = async (file) => {
  if (basename(file).startsWith('_') || basename(file).startsWith('.') || /\.(?:md|styl)$/i.test(file)) return false;
  if (/\.html$/i.test(file) && (await readFile(file, 'utf8')).startsWith('---')) return false;
  return true;
};
await cp(join(themeDirectory, 'source'), destination, { recursive: true, filter: assetsOnly });
await cp(join(root, 'source'), destination, { recursive: true, filter: assetsOnly });
await cp(join(root, 'node_modules/@fortawesome/fontawesome-free'), join(destination, 'vendor/fontawesome'), { recursive: true });
await cp(join(root, 'node_modules/katex/dist'), join(destination, 'vendor/katex'), { recursive: true });
await cp(join(root, 'node_modules/typed.js/dist'), join(destination, 'vendor/typed'), { recursive: true });
await cp(join(root, 'src/scripts/astro-theme.js'), join(destination, 'js/astro-theme.js'));
await cp(join(root, 'source/_data/bangumis.json'), join(destination, 'data/bangumis.json'));

const filename = join(themeDirectory, 'source/css/index.styl');
// Stylus/glob returns //?/D:/ paths on Windows, which Node's require cannot resolve.
if (process.platform === 'win32') {
  const find = stylus.utils.find;
  stylus.utils.find = (...args) => find(...args)?.map((file) => file.replace(/^\/\/\?\//, ''));
}
const css = stylus(await readFile(filename, 'utf8'))
  .use(nib()).set('filename', filename).set('include css', true).set('compress', true)
  .define('hexo-config', (key) => key.val.split('.').reduce((value, part) => value?.[part], theme) ?? '')
  .define('$highlight_enable', true).define('$highlight_line_number', true)
  .define('$prismjs_enable', false).define('$prismjs_line_number', false)
  .define('$language', config.language).render();
await writeFile(join(destination, 'css/index.css'), css);
