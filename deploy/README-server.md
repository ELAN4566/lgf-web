# Einrichtung auf den Servern

Die Websites bleiben auf den bisherigen Servern (alle AlmaLinux mit nginx):

| Server | Hostnamen | Git-Branch → Build-Branch | `SITES` |
|---|---|---|---|
| appsrv | wortuhr.lgf.ch (www.lgf.ch bleibt vorerst Zeta Producer) | `main` → `deploy` | `wortuhr` |
| mvssrv | mvs.lgf.ch, mds.lgf.ch | `main` → `deploy` | `mvs mds` |
| mvstestsrv | mvstest.lgf.ch, mdstest.lgf.ch | `test` → `deploy-test` | `mvs mds` |

Ablauf danach:
**push auf `main` (bzw. `test`) → GitHub Action baut → Build-Branch → jeder Server holt seinen
Branch alle 5 Minuten und kopiert nur seine Sites.**

```
GitHub (lgf-web)                         dmzsrv (nginx)          Webserver (AlmaLinux, nginx)
  push main → Action → Branch deploy       TLS, Reverse-Proxy ──→  appsrv:     /var/www/wortuhr
  push test → Action → Branch deploy-test     pro Hostname    ──→  mvssrv:     /var/www/mvs, /mds
                         ↑                                    ──→  mvstestsrv: /var/www/mvs, /mds
                         └──── git fetch (Timer, 5 min, je Server) ────┘
```

GitHub braucht keinen Zugang ins eigene Netz – die Server holen aktiv ab (nur ausgehend
Port 22 zu github.com).

Die Schritte 1–3 werden **auf jedem der drei Server** ausgeführt. `<site>` steht jeweils für die
Sites dieses Servers (appsrv: `wortuhr`; mvssrv und mvstestsrv: `mvs` und `mds`).
Das Repo `lgf-web` muss dazu auf dem Server liegen (z. B. `git clone` nach `~/lgf-web` oder die
Dateien aus `deploy/` hinüberkopieren).

## 1. Benutzer, Verzeichnisse, Deploy-Key

```bash
sudo useradd --system --create-home --home-dir /var/lib/lgfdeploy --shell /sbin/nologin lgfdeploy
sudo mkdir -p /opt/lgf-web-deploy /opt/lgf-web-deploy-bin
sudo chown lgfdeploy:lgfdeploy /opt/lgf-web-deploy

# Pro Site dieses Servers (appsrv: wortuhr / mvssrv + mvstestsrv: mvs und mds)
sudo mkdir -p /var/www/<site>
sudo chown lgfdeploy:lgfdeploy /var/www/<site>
sudo semanage fcontext -a -t httpd_sys_content_t "/var/www/<site>(/.*)?"
sudo restorecon -R /var/www/<site>

# SSH-Schlüssel nur für dieses Repo (Deploy-Key, nur Lesen)
sudo -u lgfdeploy mkdir -m 700 -p /var/lib/lgfdeploy/.ssh
sudo -u lgfdeploy sh -c 'ssh-keyscan github.com >> /var/lib/lgfdeploy/.ssh/known_hosts'
sudo -u lgfdeploy ssh-keygen -t ed25519 -N "" -f /var/lib/lgfdeploy/.ssh/id_ed25519 -C "$(hostname -s) lgf-web deploy"
sudo cat /var/lib/lgfdeploy/.ssh/id_ed25519.pub
```

Den ausgegebenen Public Key auf GitHub eintragen:
**Repo `lgf-web` → Settings → Deploy keys → Add deploy key**, Titel = Servername,
**ohne** «Allow write access». Jeder Server bekommt einen eigenen Schlüssel.

```bash
# Build-Branch klonen: appsrv und mvssrv "deploy", mvstestsrv "deploy-test"
# (deploy-test existiert erst nach dem ersten Push auf den Git-Branch "test")
sudo -u lgfdeploy git clone --branch deploy --single-branch \
  git@github.com:ELAN4566/lgf-web.git /opt/lgf-web-deploy
```

## 2. Skript, Konfiguration und Timer

```bash
sudo cp deploy/lgf-web-deploy.sh /opt/lgf-web-deploy-bin/
sudo chmod 755 /opt/lgf-web-deploy-bin/lgf-web-deploy.sh

# Was dieser Server ausliefert: Vorlage kopieren, passende Variante aktiv lassen
sudo cp deploy/lgf-web-deploy.conf.example /etc/lgf-web-deploy.conf
sudo vi /etc/lgf-web-deploy.conf

sudo cp deploy/systemd/lgf-web-deploy.{service,timer} /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now lgf-web-deploy.timer

# Sofort einmal ausführen und Ergebnis ansehen
sudo systemctl start lgf-web-deploy.service
journalctl -u lgf-web-deploy.service -n 20
```

