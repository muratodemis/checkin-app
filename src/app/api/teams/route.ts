import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import * as mem from "@/lib/store";

export async function GET() {
  if (mem.isMemoryMode()) {
    return NextResponse.json(mem.getTeamsWithMembers());
  }

  const supabase = createServerClient();

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("*")
    .order("sort_order", { ascending: true });

  if (teamsError) {
    return NextResponse.json({ error: teamsError.message }, { status: 500 });
  }

  const { data: members, error: membersError } = await supabase
    .from("members")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 500 });
  }

  const teamsWithMembers = teams.map((team) => ({
    ...team,
    members: members.filter((m) => m.team_id === team.id),
  }));

  return NextResponse.json(teamsWithMembers);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (mem.isMemoryMode()) {
    const team = mem.createTeam(body.name, body.sort_order || 0);
    return NextResponse.json(team);
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("teams")
    .insert({ name: body.name, sort_order: body.sort_order || 0 })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
