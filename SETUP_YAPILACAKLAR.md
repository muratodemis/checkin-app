# Senin yapman gerekenler (kısa liste)

## 1. murat.org DNS (name.com)

Domain name.com’da; giriş yaptıysan:

1. **MY DOMAINS** → **murat.org** → **Manage DNS Records**
2. **A kaydı ekle:** Host boş (veya `@`), Type A, Answer **76.76.21.21**, TTL 300
3. **CNAME ekle:** Host **www**, Type CNAME, Answer **cname.vercel-dns.com**, TTL 300

Kaydet. 5–30 dakika içinde murat.org ve www.murat.org Vercel’e gider.

---

## 2. Supabase (giriş yaptıysan – tek seferlik)

Supabase’e zaten giriş yaptıysan sırayla şunları yap:

### 2.1 Proje

- [supabase.com/dashboard](https://supabase.com/dashboard) → **New project** (yoksa mevcut projeyi seç).
- Organization + proje adı (örn. `checkin-app`), şifre belirle, region seç → **Create**.

### 2.2 Veritabanı şeması

- Sol menü: **SQL Editor** → **New query**.
- Bu repo’daki **`supabase/migration.sql`** dosyasının **tüm içeriğini** kopyala, yapıştır.
- **Run** (veya Ctrl/Cmd+Enter). “Success” görmelisin.

### 2.3 API anahtarları

- Sol menü: **Project Settings** (dişli) → **API**.
- Şunları kopyala (ileride Vercel’e yapıştıracaksın):
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 2.4 Vercel’e ekle

1. [vercel.com](https://vercel.com) → **checkin-app** → **Settings** → **Environment Variables**.
2. Şunları ekle (Production işaretli, değerleri Supabase’ten yapıştır):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CHECKIN_PASSWORD` = **3767** (zaten varsa dokunma).
3. **Save** → **Deployments** → son deploy’da **Redeploy**.

Bunları yaptıktan sonra murat.org/5mins canlıda Supabase’e bağlı çalışır.

**İstersen migration’ı CLI ile de atabilirsin:** Proje oluşturduktan sonra dashboard’daki proje URL’inde `project/` sonrası gelen kodu (project ref) al. Terminalde: `npx supabase login`, `npx supabase link --project-ref BU_REF`, `npx supabase db push`. (Şema zaten `supabase/migrations/` içinde.)

---

## Benim hallettiğim

- GitHub repo + Vercel’e bağlı (push = otomatik deploy)
- murat.org / www.murat.org Vercel projesine eklendi
- CHECKIN_PASSWORD=3767 Vercel Production’da ayarlı
- name.com adımları README ve bu dosyada yazılı

DNS’i name.com’da sen ekleyeceksin (ben hesabına giremem). Sonrasında sadece **git push** yeter.
