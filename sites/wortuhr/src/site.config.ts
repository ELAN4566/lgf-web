import type { SiteConfig } from '@lgf/shared/lib/site.ts';

export const site: SiteConfig = {
  id: 'wortuhr',
  name: 'Wortuhr',
  tagline: 'Die Zeit in Mundart',
  url: 'https://wortuhr.lgf.ch',
  description:
    'Die Wortuhr zeigt die Zeit so an, wie man sie sagt – auf Solothurner oder Berner Dialekt. Entwickelt und von Hand zusammengebaut in Kriegstetten SO.',
  nav: [
    { label: 'Wortuhr', href: '/' },
    { label: 'Funktionen', href: '/#funktionen' },
    { label: 'Technik', href: '/#technik' },
    { label: 'News', href: '/news/' },
    { label: 'Vormerken', href: '/vormerken/' },
  ],
  contactEmail: 'erich.landolt@lgf.ch',
  shop: {
    enabled: false,
    apiBase: '/api/shop',
  },
};
