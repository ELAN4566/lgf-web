/**
 * News: gemeinsame Ablage für alle Sites unter `content/news/` im Repo-Stamm.
 * Jede Meldung legt im Feld `sites` fest, auf welchen Sites sie erscheint.
 */
import { defineCollection, getCollection, type CollectionEntry } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import type { SiteId } from './site';

/** Collection-Definition – wird in `src/content.config.ts` jeder Site verwendet. */
export function newsCollection() {
  return defineCollection({
    // Pfad relativ zum Site-Ordner (sites/<name>/)
    loader: glob({ pattern: '**/*.md', base: '../../content/news' }),
    schema: ({ image }) =>
      z.object({
        title: z.string(),
        date: z.coerce.date(),
        /** Ein, zwei Sätze für Übersicht, RSS und Suchmaschinen */
        summary: z.string(),
        sites: z.array(z.enum(['wortuhr', 'mds', 'mvs', 'lgf'])).min(1),
        cover: image().optional(),
        coverAlt: z.string().optional(),
        /** Als Hinweisband oben auf der Site anzeigen */
        highlight: z.boolean().default(false),
        /** Hinweisband nach diesem Datum nicht mehr anzeigen */
        highlightUntil: z.coerce.date().optional(),
        /** Kurztext für das Hinweisband (sonst der Titel) */
        highlightText: z.string().optional(),
        /** Entwürfe erscheinen nur in der lokalen Vorschau (npm run dev) */
        draft: z.boolean().default(false),
      }),
  });
}

export type NewsEntry = CollectionEntry<'news'>;

/** Alle Meldungen einer Site, neueste zuerst. Entwürfe nur im Dev-Modus. */
export async function getNewsForSite(site: SiteId): Promise<NewsEntry[]> {
  const all = await getCollection('news', (e: NewsEntry) =>
    e.data.sites.includes(site) && (import.meta.env.DEV || !e.data.draft),
  );
  return all.sort((a: NewsEntry, b: NewsEntry) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Die aktuelle Meldung für das Hinweisband (falls vorhanden). */
export async function getHighlight(site: SiteId): Promise<NewsEntry | undefined> {
  const now = Date.now();
  const list = await getNewsForSite(site);
  return list.find(
    (e) => e.data.highlight && (!e.data.highlightUntil || e.data.highlightUntil.valueOf() >= now),
  );
}

/** Datum im Schweizer Format, z. B. "16. November 2026" */
export function formatDate(d: Date): string {
  return d.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
}
