import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get("review_session_id")?.value;

  return NextResponse.json({
    session_id: sessionId,
  });
}
