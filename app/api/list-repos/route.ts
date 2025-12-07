import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const sessionCookie = cookieHeader
    .split("; ")
    .find((row) => row.startsWith("review_session_id="));

  const sessionId = sessionCookie?.split("=")[1];

  if (!sessionId) {
    return NextResponse.json({ repos: [] });
  }

  const { data } = await supabase
    .from("repos")
    .select("id, name, status")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ repos: data || [] });
}
