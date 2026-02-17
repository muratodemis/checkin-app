import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

const SYSTEM_PROMPT = `You are an AI assistant for a CEO's weekly check-in tool. You analyze meeting notes about team members and extract structured data.

Given a check-in note about a team member, extract:

1. **ai_notes**: Key observations, action items, and updates. Each has a title (short), description (1-2 sentences), and tags (from: "today", "to-do", "meeting", "important", "yesterday").
2. **mood**: A mood emoji (😣, 😕, 😐, 🙂, or 😄) and a brief reason.
3. **commitments**: Promises or plans the member mentioned. Each has a title, description, tags, and due_type ("today" or "this_week").
4. **blockers**: If the note mentions someone blocking or being blocked. Each has blocker_name, blocked_name, and reason. Only include if explicitly mentioned.

Respond in JSON only. No markdown fences. Use Turkish for descriptions if the input is in Turkish.

Example output:
{
  "ai_notes": [
    {"title": "Sprint planning tamamlandı", "description": "Bu haftanın task'ları belirlendi.", "tags": ["meeting", "today"]}
  ],
  "mood": {"emoji": "🙂", "note": "Genel olarak motivasyonu yüksek."},
  "commitments": [
    {"title": "API endpoint'i bitir", "description": "Bugün tamamlanması gerekiyor.", "tags": ["today", "important"], "due_type": "today"}
  ],
  "blockers": [
    {"blocker_name": "Yunus", "blocked_name": "Furkan", "reason": "Backend API bekleniyor."}
  ]
}`;

interface AiParsed {
  ai_notes?: { title: string; description: string; tags: string[] }[];
  mood?: { emoji: string; note: string };
  commitments?: { title: string; description: string; tags: string[]; due_type: string }[];
  blockers?: { blocker_name: string; blocked_name: string; reason: string }[];
}

/* ─── Fallback: rule-based extraction when the API is unavailable ─── */
function fallbackExtract(content: string, memberName: string): AiParsed {
  const sentences = content
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const ai_notes: AiParsed["ai_notes"] = [];
  const commitments: AiParsed["commitments"] = [];
  const blockers: AiParsed["blockers"] = [];

  const todayKeywords = ["bugün", "today", "şu an", "şimdi", "tamamlandı", "bitti", "düzeldi", "halletti"];
  const todoKeywords = ["yapacak", "başlayacak", "planlıyor", "yapması gerekiyor", "tamamlanacak", "bitecek", "üzerinde çalışacak"];
  const tomorrowKeywords = ["yarın", "tomorrow", "sonraki gün"];
  const importantKeywords = ["önemli", "kritik", "acil", "blocker", "engel", "problem", "sorun"];
  const meetingKeywords = ["toplantı", "meeting", "görüşme", "sprint", "daily", "standup"];
  const blockerKeywords = ["bekliyor", "beklemek zorunda", "geciktir", "blokluyor", "engelliyor", "bekleniyor", "yavaşlat"];
  const commitKeywords = ["yapacak", "başlayacak", "tamamlayacak", "bitecek", "planlıyor", "hedefliyor", "söz verdi", "taahhüt"];

  const hasKeyword = (text: string, keywords: string[]) =>
    keywords.some((k) => text.toLowerCase().includes(k));

  for (const sentence of sentences) {
    const tags: string[] = [];
    if (hasKeyword(sentence, todayKeywords)) tags.push("today");
    if (hasKeyword(sentence, todoKeywords) || hasKeyword(sentence, tomorrowKeywords)) tags.push("to-do");
    if (hasKeyword(sentence, importantKeywords)) tags.push("important");
    if (hasKeyword(sentence, meetingKeywords)) tags.push("meeting");
    if (tags.length === 0) tags.push("today");

    const words = sentence.split(/\s+/);
    const title = words.slice(0, 6).join(" ") + (words.length > 6 ? "..." : "");

    ai_notes.push({ title, description: sentence, tags });

    if (hasKeyword(sentence, commitKeywords) || hasKeyword(sentence, tomorrowKeywords)) {
      commitments.push({
        title,
        description: sentence,
        tags: hasKeyword(sentence, tomorrowKeywords) ? ["to-do"] : ["today"],
        due_type: hasKeyword(sentence, tomorrowKeywords) ? "this_week" : "today",
      });
    }

    if (hasKeyword(sentence, blockerKeywords)) {
      const allNames = sentence.match(/[A-ZÇĞİÖŞÜ][a-zçğıöşü]+/g) || [];
      const otherNames = allNames.filter(
        (n) => !memberName.toLowerCase().includes(n.toLowerCase())
      );
      if (otherNames.length > 0) {
        blockers.push({
          blocker_name: otherNames[0],
          blocked_name: memberName.split(" ")[0],
          reason: sentence,
        });
      }
    }
  }

  // Mood detection
  const lower = content.toLowerCase();
  const positiveWords = ["iyi", "güzel", "süper", "harika", "motivasyon", "yüksek", "mutlu", "başarılı", "verimli"];
  const negativeWords = ["kötü", "zor", "stres", "düşük", "mutsuz", "sıkıntı", "problem", "sorun"];
  const positiveCount = positiveWords.filter((w) => lower.includes(w)).length;
  const negativeCount = negativeWords.filter((w) => lower.includes(w)).length;

  let emoji = "😐";
  let moodNote = "Normal bir gün.";
  if (positiveCount > negativeCount + 1) { emoji = "😄"; moodNote = "Genel olarak çok pozitif."; }
  else if (positiveCount > negativeCount) { emoji = "🙂"; moodNote = "Pozitif bir atmosfer var."; }
  else if (negativeCount > positiveCount + 1) { emoji = "😣"; moodNote = "Zorluklar yaşıyor."; }
  else if (negativeCount > positiveCount) { emoji = "😕"; moodNote = "Bazı zorluklar mevcut."; }

  return {
    ai_notes: ai_notes.slice(0, 5),
    mood: { emoji, note: moodNote },
    commitments: commitments.slice(0, 3),
    blockers,
  };
}

