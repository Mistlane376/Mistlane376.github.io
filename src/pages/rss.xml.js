import rss from '@astrojs/rss';
import { getThemeSite } from '../lib/theme-site.mjs';
import { readConfiguration } from '../lib/theme-config.mjs';

export async function GET(context) {
  const site = await getThemeSite();
  const { config } = readConfiguration();
  return rss({ title: config.title, description: config.description, site: context.site,
    items: site.posts.map((post) => ({ title: post.title, description: post.description ?? '', pubDate: post.date, link: '/' + post.path })),
  });
}
