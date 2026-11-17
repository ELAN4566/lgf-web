#!/usr/bin/env bash
# Holt einen Build-Branch von GitHub und kopiert die Sites nach /var/www/<site>.
# Läuft als Benutzer "lgfdeploy" per systemd-Timer (lgf-web-deploy.timer).
#
# Was ein Server ausliefert, steht in /etc/lgf-web-deploy.conf, z. B.:
#   appsrv:      BRANCH=deploy       SITES="wortuhr"
#   mvssrv:      BRANCH=deploy       SITES="mvs mds"
#   mvstestsrv:  BRANCH=deploy-test  SITES="mvs mds"
#
# Einmalige Einrichtung: siehe deploy/README-server.md

set -euo pipefail

CONF=/etc/lgf-web-deploy.conf
REPO_DIR=/opt/lgf-web-deploy           # Klon des Build-Branches
WWW_ROOT=/var/www                      # Ziel: /var/www/wortuhr, /var/www/mds, ...
BRANCH=deploy
SITES=""

[[ -r "$CONF" ]] && source "$CONF"
if [[ -z "$SITES" ]]; then
  echo "FEHLER: SITES ist in $CONF nicht gesetzt" >&2
  exit 1
fi

cd "$REPO_DIR"
git fetch --quiet origin "$BRANCH"

# Zuletzt ausgelieferter Stand (nicht HEAD: ein frischer Klon ist schon aktuell,
# wurde aber noch nie nach /var/www kopiert)
STATE="$REPO_DIR/.git/lgf-deployed"
REMOTE=$(git rev-parse "origin/$BRANCH")
DEPLOYED=$(cat "$STATE" 2>/dev/null || true)
if [[ "$DEPLOYED" == "$REMOTE|$SITES" && "${1:-}" != "--force" ]]; then
  exit 0   # nichts Neues
fi

git reset --quiet --hard "origin/$BRANCH"
echo "Neuer Stand ($BRANCH): $(cat VERSION 2>/dev/null || echo "$REMOTE")"

for site in $SITES; do
  if [[ ! -d "$REPO_DIR/$site" ]]; then
    echo "WARNUNG: $site fehlt im Branch $BRANCH, übersprungen" >&2
    continue
  fi
  # --delay-updates: Dateien erst am Schluss austauschen (kein halber Stand online)
  rsync -a --delete --delay-updates --exclude='.git' "$REPO_DIR/$site/" "$WWW_ROOT/$site/"
  # SELinux: Kontext httpd_sys_content_t sicherstellen (sonst 403 trotz richtiger Rechte)
  command -v restorecon >/dev/null && restorecon -R "$WWW_ROOT/$site" || true
  echo "  $site aktualisiert"
done

echo "$REMOTE|$SITES" > "$STATE"
