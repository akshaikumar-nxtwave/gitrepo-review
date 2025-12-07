import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { embedText } from "@/lib/embed";

export async function POST(req: NextRequest) {
  const { repo_id, query } = await req.json();

  if (!repo_id || !query) {
    return NextResponse.json({ error: "repo_id and query are required" }, { status: 400 });
  }

  const queryEmbedding = await embedText(query);

  
  const { data, error } = await supabase.rpc("match_code_chunks", {
    query_embedding: queryEmbedding,
    repo_id_input: repo_id,
    match_count: 10, 
  });

  if (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ chunks: data });
}
