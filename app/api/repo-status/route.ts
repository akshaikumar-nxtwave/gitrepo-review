import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const repoId = req.nextUrl.searchParams.get("repo_id");

  if (!repoId) {
    return NextResponse.json({ error: "repo_id required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("repos")
    .select("*")
    .eq("id", repoId)
    .maybeSingle();

  console.log("STATUS CHECK:", { data, error });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Repo not found" }, { status: 404 });
  }

  return NextResponse.json({ status: data.status });
}
