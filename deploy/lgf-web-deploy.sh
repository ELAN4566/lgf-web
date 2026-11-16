#!/usr/bin/env bash
# Holt den Branch "deploy" von GitHub und kopiert jede Site nach /var/www/<site>.
# Läuft auf appsrv als Benutzer "lgfdeploy" per systemd-Timer (lgf-web-deploy.timer).
#
# Einmalige Einrichtung: siehe deploy/README-server.md

set -euo pipefail

REPO_DIR=/opt/lgf-web-deploy           # Klon des Branches "deploy"
WWW_ROOT=/var/www                      # Ziel: /var/www/wortuhr, /var/www/mds, ...
SITES=(wortuhr)                        # später: (wortuhr mds mvs lgf)

cd "$REPO_DIR"
git fetch --quiet origin deploy

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/deploy)
if [[ "$LOCAL" == "$REMOTE" ]]; then
  exit 0   # nichts Neues
fi

git reset --quiet --hard origin/deploy
echo "Neuer Stand: $(cat VERSION 2>/dev/null || echo "$REMOTE")"

for site in "${SITES[@]}"; do
  if [[ ! -d "$REPO_DIR/$site" ]]; then
    echo "WARNUNG: $site fehlt im deploy-Branch, übersprungen" >&2
    continue
  fi
  # --delay-updates: Dateien erst am Schluss austauschen (kein halber Stand online)
  rsync -a --delete --delay-updates --exclude='.git' "$REPO_DIR/$site/" "$WWW_ROOT/$site/"
  # SELinux: Kontext httpd_sys_content_t sicherstellen (sonst 403 trotz richtiger Rechte)
  command -v restorecon >/dev/null && restorecon -R "$WWW_ROOT/$site" || true
  echo "  $site aktualisiert"
done
