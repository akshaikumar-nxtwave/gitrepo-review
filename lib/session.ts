import { supabase } from "./supabase";
import { v4 as uuid } from "uuid";

export async function createSession() {
  const sessionId = uuid();

  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

  await supabase.from("sessions").insert({
    id: sessionId,
    expires_at: expiresAt.toISOString(),
    status: "active"
  });

  return sessionId;
}
