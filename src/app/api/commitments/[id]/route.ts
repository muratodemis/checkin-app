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
    const commitment = mem.updateCommitment(id, body);
    return NextResponse.json(commitment);
  }

  const supabase = createServerClient();
  const updateData: Record<string, unknown> = { ...body };
  if (body.is_completed === true) {
    updateData.completed_at = new Date().toISOString();
  } else if (body.is_completed === false) {
    updateData.completed_at = null;
  }

  const { data, error } = await supabase
    .from("commitments")
    .update(updateData)
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
    mem.deleteCommitment(id);
    return NextResponse.json({ success: true });
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("commitments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
