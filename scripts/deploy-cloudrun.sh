#!/usr/bin/env bash
# Deploy checkin-app to Google Cloud Run
# Gereksinimler: gcloud CLI, Docker (veya Cloud Build)
# Önce: gcloud auth login && gcloud config set project YOUR_PROJECT_ID

set -e

# Bu değerleri kendi projenize göre değiştirin
PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}"
REGION="${GCP_REGION:-europe-west1}"
SERVICE_NAME="${CLOUD_RUN_SERVICE:-checkin-app}"

if [ -z "$PROJECT_ID" ]; then
  echo "Hata: GCP proje ID gerekli. Şunlardan biri:"
  echo "  export GCP_PROJECT_ID=my-project-id"
  echo "  veya: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

echo "Proje: $PROJECT_ID"
echo "Bölge: $REGION"
echo "Servis: $SERVICE_NAME"
echo ""

# Build ve deploy (--source ile Dockerfile kullanılır)
# Supabase ve CHECKIN_PASSWORD için: Cloud Run konsolunda Environment variables
# ekleyin veya aşağıya --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=...,CHECKIN_PASSWORD=..." ekleyin
gcloud run deploy "$SERVICE_NAME" \
  --project "$PROJECT_ID" \
  --source . \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production" \
  --no-deploy-health-check \
  --quiet

echo ""
echo "Deploy tamamlandı. URL:"
gcloud run services describe "$SERVICE_NAME" --project "$PROJECT_ID" --region "$REGION" --format='value(status.url)'
