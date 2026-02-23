import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import * as mem from "@/lib/store";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const memberId = searchParams.get("memberId");
  const weekId = searchParams.get("weekId");
  const day = searchParams.get("day");

  if (!memberId || !weekId || !day) {
    return NextResponse.json({ error: "memberId, weekId, day required" }, { status: 400 });
  }

  if (mem.isMemoryMode()) {
    return NextResponse.json(mem.getFeedback(memberId, weekId, Number(day)));
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("checkin_feedback")
    .select("*")
    .eq("member_id", memberId)
    .eq("week_id", weekId)
    .eq("day_number", Number(day))
    .order("question_type")
    .order("question_index", { ascending: true, nullsFirst: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (mem.isMemoryMode()) {
    const feedback = mem.upsertFeedback(body);
    if (body.question_type === "general_notes" && body.answer_text !== undefined) {
      mem.upsertNote({
        member_id: body.member_id,
        week_id: body.week_id,
        day: body.day_number,
        content: body.answer_text,
      });
    }
    return NextResponse.json(feedback);
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("checkin_feedback")
    .upsert({
      member_id: body.member_id,
      week_id: body.week_id,
      day_number: body.day_number,
      question_type: body.question_type,
      question_index: body.question_index ?? null,
      answer_text: body.answer_text ?? "",
      mood_emoji: body.mood_emoji ?? null,
      mood_note: body.mood_note ?? null,
    }, { onConflict: "member_id,week_id,day_number,question_type,question_index" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.question_type === "general_notes" && body.answer_text !== undefined) {
    await supabase
      .from("checkin_notes")
      .upsert(
        {
          member_id: body.member_id,
          week_id: body.week_id,
          day: body.day_number,
          content: body.answer_text,
        },
        { onConflict: "member_id,week_id,day" }
      )
      .then(() => {});
  }

  return NextResponse.json(data);
}
