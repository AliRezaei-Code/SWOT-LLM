import OpenAI from "openai";

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to run chat completions.");
  }
  return new OpenAI({ apiKey });
}

export interface StreamResult {
  content: string;
  finishReason?: string | null;
}

export async function streamChatCompletion({
  messages,
  onToken,
  signal,
}: {
  messages: ChatMessage[];
  onToken: (token: string) => void;
  signal?: AbortSignal;
}): Promise<StreamResult> {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: CHAT_MODEL,
    messages,
    temperature: 0.1,
    top_p: 0.9,
    stream: true,
    max_tokens: 1024,
  }, { signal });

  let content = "";
  let finishReason: string | null = null;

  for await (const chunk of completion) {
    const choice = chunk.choices[0];
    if (!choice) {
      continue;
    }
    if (choice.delta?.content) {
      content += choice.delta.content;
      onToken(choice.delta.content);
    }
    if (choice.finish_reason) {
      finishReason = choice.finish_reason;
    }
  }

  return { content, finishReason };
}