/* ─── Try Anthropic API, fall back to rule-based extraction ─── */
async function generateAiContent(content: string, memberName: string): Promise<AiParsed> {
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
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [
            { role: "user", content: `Team member: ${memberName}\n\nCheck-in note:\n${content}` },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.content?.[0]?.text || "";
        const parsed = JSON.parse(text);
        return parsed as AiParsed;
      }
      console.log("[ai-generate] Anthropic API returned non-OK, using fallback:", response.status);
    } catch (err) {
      console.log("[ai-generate] Anthropic API error, using fallback:", err);
    }
  }

  return fallbackExtract(content, memberName);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { member_id, week_id, day_number, content, member_name } = body;

  if (!content || content.trim().length < 20) {
    return NextResponse.json({ skipped: true, reason: "Note too short for AI analysis" });
  }

  try {
    const parsed = await generateAiContent(content, member_name);
    const supabase = createServerClient();

    // Clear existing AI-generated notes for this member/week/day
    await supabase
      .from("checkin_ai_notes")
      .delete()
      .eq("member_id", member_id)
      .eq("week_id", week_id)
      .eq("day_number", day_number)
      .eq("source", "ai_transcript");

    // Insert AI notes
    if (parsed.ai_notes?.length) {
      await supabase.from("checkin_ai_notes").insert(
        parsed.ai_notes.map((n) => ({
          member_id,
          week_id,
          day_number,
          title: n.title,
          description: n.description || "",
          tags: n.tags || [],
          source: "ai_transcript",
        }))
      );
    }

    // Save mood feedback
    if (parsed.mood) {
      await supabase.from("checkin_feedback").upsert(
        {
          member_id,
          week_id,
          day_number,
          question_type: "mood",
          question_index: 0,
          answer_text: "",
          mood_emoji: parsed.mood.emoji,
          mood_note: parsed.mood.note,
        },
        { onConflict: "member_id,week_id,day_number,question_type,question_index" }
      );
    }

    // Clear existing AI commitments and insert new
    if (parsed.commitments?.length) {
      await supabase
        .from("commitments")
        .delete()
        .eq("member_id", member_id)
        .eq("week_id", week_id)
        .eq("day_number", day_number)
        .eq("source", "ai_transcript");

      await supabase.from("commitments").insert(
        parsed.commitments.map((c) => ({
          member_id,
          week_id,
          day_number,
          title: c.title,
          description: c.description || "",
          tags: c.tags || [],
          due_type: c.due_type || "today",
          source: "ai_transcript",
        }))
      );
    }

    // Handle blockers (need to resolve names to IDs)
    if (parsed.blockers?.length) {
      const { data: allMembers } = await supabase
        .from("members")
        .select("id, name")
        .eq("is_active", true);

      if (allMembers) {
        const findMemberId = (name: string) => {
          const lower = name.toLowerCase();
          return allMembers.find(
            (m) =>
              m.name.toLowerCase().includes(lower) ||
              lower.includes(m.name.split(" ")[0].toLowerCase())
          )?.id;
        };

        // Clear existing AI blockers for this context
        await supabase
          .from("blockers")
          .delete()
          .eq("week_id", week_id)
          .eq("day_number", day_number)
          .eq("source", "ai_transcript");

        for (const b of parsed.blockers) {
          const blockerId = findMemberId(b.blocker_name);
          const blockedId = findMemberId(b.blocked_name);
          if (blockerId && blockedId) {
            await supabase.from("blockers").insert({
              blocker_id: blockerId,
              blocked_id: blockedId,
              week_id,
              day_number,
              reason: b.reason,
              source: "ai_transcript",
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      ai_notes_count: parsed.ai_notes?.length || 0,
      mood: parsed.mood,
      commitments_count: parsed.commitments?.length || 0,
      blockers_count: parsed.blockers?.length || 0,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
