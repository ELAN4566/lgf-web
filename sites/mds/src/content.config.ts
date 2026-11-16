import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import { newsCollection } from '@lgf/shared/lib/news.ts';

/** MDS-Produktkatalog: src/data/produkte.yaml (Schlüssel = Artikelnummer) */
const produkte = defineCollection({
  loader: file('src/data/produkte.yaml'),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      kategorie: z.enum(['decoder', 'interface', 'ledbus', 'komplett', 'zubehoer']),
      gruppe: z.string().optional(),
      reihenfolge: z.number().default(99),
      bild: image().optional(),
      kurz: z.string(),
      punkte: z.array(z.string()).default([]),
      /** Artikel nicht anzeigen (z. B. ausgelaufen) */
      ausgeblendet: z.boolean().default(false),
    }),
});

// News liegen gemeinsam für alle Sites unter /content/news (Repo-Stamm)
export const collections = {
  news: newsCollection(),
  produkte,
};
