import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import * as mem from "@/lib/store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (mem.isMemoryMode()) {
    const note = mem.updateAiNote(id, body);
    return NextResponse.json(note);
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("checkin_ai_notes")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (mem.isMemoryMode()) {
    mem.deleteAiNote(id);
    return NextResponse.json({ success: true });
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("checkin_ai_notes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
