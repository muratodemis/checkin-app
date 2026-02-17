import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import * as mem from "@/lib/store";

export async function GET(request: NextRequest) {
  const weekId = request.nextUrl.searchParams.get("week_id");

  if (!weekId) {
    return NextResponse.json({ error: "week_id parameter required" }, { status: 400 });
  }

  if (mem.isMemoryMode()) {
    return NextResponse.json(mem.getNotesByWeek(weekId));
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("checkin_notes")
    .select("*")
    .eq("week_id", weekId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function PUT(request: NextRequest) {
  const { member_id, week_id, day, content } = await request.json();

  if (mem.isMemoryMode()) {
    const note = mem.upsertNote({ member_id, week_id, day, content });
    return NextResponse.json(note);
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("checkin_notes")
    .upsert(
      { member_id, week_id, day, content },
      { onConflict: "member_id,week_id,day" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Sync to checkin_feedback general_notes
  if (content !== undefined) {
    await supabase
      .from("checkin_feedback")
      .upsert(
        {
          member_id,
          week_id,
          day_number: day,
          question_type: "general_notes",
          question_index: 0,
          answer_text: content,
        },
        { onConflict: "member_id,week_id,day_number,question_type,question_index" }
      )
      .then(() => {});
  }

  // Trigger AI generation for long notes (100+ chars), fire-and-forget
  if (content && content.trim().length >= 100) {
    const { data: member } = await supabase.from("members").select("name").eq("id", member_id).single();
    const baseUrl = request.nextUrl.origin;
    const basePath = "/5mins";
    fetch(`${baseUrl}${basePath}/api/ai-generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({
        member_id,
        week_id,
        day_number: day,
        content,
        member_name: member?.name || "Unknown",
      }),
    }).catch((err) => console.log("[notes] AI trigger error:", err));
  }

  return NextResponse.json(data);
}
