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

  return NextResponse.json(data);
}
