import { getThemeSite } from '../lib/theme-site.mjs';
import { escapeHTML } from 'hexo-util';
export async function GET() {
  const site = await getThemeSite();
  const entries = site.posts.map((post) => `<entry><title>${escapeHTML(post.title)}</title><url>/${escapeHTML(post.path)}</url><content>${escapeHTML(post.content)}</content></entry>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><search>${entries}</search>`, { headers: { 'Content-Type': 'application/xml' } });
}
