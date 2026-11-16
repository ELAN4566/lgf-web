# Einrichtung auf den Servern

Einmalige Schritte. Danach geht jede Änderung so online:
**push auf `main` → GitHub Action baut → Branch `deploy` → appsrv holt ihn alle 5 Minuten.**

```
GitHub (lgf-web)                     dmzsrv (nginx)             appsrv (AlmaLinux, nginx)
  push main → Action → Branch deploy   TLS, Reverse-Proxy  ──→   /var/www/wortuhr
                         ↑                                        ↑
                         └──── git fetch (Timer, 5 min) ──────────┘
```

GitHub braucht keinen Zugang ins eigene Netz – appsrv holt aktiv ab (nur ausgehend Port 22 bzw. 443 zu github.com).

## 1. appsrv: Benutzer, Verzeichnisse, Deploy-Key

```bash
sudo useradd --system --create-home --home-dir /var/lib/lgfdeploy --shell /sbin/nologin lgfdeploy
sudo mkdir -p /var/www/wortuhr /opt/lgf-web-deploy /opt/lgf-web-deploy-bin
sudo chown lgfdeploy:lgfdeploy /var/www/wortuhr /opt/lgf-web-deploy

# SELinux: Webinhalt freigeben (dauerhafte Regel + anwenden)
sudo semanage fcontext -a -t httpd_sys_content_t "/var/www/wortuhr(/.*)?"
sudo restorecon -R /var/www/wortuhr

# SSH-Schlüssel nur für dieses Repo (Deploy-Key, nur Lesen)
sudo -u lgfdeploy mkdir -m 700 -p /var/lib/lgfdeploy/.ssh
sudo -u lgfdeploy sh -c 'ssh-keyscan github.com >> /var/lib/lgfdeploy/.ssh/known_hosts'
sudo -u lgfdeploy ssh-keygen -t ed25519 -N "" -f /var/lib/lgfdeploy/.ssh/id_ed25519 -C "appsrv lgf-web deploy"
sudo cat /var/lib/lgfdeploy/.ssh/id_ed25519.pub
```

Den ausgegebenen Public Key auf GitHub eintragen:
**Repo `lgf-web` → Settings → Deploy keys → Add deploy key** (ohne «Allow write access»).

```bash
# Branch "deploy" klonen (existiert nach dem ersten Lauf der GitHub Action)
sudo -u lgfdeploy git clone --branch deploy --single-branch \
  git@github.com:ELAN4566/lgf-web.git /opt/lgf-web-deploy
```

## 2. appsrv: Skript und Timer

```bash
sudo cp deploy/lgf-web-deploy.sh /opt/lgf-web-deploy-bin/
sudo chmod 755 /opt/lgf-web-deploy-bin/lgf-web-deploy.sh
sudo cp deploy/systemd/lgf-web-deploy.{service,timer} /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now lgf-web-deploy.timer

# Sofort einmal ausführen und Ergebnis ansehen
sudo systemctl start lgf-web-deploy.service
journalctl -u lgf-web-deploy.service -n 20
```

Hinweis: `restorecon` als Benutzer `lgfdeploy` darf scheitern (`|| true`). Dank der
`semanage`-Regel erhalten neue Dateien den richtigen Kontext ohnehin vom Verzeichnis.

## 3. appsrv: nginx

```bash
sudo mkdir -p /etc/nginx/snippets
sudo cp deploy/nginx/snippets/lgf-security-headers.conf /etc/nginx/snippets/
sudo cp deploy/nginx/appsrv-wortuhr.lgf.ch.conf /etc/nginx/conf.d/wortuhr.lgf.ch.conf
# TODO in der Datei: IP von dmzsrv bei set_real_ip_from
sudo nginx -t && sudo systemctl reload nginx
```

## 4. dmzsrv: nginx + Zertifikat

1. DNS: `wortuhr.lgf.ch` auf die öffentliche IP von dmzsrv (A/AAAA oder CNAME).
2. `deploy/nginx/dmzsrv-wortuhr.lgf.ch.conf` übernehmen, appsrv-Adresse und SSL-Einstellungen
   wie bei den anderen Sites anpassen.
3. Zertifikat: `certbot certonly --webroot -w /var/www/letsencrypt -d wortuhr.lgf.ch`
   (oder wie bei den übrigen Sites).
4. `nginx -t && systemctl reload nginx`

## Weitere Sites (mds, mvs, lgf)

- `SITES=(...)` in `lgf-web-deploy.sh` ergänzen
- `ReadWritePaths` in `lgf-web-deploy.service` ergänzen
- Verzeichnis + SELinux-Regel wie oben, eigene nginx-Konfiguration pro Site
