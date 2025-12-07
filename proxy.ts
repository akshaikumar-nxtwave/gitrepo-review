import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSession } from "./lib/session";

export async function proxy(req: NextRequest) {
  const sessionCookie = req.cookies.get("review_session_id");
  const res = NextResponse.next();

  if (sessionCookie?.value) {
    return res;
  }
  
  const newSessionId = await createSession();

  res.cookies.set("review_session_id", newSessionId, {
    httpOnly: true,
    path: "/",
    maxAge: 2 * 60 * 60,
    sameSite: "lax",
  });

  return res;
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
