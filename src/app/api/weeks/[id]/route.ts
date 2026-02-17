import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import * as mem from "@/lib/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (mem.isMemoryMode()) {
    return NextResponse.json({ error: "Not supported in memory mode" }, { status: 404 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("weeks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (mem.isMemoryMode()) {
    const week = mem.updateWeek(id, { active_days: body.active_days });
    return NextResponse.json(week);
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("weeks")
    .update({ active_days: body.active_days })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
