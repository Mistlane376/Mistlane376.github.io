import { getThemeSite } from '../lib/theme-site.mjs';
import { readConfiguration } from '../lib/theme-config.mjs';
import { escapeHTML } from 'hexo-util';
export async function GET() {
  const site = await getThemeSite();
  const { config } = readConfiguration();
  const entries = site.posts.map((post) => `<entry><title>${escapeHTML(post.title)}</title><id>${escapeHTML(post.permalink)}</id><link href="${escapeHTML(post.permalink)}"/><published>${post.date.toISOString()}</published><updated>${post.updated.toISOString()}</updated><summary>${escapeHTML(post.description || '')}</summary></entry>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>${escapeHTML(config.title)}</title><id>${config.url}/</id><link href="${config.url}/atom.xml" rel="self"/><link href="${config.url}/"/><updated>${site.posts.data[0]?.updated.toISOString() ?? new Date().toISOString()}</updated><author><name>${escapeHTML(config.author)}</name></author>${entries}</feed>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/atom+xml' } });
}
