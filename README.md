# lgf-web

Websites der LGF Informatik AG, gebaut mit [Astro](https://astro.build).

| Site | Adresse | Ordner | Stand |
|---|---|---|---|
| Wortuhr | wortuhr.lgf.ch | `sites/wortuhr` | im Aufbau |
| MDS | mds.lgf.ch | `sites/mds` | Entwurf Startseite (online noch Zeta Producer) |
| MVS | mvs.lgf.ch | `sites/mvs` | Entwurf Startseite (online noch Zeta Producer) |
| LGF | www.lgf.ch | – | noch Zeta Producer, später Landing Page |

## Aufbau

```
content/news/            News aller Sites (Feld "sites" bestimmt, wo sie erscheinen)
packages/shared/         Gemeinsamer Baukasten: Layout, Kopf-/Fusszeile, News, Rechtstexte, Stile
sites/wortuhr/           Wortuhr-Site (Seiten, Live-Demo, Bilder, Farben)
deploy/                  nginx-Vorlagen, systemd-Timer, Deploy-Skript, Server-Anleitung
.github/workflows/       Build auf GitHub -> Branch "deploy"
```

## Arbeiten

Voraussetzung: Node.js ≥ 22.23 (installiert: 26 LTS).

```bash
npm install              # einmalig bzw. nach Paket-Änderungen
npm run dev:wortuhr      # Vorschau mit Live-Aktualisierung: http://localhost:4321
npm run build:wortuhr    # fertige Site nach sites/wortuhr/dist
```

Empfohlener Editor: VS Code mit der Erweiterung «Astro».

## News schreiben

Neuer Ordner unter `content/news/`, Name = Adresse der Meldung (z. B. `2027-01-erste-lieferung`),
darin eine `index.md`:

```markdown
---
title: Erste Wortuhren ausgeliefert
date: 2027-01-20
summary: Ein, zwei Sätze für Übersicht, RSS und Google.
sites: [wortuhr]           # oder [mds, mvs] – erscheint auf mehreren Sites
cover: ./bild.jpg          # optional, Bild im selben Ordner
coverAlt: Beschreibung des Bildes
highlight: true            # optional: Hinweisband oben auf der Site
highlightText: Kurztext fürs Hinweisband
highlightUntil: 2027-02-15 # Band verschwindet danach automatisch
draft: true                # optional: nur in der lokalen Vorschau sichtbar
---

Text in **Markdown** …

![Beschreibung](./weiteres-bild.jpg)
```

Bilder einfach in den Ordner legen (idealerweise ≤ 3000 px breit). Astro erzeugt beim Build
automatisch verkleinerte WebP-Versionen. Grosse Downloads (Setups, Firmware, Videos) gehören
nicht ins Repo, sondern auf appsrv nach `/var/www/downloads`.

## Veröffentlichen

`git push` auf `main` → GitHub Action baut alle Sites → Branch `deploy` → appsrv holt ihn
spätestens nach 5 Minuten. Einrichtung der Server: [deploy/README-server.md](deploy/README-server.md).

## MDS-Produktkatalog

Alle Hardware-Artikel stehen in `sites/mds/src/data/produkte.yaml` (Schlüssel = Artikelnummer).
Daraus entstehen automatisch die Übersicht `/hardware/` und je eine Produktseite
`/hardware/<artikel>/`. Neuer Artikel = neuer Eintrag + Bild in `sites/mds/src/assets/produkte/`.
Die Artikelnummer ist auch der spätere Schlüssel für Preise/Lager aus der Datenbank (Shop).

## Umstellung MDS/MVS: zu klären

- `/MdsClient` und `/MvsClient/` (ClickOnce) sowie `/media/files/*.pdf` müssen unter denselben
  Adressen erreichbar bleiben – siehe `deploy/nginx/appsrv-mds.lgf.ch.conf` / `appsrv-mvs.lgf.ch.conf`.
- mvs.lgf.ch bedient evtl. weitere MVS-Serverdienste (Web-Ansicht, Mobile-App) – vor der
  Umstellung Pfade erheben.
- Alte `.html`-Adressen werden per 301 auf die neuen Seiten umgeleitet (in den nginx-Vorlagen).

## Wortuhr-Demo

`sites/wortuhr/src/components/WordClock.astro` liest
`sites/wortuhr/src/data/wrdclk_words_de-CH-SO.json` – eine Kopie der Firmware-Datei
`MDSDEC/src/products/wordclock/filesystem/wrdclk_words_de-CH-SO_rel2.json`.
Bei Änderungen an der Matrix die Datei neu kopieren. Die Logik entspricht `WordClockManager`
(timeRules, Minuten- und Sekundenpunkte, alarmRules).

## Vorbereitet für später

- **Französisch:** `i18n` in `astro.config.mjs` ist eingerichtet; Seiten unter `src/pages/fr/`.
- **Shop:** `shop.enabled` in `site.config.ts`, Warenkorb-Symbol in der Kopfzeile,
  `/api/shop/` in der nginx-Vorlage (auskommentiert) für ein ASP.NET-Core-Backend mit DB-Zugriff.
