import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getNewsForSite } from '@lgf/shared/lib/news.ts';
import { site } from '../../site.config';

export async function GET(context: APIContext) {
  const news = await getNewsForSite(site.id);
  return rss({
    title: `${site.name} – News`,
    description: site.description,
    site: context.site ?? site.url,
    items: news.map((e) => ({
      title: e.data.title,
      pubDate: e.data.date,
      description: e.data.summary,
      link: `/news/${e.id}/`,
    })),
    customData: '<language>de-ch</language>',
  });
}
