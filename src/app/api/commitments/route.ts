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
    return NextResponse.json(mem.getCommitments(memberId, weekId, Number(day)));
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("commitments")
    .select("*")
    .eq("member_id", memberId)
    .eq("week_id", weekId)
    .eq("day_number", Number(day))
    .order("is_completed", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (mem.isMemoryMode()) {
    const commitment = mem.createCommitment(body);
    return NextResponse.json(commitment);
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("commitments")
    .insert({
      member_id: body.member_id,
      week_id: body.week_id,
      day_number: body.day_number,
      title: body.title,
      description: body.description || "",
      tags: body.tags || [],
      due_type: body.due_type || "today",
      source: body.source || "manual",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
