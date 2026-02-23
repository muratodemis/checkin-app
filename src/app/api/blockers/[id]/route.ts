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
    const blocker = mem.updateBlocker(id, body);
    return NextResponse.json(blocker);
  }

  const supabase = createServerClient();
  const updateData: Record<string, unknown> = { ...body };
  if (body.status === "resolved") {
    updateData.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("blockers")
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
    mem.deleteBlocker(id);
    return NextResponse.json({ success: true });
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("blockers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
