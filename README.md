# Check-in Manager

Weekly 1:1 check-in management app — a single-screen, Notion-style editable table for managing daily standup notes across teams.

## Setup

### 1. Supabase

Create a Supabase project and run the migration:

```sql
-- Copy and run the contents of supabase/migration.sql in the Supabase SQL editor
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CHECKIN_PASSWORD=your-password
```

### 3. Install & Run

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Enter the password to access the app.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **shadcn/ui** + Tailwind CSS v4
- **Supabase** (PostgreSQL)
- **SWR** for client-side data fetching
- **Geist** font

## Repo & CI

- **GitHub:** [github.com/muratodemis/checkin-app](https://github.com/muratodemis/checkin-app)  
  `git pull` / `git push` ile güncelleme. Vercel’e bağladıktan sonra her `main` push’u otomatik production deploy tetikler.

- **Vercel’i GitHub’a bağlamak (tek sefer):**  
  1. [vercel.com](https://vercel.com) → **Settings** → **Login Connections** → **GitHub** “Connect”.  
  2. Proje **checkin-app** → **Settings** → **Git** → **Connect Git Repository** → **GitHub** → `muratodemis/checkin-app` seç.  
  Bundan sonra `git push origin main` yeterli; deploy Vercel’de otomatik çalışır.

## Deploy

### Vercel

Proje GitHub’a push edildi. Vercel’i yukarıdaki gibi GitHub repo’ya bağla; environment variables’ı Vercel dashboard’da ekle.

**murat.org:**  
- **https://murat.org/** → Sade bir ana sayfa (Murat Ödemiş, CEO Univenn + LinkedIn / X logoları). Yönlendirme yok.  
- **https://murat.org/5mins** → Check-in uygulaması.

Domain **murat.org** ve **www.murat.org** Vercel projesine eklendi. Sadece DNS’i sen ayarlayacaksın:

**Seçenek A – A + CNAME (Cloudflare vb. kullanıyorsan):**  
Domain panelinde şu kayıtları ekle veya güncelle:

| Tip   | İsim / Name | Değer / Target / Content   |
|-------|-------------|----------------------------|
| **A** | `@` (veya `murat.org`) | `76.76.21.21`             |
| **CNAME** | `www` | `cname.vercel-dns.com`   |

(Cloudflare’da “Proxied” yerine **DNS only** kullan; Vercel SSL kendi sertifikasını kullanacak.)

**name.com’da (murat.org):**  
1. [name.com](https://www.name.com) → giriş yap → **MY DOMAINS** → **murat.org** → **Manage DNS Records**.  
2. **A kaydı:** Type **A**, Host **boş bırak** (veya `@`), Answer **76.76.21.21**, TTL 300 → **Add Record**.  
3. **CNAME (www):** Type **CNAME**, Host **www**, Answer **cname.vercel-dns.com**, TTL 300 → **Add Record**.  
(Eski A/CNAME’leri silmeden önce not al; sadece çakışanları değiştir.)

**Seçenek B – Nameserver’ı Vercel’e vermek:**  
Domain’i satın aldığın yerde (registrar) nameserver’ları şöyle değiştir:

- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

Kayıtlar yayıldıktan sonra (birkaç dakika–saat) **https://murat.org** ana sayfayı, **https://murat.org/5mins** uygulamayı açar.

### Google Cloud Run

1. **Gereksinimler:** [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) kurulu olsun.  
   `gcloud auth login` ve `gcloud config set project YOUR_PROJECT_ID` ile giriş yapın.

2. **İlk deploy:**
   ```bash
   chmod +x scripts/deploy-cloudrun.sh
   ./scripts/deploy-cloudrun.sh
   ```
   İsterseniz:
   ```bash
   export GCP_PROJECT_ID=my-project   # gerekirse
   export GCP_REGION=europe-west1     # isteğe bağlı, varsayılan: europe-west1
   ./scripts/deploy-cloudrun.sh
   ```

3. **Ortam değişkenleri:** Cloud Run konsolunda (Google Cloud Console → Cloud Run → servis → Edit & deploy → Variables & Secrets) şunları ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (tercihen)
   - `CHECKIN_PASSWORD`

   Veya deploy sırasında:
   ```bash
   gcloud run deploy checkin-app --source . --region europe-west1 \
     --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=...,NEXT_PUBLIC_SUPABASE_ANON_KEY=...,CHECKIN_PASSWORD=..."
   ```

4. **Herkese açmak (Forbidden hatası için):**  
   Proje organizasyon ilkesi izin veriyorsa:
   ```bash
   gcloud run services add-iam-policy-binding checkin-app --project=PROJECT_ID --region=europe-west1 \
     --member="allUsers" --role="roles/run.invoker"
   ```
   Organizasyon ilkesi `allUsers`’ı engelliyorsa: Google Cloud Console → **IAM & Admin** → **Organization policies** → `Domain restricted sharing` veya ilgili kısıtlamayı proje/organizasyon için gevşetin; ardından yukarıdaki komutu tekrar çalıştırın.  
   Belirli bir kullanıcıya erişim vermek için:
   ```bash
   gcloud run services add-iam-policy-binding checkin-app --project=PROJECT_ID --region=europe-west1 \
     --member="user:EMAIL" --role="roles/run.invoker"
   ```
