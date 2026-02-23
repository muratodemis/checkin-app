import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import * as mem from "@/lib/store";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "date parameter required" }, { status: 400 });
  }

  if (mem.isMemoryMode()) {
    const week = mem.getOrCreateWeek(date);
    return NextResponse.json(week);
  }

  const supabase = createServerClient();

  let { data: week, error } = await supabase
    .from("weeks")
    .select("*")
    .eq("week_start", date)
    .single();

  if (error && error.code === "PGRST116") {
    const { data: newWeek, error: createError } = await supabase
      .from("weeks")
      .insert({ week_start: date, active_days: [1, 2, 3, 4, 5] })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }
    week = newWeek;
  } else if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(week);
}
