import { NextResponse } from "next/server";
import { createUserClient } from "@/lib/supabase";

export async function POST() {
  return NextResponse.json(
    { error: "Use Supabase Auth client-side signIn instead" },
    { status: 410 }
  );
}

export async function DELETE() {
  const supabase = await createUserClient();
  await supabase.auth.signOut();

  const response = NextResponse.json({ success: true });
  response.cookies.delete("sb-access-token");
  response.cookies.delete("sb-refresh-token");
  return response;
}
