import { NextRequest, NextResponse } from "next/server";
import { embedText } from "@/lib/embed";
import { supabase } from "@/lib/supabase";
import Mistral from "@mistralai/mistralai";

const client = new Mistral(process.env.MISTRAL_API_KEY!);

export async function POST(req: NextRequest) {
  const { repo_id, prompt } = await req.json();

  if (!repo_id || !prompt) {
    return NextResponse.json(
      { error: "repo_id and prompt required" },
      { status: 400 }
    );
  }

  const qEmbed = await embedText(prompt);

  const { data: chunks, error } = await supabase.rpc("match_code_chunks", {
    query_embedding: qEmbed,
    repo_id_input: repo_id,
    match_count: 10,
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const context = chunks
    .map((c: { file_path: string; content: string }) => `// FILE: ${c.file_path}\n${c.content}`)
    .join("\n\n");

  const resp = await client.chat({
    model: "mistral-large-latest",
    messages: [
      {
        role: "user",
        content: `Prompt:${prompt} Relevant Code: ${context}`,
      },
    ],
  });
  console.log(resp)
  return NextResponse.json({
    answer: resp.choices[0].message.content,
  });
}
