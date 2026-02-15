#!/usr/bin/env bash
# Vercel'e deploy. Bu scripti kendi terminalinde (Cursor dışında) çalıştır.
# Örnek: ./scripts/vercel-deploy.sh
set -e
cd "$(dirname "$0")/.."
echo "Proje bağlanıyor (ilk seferde proje adı sorulabilir)..."
npx vercel link --scope murat-univenncoms-projects --yes 2>/dev/null || true
echo "Deploy başlatılıyor..."
npx vercel deploy --prod -y --scope murat-univenncoms-projects
