/**
 * Seed dummy data for Furkan, Yunus, Oğuzhan — 17 Şubat Salı (day=2)
 * Scenario: Mobile app development team check-in
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env.local
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const envPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WEEK_ID = "2c016a66-b9da-42ef-8d10-7e1dcdf5d4ca";
const DAY = 2; // Salı = Tuesday

const FURKAN = "dadd90d9-a048-4839-8c26-f3b19739f65c";
const YUNUS = "3847bbe3-1e21-4791-88aa-2b5a3d4fbe02";
const OGUZHAN = "fa6b325d-ab62-4a0d-94aa-c23ee90890a3";

async function seed() {
  console.log("🌱 Seeding dummy data for Feb 17 (Tuesday)...\n");

  // ═══════════════════════════════════════
  // 1. CHECKIN NOTES (main table)
  // ═══════════════════════════════════════
  console.log("📝 Adding checkin notes...");

  const notes = [
    {
      member_id: FURKAN,
      week_id: WEEK_ID,
      day: DAY,
      content:
        "Furkan bugün Android release branch'ini hazırlıyor. CI/CD pipeline'da bir sorun var, Yunus'tan backend API endpoint fix bekleniyor. Push notification modülü %80 tamamlandı. Oğuzhan'a code review vermeyi planlıyor ama önce kendi PR'larını bitirmesi lazım. Genel olarak motivasyonu yüksek, takım dynamics iyi. Bu hafta sprint goal'a ulaşılabilir görünüyor.",
    },
    {
      member_id: YUNUS,
      week_id: WEEK_ID,
      day: DAY,
      content:
        "Yunus backend migration'larını tamamladı, staging'de test ediliyor. Furkan'ın beklediği /api/notifications endpoint'ini bugün bitirmeyi hedefliyor. Database indexing optimization'ı ile response time %40 iyileşti. Redis cache layer eklemek istiyor ama sprint scope dışında kalabilir.",
    },
    {
      member_id: OGUZHAN,
      week_id: WEEK_ID,
      day: DAY,
      content:
        "Oğuzhan Jetpack Compose migration'ı üzerinde çalışıyor. Furkan'dan code review bekliyor, 2 gündür PR açık. UI test coverage'ı %45'ten %62'ye çıkardı. Memory leak issue'ı buldu ve fix'ledi. Performans testlerinde olumlu sonuçlar alıyor.",
    },
  ];

  for (const note of notes) {
    await supabase.from("checkin_notes").upsert(note, { onConflict: "member_id,week_id,day" });
  }

  // ═══════════════════════════════════════
  // 2. CHECKIN FEEDBACK
  // ═══════════════════════════════════════
  console.log("💬 Adding feedback data...");

  const feedbacks = [
    // Furkan — General Notes
    { member_id: FURKAN, week_id: WEEK_ID, day_number: DAY, question_type: "general_notes", question_index: 0, answer_text: notes[0].content },
    // Furkan — Mood: 🙂 (4/5)
    { member_id: FURKAN, week_id: WEEK_ID, day_number: DAY, question_type: "mood", question_index: 0, answer_text: "", mood_emoji: "🙂", mood_note: "Release heyecanı var, backend blocker biraz stres yapıyor ama genel olarak iyi." },
    // Yunus — General Notes
    { member_id: YUNUS, week_id: WEEK_ID, day_number: DAY, question_type: "general_notes", question_index: 0, answer_text: notes[1].content },
    // Yunus — Mood: 😄 (5/5)
    { member_id: YUNUS, week_id: WEEK_ID, day_number: DAY, question_type: "mood", question_index: 0, answer_text: "", mood_emoji: "😄", mood_note: "Migration başarılı, performans iyileşmeleri tatmin edici. Çok verimli bir gün." },
    // Oğuzhan — General Notes
    { member_id: OGUZHAN, week_id: WEEK_ID, day_number: DAY, question_type: "general_notes", question_index: 0, answer_text: notes[2].content },
    // Oğuzhan — Mood: 😐 (3/5)
    { member_id: OGUZHAN, week_id: WEEK_ID, day_number: DAY, question_type: "mood", question_index: 0, answer_text: "", mood_emoji: "😐", mood_note: "Code review beklemek biraz demotivasyon yaratıyor. Ama memory leak fix'i moral oldu." },
  ];

  for (const fb of feedbacks) {
    await supabase.from("checkin_feedback").upsert(fb, { onConflict: "member_id,week_id,day_number,question_type,question_index" });
  }

  // ═══════════════════════════════════════
  // 3. AI NOTES
  // ═══════════════════════════════════════
  console.log("🤖 Adding AI notes...");

  const aiNotes = [
    // Furkan notes
    { member_id: FURKAN, week_id: WEEK_ID, day_number: DAY, title: "Push notification modülü %80 tamamlandı", description: "Android push notification implementation büyük ölçüde bitti. Son %20 edge case handling ve testing kaldı.", tags: ["today", "important"], source: "manual" },
    { member_id: FURKAN, week_id: WEEK_ID, day_number: DAY, title: "CI/CD pipeline sorunu araştırılacak", description: "Release branch build'i failing. Gradle config ve signing key'lerle ilgili olabilir.", tags: ["to-do", "important"], source: "manual" },
    { member_id: FURKAN, week_id: WEEK_ID, day_number: DAY, title: "Oğuzhan'a code review verilecek", description: "Jetpack Compose migration PR'ı 2 gündür bekliyor. Öncelik olarak bugün bitmeli.", tags: ["to-do", "today"], source: "manual" },
    { member_id: FURKAN, week_id: WEEK_ID, day_number: DAY, title: "Sprint goal'a ulaşılabilir görünüyor", description: "Genel değerlendirme olumlu. Backend blocker çözülürse release timeline'ı tutacak.", tags: ["meeting"], source: "manual" },

    // Yunus notes
    { member_id: YUNUS, week_id: WEEK_ID, day_number: DAY, title: "Backend migration tamamlandı", description: "Database schema migration'ları staging'e deploy edildi. Production push planlanıyor.", tags: ["today", "important"], source: "manual", is_completed: true },
    { member_id: YUNUS, week_id: WEEK_ID, day_number: DAY, title: "/api/notifications endpoint'i bugün bitirilecek", description: "Furkan'ın mobile release'i için kritik bağımlılık. Bugün tamamlanması gerekiyor.", tags: ["to-do", "today", "important"], source: "manual" },
    { member_id: YUNUS, week_id: WEEK_ID, day_number: DAY, title: "Response time %40 iyileşti", description: "Database indexing optimization sayesinde API response time'ları ciddi şekilde düştü.", tags: ["meeting", "important"], source: "manual", is_completed: true },
    { member_id: YUNUS, week_id: WEEK_ID, day_number: DAY, title: "Redis cache layer sprint scope dışı", description: "İsteniyor ama bu sprint'e sığdırılması zor. Backlog'a eklendi.", tags: ["meeting"], source: "manual" },

    // Oğuzhan notes
    { member_id: OGUZHAN, week_id: WEEK_ID, day_number: DAY, title: "Jetpack Compose migration devam ediyor", description: "Legacy XML layout'lardan Compose'a geçiş. Ana ekranlar tamamlandı, detail sayfalar kaldı.", tags: ["today"], source: "manual" },
    { member_id: OGUZHAN, week_id: WEEK_ID, day_number: DAY, title: "UI test coverage %45 → %62", description: "Compose test framework kullanılarak test coverage'ı önemli ölçüde arttırıldı.", tags: ["today", "important"], source: "manual", is_completed: true },
    { member_id: OGUZHAN, week_id: WEEK_ID, day_number: DAY, title: "Memory leak fix'lendi", description: "Fragment lifecycle'da oluşan memory leak tespit edilip giderildi. GC pressure düştü.", tags: ["today", "important"], source: "manual", is_completed: true },
    { member_id: OGUZHAN, week_id: WEEK_ID, day_number: DAY, title: "Code review bekleniyor (Furkan'dan)", description: "2 gündür açık PR var. Furkan bugün review vereceğini söyledi.", tags: ["to-do", "yesterday"], source: "manual" },
  ];

  for (const note of aiNotes) {
    const { error } = await supabase.from("checkin_ai_notes").insert(note);
    if (error) console.log("  ⚠️ AI note error:", error.message);
  }

  // ═══════════════════════════════════════
  // 4. BLOCKERS
  // ═══════════════════════════════════════
  console.log("🚫 Adding blockers...");

  const blockers = [
    // Yunus blocks Furkan (Furkan backend API bekliyor)
    {
      blocker_id: YUNUS,
      blocked_id: FURKAN,
      week_id: WEEK_ID,
      day_number: DAY,
      reason: "Backend /api/notifications endpoint'i henüz hazır değil. Furkan mobile push notification modülünü tamamlayamıyor.",
      status: "active",
      source: "manual",
    },
    // Furkan blocks Oğuzhan (Oğuzhan code review bekliyor)
    {
      blocker_id: FURKAN,
      blocked_id: OGUZHAN,
      week_id: WEEK_ID,
      day_number: DAY,
      reason: "Jetpack Compose migration PR'ı 2 gündür code review bekliyor. Furkan'ın önce kendi işlerini bitirmesi gerekiyor.",
      status: "active",
      source: "manual",
    },
  ];

  for (const blocker of blockers) {
    const { error } = await supabase.from("blockers").insert(blocker);
    if (error) console.log("  ⚠️ Blocker error:", error.message);
  }

  // ═══════════════════════════════════════
  // 5. COMMITMENTS
  // ═══════════════════════════════════════
  console.log("✅ Adding commitments...");

  const commitments = [
    // Furkan commitments
    { member_id: FURKAN, week_id: WEEK_ID, day_number: DAY, title: "Push notification modülünü tamamla", description: "Kalan %20'lik kısım: edge case handling ve integration test yazımı.", tags: ["today", "important"], due_type: "today", source: "manual" },
    { member_id: FURKAN, week_id: WEEK_ID, day_number: DAY, title: "Oğuzhan'ın PR'ını review et", description: "Jetpack Compose migration PR'ı. 2 gündür bekliyor, bugün mutlaka bakılacak.", tags: ["today", "to-do"], due_type: "today", source: "manual" },
    { member_id: FURKAN, week_id: WEEK_ID, day_number: DAY, title: "Release branch CI/CD sorununu çöz", description: "Gradle signing config'de bir issue var. DevOps ile birlikte çözülecek.", tags: ["this_week"], due_type: "this_week", source: "manual" },
    { member_id: FURKAN, week_id: WEEK_ID, day_number: DAY, title: "v2.4.0 Android release'i yap", description: "Sprint sonu hedefi. Tüm blocker'lar çözüldükten sonra Play Store'a submit.", tags: ["important"], due_type: "this_week", source: "manual" },

    // Yunus commitments
    { member_id: YUNUS, week_id: WEEK_ID, day_number: DAY, title: "/api/notifications endpoint'ini bitir", description: "Furkan'ın release'i buna bağlı. Firebase Cloud Messaging entegrasyonu dahil.", tags: ["today", "important"], due_type: "today", source: "manual" },
    { member_id: YUNUS, week_id: WEEK_ID, day_number: DAY, title: "Staging test'lerini tamamla", description: "Migration sonrası tüm endpoint'lerin doğru çalıştığını verify et.", tags: ["today"], due_type: "today", source: "manual" },
    { member_id: YUNUS, week_id: WEEK_ID, day_number: DAY, title: "Production deploy planı hazırla", description: "Cuma günü production'a çıkılacak. Rollback planı ve monitoring setup.", tags: ["this_week"], due_type: "this_week", source: "manual" },

    // Oğuzhan commitments
    { member_id: OGUZHAN, week_id: WEEK_ID, day_number: DAY, title: "Compose migration'da detail sayfaları bitir", description: "Product detail ve settings sayfaları kaldı. Bu hafta bitirilmeli.", tags: ["this_week"], due_type: "this_week", source: "manual" },
    { member_id: OGUZHAN, week_id: WEEK_ID, day_number: DAY, title: "UI test coverage'ı %70'e çıkar", description: "Yeni Compose component'ları için test yazımı. Şu an %62.", tags: ["this_week", "to-do"], due_type: "this_week", source: "manual" },
    { member_id: OGUZHAN, week_id: WEEK_ID, day_number: DAY, title: "Performance test raporunu hazırla", description: "Memory leak fix ve Compose migration sonrası performans karşılaştırması.", tags: ["today"], due_type: "today", source: "manual" },
  ];

  for (const commitment of commitments) {
    const { error } = await supabase.from("commitments").insert(commitment);
    if (error) console.log("  ⚠️ Commitment error:", error.message);
  }

  console.log("\n✨ Dummy data seeded successfully!");
  console.log("   Furkan: General notes + mood(🙂) + 4 AI notes + 4 commitments + blocked by Yunus");
  console.log("   Yunus:  General notes + mood(😄) + 4 AI notes + 3 commitments + blocks Furkan");
  console.log("   Oğuzhan: General notes + mood(😐) + 4 AI notes + 3 commitments + blocked by Furkan");
}

seed().catch(console.error);
