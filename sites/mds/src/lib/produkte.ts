import { getCollection, type CollectionEntry } from 'astro:content';

export type Produkt = CollectionEntry<'produkte'>;

export const kategorien = [
  {
    id: 'decoder',
    titel: 'Decoder',
    text: 'Basiskomponenten: Universaldecoder, Basisadapter und Spezialdecoder.',
  },
  {
    id: 'interface',
    titel: 'Interface-Module',
    text: 'Werden in beliebiger Kombination auf die Decoder gesteckt – jedes Modul passt auf jeden Steckplatz.',
  },
  {
    id: 'ledbus',
    titel: 'LEDBUS-Adapter',
    text: 'Adressierbare LED für Signale, Einzel-LED, RGB/WWA-LED und LED-Streifen mit Animationen.',
  },
  {
    id: 'komplett',
    titel: 'Komplettgeräte',
    text: 'Fertig bestückte Geräte für den schnellen Einstieg.',
  },
  {
    id: 'zubehoer',
    titel: 'Zubehör',
    text: 'Ergänzungen zu Decodern, Interface-Modulen und LEDBUS.',
  },
] as const;

/** Reihenfolge der Gruppen bei den Interface-Modulen */
export const interfaceGruppen = ['Schalten & Steuern', 'Belegtmeldung', 'Beleuchtung', 'Tasten', 'Weitere'];

/** URL-Teil einer Artikelnummer: MDS-BASIS -> mds-basis */
export const slug = (artikel: string) => artikel.toLowerCase();

export async function getProdukte(): Promise<Produkt[]> {
  const all = await getCollection('produkte', (p: Produkt) => !p.data.ausgeblendet);
  return all.sort((a: Produkt, b: Produkt) => a.data.reihenfolge - b.data.reihenfolge);
}
