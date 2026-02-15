import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import * as mem from "@/lib/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (mem.isMemoryMode()) {
    return NextResponse.json(mem.getQuestions(id));
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("weekly_questions")
    .select("*")
    .eq("week_id", id)
    .single();

  if (error && error.code === "PGRST116") {
    return NextResponse.json(null);
  }
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { questions } = await request.json();

  if (mem.isMemoryMode()) {
    const q = mem.setQuestions(id, questions);
    return NextResponse.json(q);
  }

  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("weekly_questions")
    .select("id")
    .eq("week_id", id)
    .single();

  let data, error;

  if (existing) {
    ({ data, error } = await supabase
      .from("weekly_questions")
      .update({ questions })
      .eq("week_id", id)
      .select()
      .single());
  } else {
    ({ data, error } = await supabase
      .from("weekly_questions")
      .insert({ week_id: id, questions })
      .select()
      .single());
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
