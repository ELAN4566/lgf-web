import type { SiteConfig } from '@lgf/shared/lib/site.ts';

export const site: SiteConfig = {
  id: 'mds',
  name: 'MDS',
  tagline: 'Modellbahn Decoder System',
  url: 'https://mds.lgf.ch',
  description:
    'MDS – modulare, drahtlose Zubehördecoder für die Modellbahn: Weichen, Signale, Belegtmelder, Beleuchtung und Sound mit einem einzigen Decodertyp, konfiguriert über WLAN.',
  nav: [
    { label: 'Übersicht', href: '/' },
    { label: 'Konzept', href: '/konzept/' },
    { label: 'Hardware', href: '/hardware/' },
    { label: 'Software', href: '/software/' },
    { label: 'Download', href: '/download/' },
    { label: 'News', href: '/news/' },
    { label: 'Support', href: '/support/' },
  ],
  // wie bisher auf der Zeta-Producer-Site
  contactEmail: 'support.mvs@lgf.ch',
  shop: {
    enabled: false,
    apiBase: '/api/shop',
  },
};
