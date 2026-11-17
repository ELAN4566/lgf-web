# Texte schreiben und publizieren

Kurzanleitung für den Alltag: Text ändern → in der Vorschau ansehen → publizieren.
Technischer Hintergrund: [README](../README.md), Server: [deploy/README-server.md](../deploy/README-server.md).

## Das Prinzip in einem Satz

Alles, was online ist, steht als Datei im Repo `C:\Devel\lgf-web`. Wer eine Datei ändert,
**committet** und **pusht**, hat die Änderung nach 5–7 Minuten online – ohne Server-Anmeldung.

```
Datei ändern ─→ Vorschau localhost ─→ commit ─→ push ─→ GitHub baut ─→ Server holt ab (≤ 5 min)
   (VS Code)       (npm run dev)        (lokal)  (GitHub)   (1–2 min)       wortuhr.lgf.ch …
```

## 1. Vorschau starten

In einem Terminal (VS Code: *Terminal → Neues Terminal*) im Ordner `C:\Devel\lgf-web`:

```bash
npm run dev:wortuhr      # http://localhost:4321
npm run dev:mds          # http://localhost:4322
npm run dev:mvs          # http://localhost:4323
```

Die Vorschau aktualisiert sich bei jedem Speichern selbst. Beenden mit `Ctrl+C`.
Nur nach einem `git pull` mit neuen Paketen oder bei Fehlermeldungen zu fehlenden Modulen:
`npm install`.

## 2. Wo steht welcher Text?

| Was | Datei |
|---|---|
| Startseite Wortuhr (Hero, Funktionen, Technik) | `sites/wortuhr/src/pages/index.astro` |
| Vormerken-Seite | `sites/wortuhr/src/pages/vormerken.astro` |
| Menü, Kontakt-E-Mail, Kurzbeschreibung (Google) | `sites/<site>/src/site.config.ts` |
| Seiten MDS / MVS | `sites/mds/src/pages/*.astro`, `sites/mvs/src/pages/*.astro` |
| MDS-Hardware (Artikel, Texte, Bilder) | `sites/mds/src/data/produkte.yaml` + `sites/mds/src/assets/produkte/` |
| Impressum, Datenschutz (alle Sites) | `packages/shared/src/components/legal/` |
| Firmenadresse (alle Sites) | `packages/shared/src/lib/site.ts` |
| News (alle Sites) | `content/news/<ordner>/index.md` |
| Bilder einer Seite | `sites/<site>/src/assets/bilder/` |

Tipp: In VS Code mit `Ctrl+Shift+F` nach einem Satz von der Website suchen – so findet man
die Datei am schnellsten.

### Texte in `.astro`-Dateien

Oben zwischen `---` steht Programmcode, darunter HTML. Normale Texte stehen zwischen Tags
und können direkt geändert werden:

```html
<p class="lead">
  Statt Zeigern leuchten Wörter: …
</p>
```

Achtung bei Links und **fett** mitten im Satz: Beginnt ein Link auf einer neuen Zeile, geht das
Leerzeichen davor verloren («siehe<a>Datenschutz</a>» → «sieheDatenschutz»). Abhilfe: `{' '}`
am Zeilenende einfügen:

```html
Verantwortlich ist die LGF Informatik AG – siehe{' '}
<a href="/datenschutz/">Datenschutz</a>.
```

Sonderzeichen: `«` `»` `–` `…` direkt verwenden. Geschütztes Leerzeichen (z. B. «Fr. 159.–»):
`&nbsp;`.

## 3. News schreiben

1. Ordner anlegen: `content/news/JJJJ-MM-kurzer-titel/` – der Ordnername wird die Adresse
   (`/news/2027-01-erste-lieferung/`). Nur Kleinbuchstaben, Ziffern, Bindestriche.
2. Darin `index.md` (am einfachsten eine bestehende News kopieren):

