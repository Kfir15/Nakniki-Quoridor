#!/usr/bin/env bash
# Redeploy Nakniki-Quoridor to the Hetzner server.
# Run from the repo root in Git Bash:  bash deploy.sh
set -e

KEY=~/.ssh/nakniki_hetzner
HOST=root@157.180.84.208

echo "==> packaging source (excluding node_modules, .env, lockfile, dist)"
tar --force-local -C "$(pwd)" \
  --exclude='.git' --exclude='node_modules' --exclude='dist' \
  --exclude='.env' --exclude='package-lock.json' \
  --exclude='__pycache__' --exclude='.venv' --exclude='venv' \
  -czf /tmp/nakniki-deploy.tar.gz .

echo "==> uploading + extracting to /opt/nakniki-quoridor"
cat /tmp/nakniki-deploy.tar.gz | ssh -i "$KEY" "$HOST" \
  'cat > /tmp/d.tgz && tar xzf /tmp/d.tgz -C /opt/nakniki-quoridor && rm /tmp/d.tgz'

echo "==> install deps, rebuild frontend, restart services"
ssh -i "$KEY" "$HOST" '
  set -e
  cd /opt/nakniki-quoridor
  npm install --no-audit --no-fund                      # no-op unless package.json changed
  cd nakniki-website && npm run build
  rm -rf /var/www/nakniki-quoridor/* && cp -r dist/* /var/www/nakniki-quoridor/
  # Python deps (no-op if requirements.txt unchanged):
  cd /opt/nakniki-quoridor/ai-system && . .venv/bin/activate && /root/.local/bin/uv pip install -q -r requirements.txt
  pm2 restart nakniki-api nakniki-ai nakniki-worker && pm2 save
'
echo "==> done -> https://nakniki-quoridor.brandale.co.il"
