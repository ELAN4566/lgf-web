import type { SiteConfig } from '@lgf/shared/lib/site.ts';

export const site: SiteConfig = {
  id: 'mvs',
  name: 'MVS',
  tagline: 'Modellbahn Verwaltung System',
  url: 'https://mvs.lgf.ch',
  description:
    'MVS – die Verwaltung für Ihre Modellbahnsammlung: Fahrzeuge, Züge, Sets, Decoder, Wartung und Zubehör. Mit gemeinsamem Produktkatalog, Mobile App und Web-Ansicht.',
  nav: [
    { label: 'Übersicht', href: '/' },
    { label: 'Funktionen', href: '/funktionen/' },
    { label: 'Download & Preise', href: '/download/' },
    { label: 'News', href: '/news/' },
    { label: 'Support', href: '/support/' },
  ],
  contactEmail: 'support.mvs@lgf.ch',
  shop: {
    enabled: false,
    apiBase: '/api/shop',
  },
};
