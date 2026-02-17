#!/usr/bin/env bash
# Supabase proje oluşturur, migration atar, API anahtarlarını alır ve Vercel env'e yazar.
# Token: SUPABASE_ACCESS_TOKEN ortam değişkeni veya proje kökünde .supabase-token dosyası.
set -e
cd "$(dirname "$0")/.."

# Token yoksa .supabase-token dosyasından oku
if [[ -z "$SUPABASE_ACCESS_TOKEN" ]] && [[ -f .supabase-token ]]; then
  export SUPABASE_ACCESS_TOKEN=$(cat .supabase-token | tr -d '\n\r ')
fi

echo "=== 1. Supabase giriş kontrolü ==="
if ! npx supabase projects list -o json &>/dev/null; then
  echo "Supabase token yok. Token oluştur:"
  echo "  1. Tarayıcı açılıyor: https://supabase.com/dashboard/account/tokens"
  open "https://supabase.com/dashboard/account/tokens" 2>/dev/null || true
  echo "  2. 'Generate new token' ile token oluştur, kopyala."
  echo "  3. Proje kökünde: echo 'sbp_xxx' > .supabase-token"
  echo "  4. Bu scripti tekrar çalıştır: npm run setup:supabase"
  exit 1
fi

echo "=== 2. supabase/config.toml kontrolü ==="
if [[ ! -f supabase/config.toml ]]; then
  npx supabase init
fi

echo "=== 3. Organization listesi ==="
ORGS_JSON=$(npx supabase orgs list -o json)
ORG_ID=$(node -e "const d=JSON.parse(process.argv[1]); const o=d[0]||d; console.log(o.id||o.slug||'')" "$ORGS_JSON")
if [[ -z "$ORG_ID" ]]; then
  echo "Organizasyon bulunamadı."
  exit 1
fi
echo "Org ID: $ORG_ID"

echo "=== 4. Yeni Supabase projesi oluşturuluyor ==="
DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)
CREATE_JSON=$(npx supabase projects create checkin-app --org-id "$ORG_ID" --db-password "$DB_PASSWORD" --region eu-central-1 -o json 2>/dev/null || true)
REF=$(node -e "
const d = JSON.parse(process.argv[1] || '{}');
console.log(d.ref || d.id || d.project_ref || '');
" "$CREATE_JSON" 2>/dev/null || true)

if [[ -z "$REF" ]]; then
  echo "Proje oluşturulamadı (belki 'checkin-app' adında proje zaten var). Mevcut projeyi kullanmak için REF verin:"
  echo "  REF=xxxxx $0"
  echo "Mevcut projeler:"
  npx supabase projects list
  exit 1
fi
echo "Proje ref: $REF"

echo "=== 5. Projeye link ==="
export SUPABASE_DB_PASSWORD="$DB_PASSWORD"
npx supabase link --project-ref "$REF" --password "$DB_PASSWORD" --yes

echo "=== 6. Migration atılıyor ==="
npx supabase db push --linked

echo "=== 7. API anahtarları alınıyor ==="
KEYS_JSON=$(npx supabase projects api-keys --project-ref "$REF" -o json)
SUPABASE_URL="https://${REF}.supabase.co"
ANON_KEY=$(node -e "
const d = JSON.parse(process.argv[1]);
const keys = Array.isArray(d) ? d : (d.api_keys || d.keys || []);
const arr = Array.isArray(keys) ? keys : Object.values(keys || {});
const anon = arr.find(k => (k.name||'').toLowerCase() === 'anon' || (k.id||'').toLowerCase() === 'anon');
const k = anon || arr[0];
console.log(k ? (k.api_key || k.key || k.value || '') : '');
" "$KEYS_JSON")
SERVICE_ROLE_KEY=$(node -e "
const d = JSON.parse(process.argv[1]);
const keys = Array.isArray(d) ? d : (d.api_keys || d.keys || []);
const arr = Array.isArray(keys) ? keys : Object.values(keys || {});
const sr = arr.find(k => (k.name||'').toLowerCase().includes('service_role') || (k.id||'').toLowerCase() === 'service_role');
console.log(sr ? (sr.api_key || sr.key || sr.value || '') : '');
" "$KEYS_JSON")

if [[ -z "$ANON_KEY" ]]; then
  echo "Uyarı: anon key bulunamadı. JSON yapısı:"
  echo "$KEYS_JSON" | head -c 500
fi

echo "=== 8. Vercel env değişkenleri ekleniyor ==="
echo -n "$SUPABASE_URL" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production -y --force 2>/dev/null || echo -n "$SUPABASE_URL" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production -y
echo -n "$ANON_KEY" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production -y --sensitive --force 2>/dev/null || echo -n "$ANON_KEY" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production -y --sensitive
echo -n "$SERVICE_ROLE_KEY" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production -y --sensitive --force 2>/dev/null || echo -n "$SERVICE_ROLE_KEY" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production -y --sensitive

echo ""
echo "=== Tamamlandı ==="
echo "Supabase URL: $SUPABASE_URL"
echo "Vercel Production env eklendi. Redeploy için: npx vercel --prod"
echo "Yerel .env.local için (opsiyonel):"
echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=***"
echo "SUPABASE_SERVICE_ROLE_KEY=***"
