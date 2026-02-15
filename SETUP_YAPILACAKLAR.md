# Senin yapman gerekenler (kısa liste)

## 1. murat.org DNS (name.com)

Domain name.com’da; giriş yaptıysan:

1. **MY DOMAINS** → **murat.org** → **Manage DNS Records**
2. **A kaydı ekle:** Host boş (veya `@`), Type A, Answer **76.76.21.21**, TTL 300
3. **CNAME ekle:** Host **www**, Type CNAME, Answer **cname.vercel-dns.com**, TTL 300

Kaydet. 5–30 dakika içinde murat.org ve www.murat.org Vercel’e gider.

---

## 2. Vercel environment variables (Supabase kullanıyorsan)

Check-in uygulaması Supabase kullanıyor. Canlıda çalışması için:

1. [vercel.com](https://vercel.com) → **checkin-app** → **Settings** → **Environment Variables**
2. Şunları ekle (Production işaretli):
   - `NEXT_PUBLIC_SUPABASE_URL` = Supabase proje URL’in
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase anon key
   - `CHECKIN_PASSWORD` = **zaten 3767** (ekli)
   - İstersen: `SUPABASE_SERVICE_ROLE_KEY`
3. **Save** → **Deployments** → son deploy’da **Redeploy**

Supabase kullanmayacaksan bu adımı atlayabilirsin (uygulama placeholder ile çalışır, veri olmaz).

---

## Benim hallettiğim

- GitHub repo + Vercel’e bağlı (push = otomatik deploy)
- murat.org / www.murat.org Vercel projesine eklendi
- CHECKIN_PASSWORD=3767 Vercel Production’da ayarlı
- name.com adımları README ve bu dosyada yazılı

DNS’i name.com’da sen ekleyeceksin (ben hesabına giremem). Sonrasında sadece **git push** yeter.