```markdown
---
title: Erste Wortuhren ausgeliefert
date: 2027-01-20
summary: Ein, zwei Sätze für Übersicht, RSS und Google.
sites: [wortuhr]            # oder [mds, mvs] – erscheint auf mehreren Sites
cover: ./titelbild.jpg      # optional, Bild liegt im selben Ordner
coverAlt: Was auf dem Bild zu sehen ist
highlight: true             # optional: Hinweisband oben auf der Site
highlightText: Kurztext fürs Hinweisband
highlightUntil: 2027-02-15  # danach verschwindet das Band von selbst
draft: true                 # Entwurf: nur in der lokalen Vorschau sichtbar
---

Text in **Markdown**. Absätze durch eine Leerzeile trennen.

## Zwischentitel

- Aufzählung
- [Link](https://wortuhr.lgf.ch/vormerken/)

![Beschreibung](./weiteres-bild.jpg)
```

3. **Bilder immer in den Ordner der News legen** – sonst bricht der Build mit
   «ImageNotFound» ab. Grösse bis ca. 3000 px Breite; verkleinert wird automatisch.
4. Fertig? `draft: true` löschen, dann publizieren (Abschnitt 5).

## 4. Bilder

- Format PNG oder JPG, Name ohne Leer- und Sonderzeichen (`wortuhr-vorne.png`).
- Astro erzeugt beim Build verkleinerte WebP-Versionen – Originale dürfen gross sein.
- Wortuhr-Produktbilder: immer die Versionen mit **8-mm-Eckradius** aus dem Flyer verwenden
  (`img\v9\…_radius8mm_v2.png`).
- PDFs, Setups, Videos gehören **nicht** ins Repo, sondern auf den Server
  (`/var/www/downloads`).

## 5. Publizieren

### Mit VS Code (ohne Befehle)

1. Links das Symbol **Quellcodeverwaltung** (`Ctrl+Shift+G`): alle geänderten Dateien sind gelistet;
   ein Klick zeigt die Änderungen.
2. Oben eine kurze Beschreibung eingeben (z. B. «News Erste Lieferung»), **Commit**.
3. **Änderungen synchronisieren** bzw. **Push**.

### Mit Befehlen

```bash
git status                       # was ist geändert?
git add -A
git commit -m "News Erste Lieferung"
git push
```

### Danach

- Bauen: <https://github.com/ELAN4566/lgf-web/actions> – grüner Haken = gebaut,
  rotes Kreuz = Fehler (anklicken → Meldung; die alte Version bleibt online).
- Nach spätestens 5 Minuten holt der Server den Stand. Im Browser ggf. `Ctrl+F5`.
- Kontrolle auf appsrv: `journalctl -u lgf-web-deploy.service -n 5 --no-pager`
  → «Neuer Stand (deploy): main <commit>».

### Oder: Claude machen lassen

In einer Claude-Sitzung genügt z. B. «News zur ersten Lieferung schreiben, Bild liegt in …»
und anschliessend «commit und push». Claude zeigt die Vorschau im Browser, bevor etwas
publiziert wird.

## 6. Erst testen, dann live (MDS/MVS)

Für mds/mvs gibt es Testadressen mvstest.lgf.ch / mdstest.lgf.ch (nach deren Umstellung):

```bash
git switch test          # einmalig: git switch -c test
# … ändern, committen …
git push                 # → mvstest/mdstest nach ≤ 5 min
git switch main
git merge test
git push                 # → live
```

Die Wortuhr hat keine Testadresse – dort ist die lokale Vorschau der Test; `draft: true`
hält News zurück.

## 7. Wenn etwas schiefgeht

| Problem | Lösung |
|---|---|
| Vorschau zeigt Fehlermeldung | Meldung lesen: Datei und Zeile stehen drin. Oft fehlendes Bild oder Tippfehler im Kopf `---` einer News. |
| GitHub Action rot | Gleiche Ursache wie oben; lokal `npm run build:wortuhr` zeigt den Fehler auch. Korrigieren, erneut pushen. |
| Falsche Änderung online | In VS Code den Commit rückgängig machen oder `git revert HEAD` und `git push`. |
| Nach 10 Minuten nicht online | appsrv: `journalctl -u lgf-web-deploy.service -n 20 --no-pager`; erzwingen: `sudo -u lgfdeploy /opt/lgf-web-deploy-bin/lgf-web-deploy.sh --force` |
| Site kurzfristig sperren | dmzsrv: `deny all;` vor `proxy_pass` in `/etc/nginx/conf.d/wortuhr.conf`, `nginx -t && systemctl reload nginx` |