Neu kopieren erzwingen (z. B. nach einer Panne): `sudo -u lgfdeploy /opt/lgf-web-deploy-bin/lgf-web-deploy.sh --force`

Hinweis: `restorecon` als Benutzer `lgfdeploy` darf scheitern (`|| true`). Dank der
`semanage`-Regel erhalten neue Dateien den richtigen Kontext ohnehin vom Verzeichnis.

## 3. nginx

```bash
sudo mkdir -p /etc/nginx/snippets
sudo cp deploy/nginx/snippets/lgf-security-headers.conf /etc/nginx/snippets/
sudo cp deploy/nginx/lgf-robots-map.conf /etc/nginx/conf.d/00-lgf-robots-map.conf
```

**appsrv:**

```bash
sudo cp deploy/nginx/wortuhr.lgf.ch.conf /etc/nginx/conf.d/wortuhr.conf
# Port 5104 (wie www auf 5102). SELinux erlaubt nginx auf appsrv bereits 5100-5109
# (semanage port -l | grep http_port_t) – sonst: semanage port -a -t http_port_t -p tcp 5104
# Firewall: nur dmzsrv darf zugreifen (bzw. wie bei 5102 gelöst, siehe firewall-cmd --list-all)
sudo firewall-cmd --permanent --add-rich-rule='rule family=ipv4 source address=10.1.6.3 port port=5104 protocol=tcp accept'
sudo firewall-cmd --reload
sudo nginx -t && sudo systemctl reload nginx
```

**mvssrv und mvstestsrv** – hier laufen schon die bisherigen Zeta-Producer-Sites und die
MVS-Dienste. Deshalb **nicht einfach überschreiben**:

1. Bestehende Konfiguration sichern, z. B. `sudo cp -a /etc/nginx /root/nginx-vor-lgf-web`.
2. Bisherige `server`-Blöcke für mvs/mds bzw. mvstest/mdstest ansehen: Welche Pfade sind
   **keine** Webseiten (MvsClient, MdsClient, APIs, Web-Ansicht, Downloads)? Diese
   `location`-Blöcke in `deploy/nginx/mvs.lgf.ch.conf` bzw. `mds.lgf.ch.conf` übernehmen
   (Abschnitte «MVS-Serverdienste» und «Downloads»).
3. Die PDFs aus dem bisherigen Ordner `media/files` nach `/var/www/downloads/mvs/files` bzw.
   `/var/www/downloads/mds/files` kopieren (SELinux-Regel wie oben, für `/var/www/downloads`).
4. Neue Dateien nach `/etc/nginx/conf.d/` kopieren, alte `server`-Blöcke entfernen bzw.
   umbenennen (`.conf.alt`), dann `sudo nginx -t && sudo systemctl reload nginx`.

Die beiden Vorlagen enthalten Live- und Testhostname (`server_name mvs.lgf.ch mvstest.lgf.ch`).
Auf den Testhosts sendet nginx automatisch `X-Robots-Tag: noindex, nofollow`, damit Google
die Testseiten nicht aufnimmt.

Tipp: **mvstestsrv zuerst umstellen**, dort prüfen, dann mvssrv.

## 4. dmzsrv

- **wortuhr.lgf.ch (neu):**
  1. DNS: `wortuhr.lgf.ch` auf die öffentliche IP von dmzsrv (A/AAAA oder CNAME).
  2. `deploy/nginx/dmzsrv-wortuhr.lgf.ch.conf` übernehmen, appsrv-Adresse und SSL-Einstellungen
     wie bei den anderen Sites anpassen.
  3. Zertifikat: `certbot certonly --webroot -w /var/www/letsencrypt -d wortuhr.lgf.ch`
     (oder wie bei den übrigen Sites).
  4. `nginx -t && systemctl reload nginx`
- **mvs, mds, mvstest, mdstest:** keine Änderung – sie zeigen bereits auf mvssrv bzw. mvstestsrv.

## Arbeiten mit dem Test-Branch

```bash
git switch test          # bzw. einmalig: git switch -c test
# ... ändern, committen ...
git push                 # → mvstest.lgf.ch / mdstest.lgf.ch nach ≤ 5 min
git switch main
git merge test           # wenn alles gut ist
git push                 # → live
```

## Weitere Sites (z. B. www.lgf.ch als Landing Page)

- Site unter `sites/lgf` anlegen
- In `/etc/lgf-web-deploy.conf` des zuständigen Servers bei `SITES` ergänzen
- Verzeichnis + SELinux-Regel wie in Schritt 1, eigene nginx-Konfiguration
