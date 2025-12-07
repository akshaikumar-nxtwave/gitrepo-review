import Mistral from "@mistralai/mistralai";

const client = new Mistral(process.env.MISTRAL_API_KEY!);

export async function embedText(text: string) {
  const res = await client.embeddings({
    model: "mistral-embed",
    input: text,
  });
  
  return res.data[0].embedding;
}