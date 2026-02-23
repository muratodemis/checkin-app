import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Sen bir CEO'nun haftalık check-in aracı için AI asistanısın.
Sana bir takım üyesiyle yapılan check-in görüşme notları verilecek. Bu notları analiz edip yapılandırılmış veri üreteceksin.

KURALLAR:
- SADECE notta yazanları analiz et. Hiçbir bilgiyi uydurma.
- Notta olmayan bir şeyi ekleme.
- Türkçe yaz.
- JSON formatında yanıt ver, markdown fence kullanma.

ÇIKTI FORMATI:
{
  "ai_notes": [
    {
      "title": "Kısa başlık (max 8 kelime)",
      "description": "1-2 cümlelik açıklama",
      "tags": ["today"|"to-do"|"meeting"|"important"|"yesterday"]
    }
  ],
  "commitments": [
    {
      "title": "Taahhüt başlığı",
      "description": "Ne yapacağına dair açıklama",
      "tags": ["today"|"to-do"|"important"],
      "due_type": "today"|"this_week"
    }
  ],
  "blockers": [
    {
      "blocker_name": "Engelleyen kişinin adı",
      "blocked_name": "Engellenen kişinin adı",
      "reason": "Neden engelleniyor"
    }
  ],
  "mood": {
    "emoji": "😐|🙂|😄|😕|😣",
    "note": "Kısa mood açıklaması"
  },
  "summary": "Genel 1-2 cümlelik özet"
}

NOT:
- ai_notes: Nottan çıkarılan her anlamlı bilgi maddesi. Bugün yapılanlar "today", yapılacaklar "to-do", toplantıyla ilgili "meeting", önemli/acil olan "important", dünle ilgili "yesterday" tag'i alır.
- commitments: Kişinin söz verdiği, yapacağını belirttiği şeyler. Eğer yoksa boş array döndür.
- blockers: SADECE notta açıkça birisinin bir başkasını engellediği/beklediği yazıyorsa ekle. Yoksa boş array döndür.
- mood: Notun genel tonundan çıkar. Pozitifse 🙂/😄, nötralse 😐, sorun varsa 😕/😣.
- summary: Tüm notun 1-2 cümlelik özeti.`;

interface AiSummaryResult {
  ai_notes: { title: string; description: string; tags: string[] }[];
  commitments: { title: string; description: string; tags: string[]; due_type: string }[];
  blockers: { blocker_name: string; blocked_name: string; reason: string }[];
  mood: { emoji: string; note: string };
  summary: string;
}

function fallbackSummarize(content: string, memberName: string): AiSummaryResult {
  const lines = content
    .split(/[.\n!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const ai_notes: AiSummaryResult["ai_notes"] = [];
  const commitments: AiSummaryResult["commitments"] = [];
  const blockers: AiSummaryResult["blockers"] = [];

  const todayKw = ["bugün", "today", "şu an", "tamamlandı", "bitti", "halletti", "yaptı", "çalıştı"];
  const todoKw = ["yapacak", "başlayacak", "planlıyor", "yapması gerek", "tamamlanacak", "üzerinde çalışacak", "bakacak"];
  const importantKw = ["önemli", "kritik", "acil", "blocker", "engel", "problem", "sorun"];
  const meetingKw = ["toplantı", "meeting", "görüşme", "sprint", "daily"];
  const blockerKw = ["bekliyor", "blokluyor", "engelliyor", "bekleniyor", "geciktir", "tıkandı"];
  const commitKw = ["yapacak", "başlayacak", "tamamlayacak", "bitecek", "planlıyor", "söz verdi", "taahhüt"];

  const has = (text: string, kws: string[]) => kws.some((k) => text.toLowerCase().includes(k));

  for (const line of lines) {
    const tags: string[] = [];
    if (has(line, todayKw)) tags.push("today");
    if (has(line, todoKw)) tags.push("to-do");
    if (has(line, importantKw)) tags.push("important");
    if (has(line, meetingKw)) tags.push("meeting");
    if (tags.length === 0) tags.push("today");

    const words = line.split(/\s+/);
    const title = words.slice(0, 7).join(" ") + (words.length > 7 ? "..." : "");
    ai_notes.push({ title, description: line, tags });

    if (has(line, commitKw)) {
      commitments.push({
        title,
        description: line,
        tags: tags.includes("to-do") ? ["to-do"] : ["today"],
        due_type: tags.includes("to-do") ? "this_week" : "today",
      });
    }

    if (has(line, blockerKw)) {
      const names = line.match(/[A-ZÇĞİÖŞÜ][a-zçğıöşü]+/g) || [];
      const others = names.filter((n) => !memberName.toLowerCase().includes(n.toLowerCase()));
      if (others.length > 0) {
        blockers.push({
          blocker_name: others[0],
          blocked_name: memberName.split(" ")[0],
          reason: line,
        });
      }
    }
  }

  const lower = content.toLowerCase();
  const posW = ["iyi", "güzel", "süper", "harika", "tamam", "bitti", "tamamlandı", "ilerledi", "başarılı"];
  const negW = ["kötü", "zor", "stres", "problem", "sorun", "gecik", "tıkandı", "engel"];
  const pos = posW.filter((w) => lower.includes(w)).length;
  const neg = negW.filter((w) => lower.includes(w)).length;

  let emoji = "😐";
  let moodNote = "Normal bir gün.";
  if (pos > neg + 1) { emoji = "😄"; moodNote = "Çok pozitif görünüyor."; }
  else if (pos > neg) { emoji = "🙂"; moodNote = "Genel olarak olumlu."; }
  else if (neg > pos + 1) { emoji = "😣"; moodNote = "Zorluklar yaşıyor."; }
  else if (neg > pos) { emoji = "😕"; moodNote = "Bazı sorunlar mevcut."; }

  const summary = ai_notes.length > 0
    ? ai_notes.slice(0, 2).map((n) => n.description).join(". ") + "."
    : "Not çok kısa, detaylı analiz yapılamadı.";

  return {
    ai_notes: ai_notes.slice(0, 6),
    commitments: commitments.slice(0, 4),
    blockers,
    mood: { emoji, note: moodNote },
    summary,
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { content, member_name } = body;

  if (!content || content.trim().length < 10) {
    return NextResponse.json({ error: "Not çok kısa" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 1200,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Takım üyesi: ${member_name}\n\nCheck-in notu:\n${content}`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.content?.[0]?.text || "";
        try {
          const parsed = JSON.parse(text) as AiSummaryResult;
          return NextResponse.json(parsed);
        } catch {
          console.log("[ai-summarize] Failed to parse Claude response, using fallback");
        }
      } else {
        const errBody = await response.text().catch(() => "");
        console.log("[ai-summarize] Claude API error:", response.status, errBody);
      }
    } catch (err) {
      console.log("[ai-summarize] Claude API request failed:", err);
    }
    console.log("[ai-summarize] Using fallback summarizer");
  }

  const result = fallbackSummarize(content, member_name || "Üye");
  return NextResponse.json(result);
}
