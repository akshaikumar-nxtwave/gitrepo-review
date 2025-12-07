import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { repoQueue } from "@/lib/queue";
import { v4 as uuid } from "uuid";

export async function GET(req: NextRequest) {
  const repoId = req.nextUrl.searchParams.get("repo_id");

  if (!repoId) {
    return NextResponse.json({ error: "repo_id required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("repos")
    .select("status")
    .eq("id", repoId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: data.status });
}


export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("review_session_id")?.value;

  if (!sessionId) {
    return NextResponse.json({ error: "No session found." }, { status: 400 });
  }

  const { git_url } = await req.json();

  if (!git_url) {
    return NextResponse.json({ error: "git_url is required" }, { status: 400 });
  }

  const repoId = uuid();

  // Insert repo into DB
  await supabase.from("repos").insert({
    id: repoId,
    session_id: sessionId,
    git_url,
    name: git_url.split("/").pop()?.replace(".git", "") || "unknown",
    status: "pending",
  });

  // Push job to queue
  await repoQueue.add("processRepo", {
    sessionId,
    repoId,
    git_url,
  });

  return NextResponse.json({
    repo_id: repoId,
    status: "queued",
  });
}
