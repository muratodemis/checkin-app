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
    return NextResponse.json(mem.getBlockers(memberId, weekId, Number(day)));
  }

  const supabase = createServerClient();

  const { data: blocking, error: e1 } = await supabase
    .from("blockers")
    .select("*, blocker:blocker_id(name,role), blocked:blocked_id(name,role)")
    .eq("blocked_id", memberId)
    .eq("week_id", weekId)
    .eq("day_number", Number(day))
    .eq("status", "active");

  const { data: blockerTo, error: e2 } = await supabase
    .from("blockers")
    .select("*, blocker:blocker_id(name,role), blocked:blocked_id(name,role)")
    .eq("blocker_id", memberId)
    .eq("week_id", weekId)
    .eq("day_number", Number(day))
    .eq("status", "active");

  if (e1 || e2) return NextResponse.json({ error: (e1 || e2)!.message }, { status: 500 });

  return NextResponse.json({
    waiting: (blocking || []).map((b: any) => ({
      ...b,
      blocker_name: b.blocker?.name,
      blocker_role: b.blocker?.role,
      blocked_name: b.blocked?.name,
      blocked_role: b.blocked?.role,
    })),
    blocker_to: (blockerTo || []).map((b: any) => ({
      ...b,
      blocker_name: b.blocker?.name,
      blocker_role: b.blocker?.role,
      blocked_name: b.blocked?.name,
      blocked_role: b.blocked?.role,
    })),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (mem.isMemoryMode()) {
    const blocker = mem.createBlocker(body);
    return NextResponse.json(blocker);
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("blockers")
    .insert({
      blocker_id: body.blocker_id,
      blocked_id: body.blocked_id,
      week_id: body.week_id,
      day_number: body.day_number,
      reason: body.reason || "",
      source: body.source || "manual",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
