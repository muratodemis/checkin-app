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
    return NextResponse.json(mem.getAiNotes(memberId, weekId, Number(day)));
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("checkin_ai_notes")
    .select("*")
    .eq("member_id", memberId)
    .eq("week_id", weekId)
    .eq("day_number", Number(day))
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (mem.isMemoryMode()) {
    const note = mem.createAiNote(body);
    return NextResponse.json(note);
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("checkin_ai_notes")
    .insert({
      member_id: body.member_id,
      week_id: body.week_id,
      day_number: body.day_number,
      title: body.title,
      description: body.description || "",
      tags: body.tags || [],
      source: body.source || "manual",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
