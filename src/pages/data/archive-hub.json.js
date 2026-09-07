import { getThemeSite } from '../../lib/theme-site.mjs';
export async function GET() {
  const site = await getThemeSite();
  const data = {};
  for (const kind of ['tags', 'categories']) data[kind] = site[kind].map((item) => ({ name: item.name, count: item.length, href: '/' + item.path }));
  return Response.json(data);
}
