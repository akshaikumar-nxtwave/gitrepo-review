import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { redis } from "@/lib/redis";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("review_session_id")?.value;

  if (!sessionId) {
    return NextResponse.json({ error: "No session found" }, { status: 400 });
  }

  // 1️⃣ Delete repos in Supabase (chunks cascade automatically)
  const { error } = await supabase
    .from("repos")
    .delete()
    .eq("session_id", sessionId);

  if (error) {
    console.error("Supabase cleanup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2️⃣ Delete all Redis keys for BullMQ queue
  try {
    await redis.del(
      "repo-processing:meta",
      "repo-processing:id",
      "repo-processing:completed",
      "repo-processing:failed",
      "repo-processing:wait",
      "repo-processing:paused",
      "repo-processing:delayed",
      "repo-processing:active",
      "repo-processing:events",
      "repo-processing:priority",
      "repo-processing:stalled",
      "repo-processing:repeat",
    );
  } catch (err) {
    console.error("Redis cleanup error:", err);
  }

  return NextResponse.json({ success: true });
}
