import OpenAI from "openai";

const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-large";
const BATCH_SIZE = Number.parseInt(process.env.EMBEDDING_BATCH_SIZE ?? "16", 10);

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to generate embeddings.");
  }
  return new OpenAI({ apiKey });
}

async function embedBatch(client: OpenAI, texts: string[]): Promise<number[][]> {
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return response.data.map((item) => item.embedding);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const client = getClient();
  const batches = Math.ceil(texts.length / BATCH_SIZE);
  const results: number[][] = [];

  for (let i = 0; i < batches; i += 1) {
    const start = i * BATCH_SIZE;
    const slice = texts.slice(start, start + BATCH_SIZE);
    let attempt = 0;
    const maxAttempts = 4;
    // Exponential backoff retry with jitter to handle rate limits.
    while (true) {
      try {
        const embeddings = await embedBatch(client, slice);
        results.push(...embeddings);
        break;
      } catch (error) {
        attempt += 1;
        if (attempt >= maxAttempts) {
          throw error;
        }
        const delay = Math.min(4000, 200 * 2 ** attempt) + Math.random() * 200;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return results;
}
