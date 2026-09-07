import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

let manifest;
export function optimizeHtml(html) {
  manifest ??= JSON.parse(fs.readFileSync(path.join(process.cwd(), 'astro.public/data/image-manifest.json'), 'utf8'));
  const $ = load(html);
  $('img').each((_, element) => {
    const image = $(element);
    const info = manifest[image.attr('src')];
    if (info) image.attr({ src: info.src, width: String(info.width), height: String(info.height) });
    // The navigation logo sets only its CSS height; retain the original aspect ratio.
    if (image.closest('#nav').length) image.attr('style', `${image.attr('style') || ''};width:auto`);
    image.attr('decoding', 'async');
    if (!image.closest('#nav').length) image.attr('loading', 'lazy');
  });
  $('[style]').each((_, element) => {
    const node = $(element);
    let style = node.attr('style');
    for (const [url, image] of Object.entries(manifest)) style = style.replaceAll(url, image.src);
    node.attr('style', style);
  });
  const heroStyle = $('#page-header').attr('style') || '';
  const hero = /url\(['"]?([^)'"\s]+)/.exec(heroStyle)?.[1];
  if (hero?.startsWith('/')) $('head').append(`<link rel="preload" as="image" href="${hero}" fetchpriority="high">`);
  return $.html();
}
