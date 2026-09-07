import { getThemeSite } from '../../lib/theme-site.mjs';
import { load } from 'cheerio';

export async function GET() {
  const site = await getThemeSite();
  const entries = site.posts.map(post => ({
    title: post.title,
    url: '/' + post.path,
    text: load(post.content || '').text().replace(/\s+/g, ' ').trim(),
  }));
  return new Response(JSON.stringify(entries), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
