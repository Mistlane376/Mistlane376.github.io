import { getThemeSite } from '../lib/theme-site.mjs';
import { escapeHTML } from 'hexo-util';
export async function GET() {
  const site = await getThemeSite();
  const urls = [...site.routes.values()].map(({ page }) => `<url><loc>${escapeHTML(page.permalink)}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
}
