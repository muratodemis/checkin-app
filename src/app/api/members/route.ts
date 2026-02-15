import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import * as mem from "@/lib/store";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (mem.isMemoryMode()) {
    const member = mem.createMember({
      name: body.name,
      role: body.role || null,
      avatar_url: body.avatar_url || null,
      team_id: body.team_id,
      sort_order: body.sort_order || 0,
    });
    return NextResponse.json(member);
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("members")
    .insert({
      name: body.name,
      role: body.role || null,
      avatar_url: body.avatar_url || null,
      team_id: body.team_id,
      sort_order: body.sort_order || 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
