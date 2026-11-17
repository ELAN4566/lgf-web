/**
 * Konfiguration einer einzelnen Website (wortuhr, mds, mvs, lgf).
 * Jede Site legt ihre Werte in `src/site.config.ts` fest.
 */
export type SiteId = 'wortuhr' | 'mds' | 'mvs' | 'lgf';

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteConfig {
  id: SiteId;
  /** Anzeigename, z. B. "Wortuhr" */
  name: string;
  /** Kurzer Zusatz im Seitentitel, z. B. "Die Zeit in Mundart" */
  tagline: string;
  /** Öffentliche Adresse ohne Schrägstrich am Ende */
  url: string;
  /** Standard-Beschreibung für Suchmaschinen */
  description: string;
  nav: NavItem[];
  /** Kontaktadresse, die auf dieser Site angezeigt wird */
  contactEmail: string;
  /**
   * Shop vorbereitet, aber ausgeschaltet. Wird später auf `enabled: true`
   * gestellt, sobald das Shop-Backend unter `apiBase` läuft.
   */
  shop: {
    enabled: boolean;
    apiBase: string;
  };
}

/** Angaben zur Firma – gemeinsam für alle Sites (Impressum, Fusszeile). */
export const company = {
  name: 'LGF Informatik AG',
  street: 'Oekingenstrasse 12',
  zip: '4566',
  city: 'Kriegstetten',
  canton: 'SO',
  country: 'Schweiz',
  phone: '+41 32 674 44 22',
  email: 'info@lgf.ch',
  web: 'https://www.lgf.ch',
  // UID (CHE-xxx.xxx.xxx) freiwillig – in CH keine Impressumspflicht; leer = Zeile ausgeblendet
  uid: '',
} as const;

/** Die Schwester-Sites für Querverweise in der Fusszeile. */
export const siblingSites: { id: SiteId; name: string; url: string }[] = [
  { id: 'wortuhr', name: 'Wortuhr', url: 'https://wortuhr.lgf.ch' },
  { id: 'mds', name: 'MDS – Modellbahn Decoder System', url: 'https://mds.lgf.ch' },
  { id: 'mvs', name: 'MVS – Modellbahn Verwaltung System', url: 'https://mvs.lgf.ch' },
  { id: 'lgf', name: 'LGF Informatik AG', url: 'https://www.lgf.ch' },
];
