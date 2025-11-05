import { encoding_for_model } from "@dqbd/tiktoken";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import type { LoadedDocument } from "@/lib/rag/loader";

export interface ChunkRecord {
  content: string;
  tokens: number;
  ordinal: number;
  metadata: {
    path: string;
    title: string;
    mime: string;
    source: string;
  } & Record<string, unknown>;
}

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1200,
  chunkOverlap: 200,
});

const TOKEN_MODEL = "text-embedding-3-large";

function countTokens(text: string): number {
  const encoding = encoding_for_model(TOKEN_MODEL);
  try {
    return encoding.encode(text).length;
  } finally {
    encoding.free();
  }
}

export async function chunkDocuments(documents: LoadedDocument[]): Promise<ChunkRecord[]> {
  const chunks = await splitter.splitDocuments(documents);
  const ordinals = new Map<string, number>();

  return chunks.map((chunk) => {
    const path = String(chunk.metadata?.source ?? "unknown");
    const title = String(chunk.metadata?.title ?? "Untitled");
    const mime = String(chunk.metadata?.mime ?? "text/plain");
    const ordinal = ordinals.get(path) ?? 0;
    ordinals.set(path, ordinal + 1);

    return {
      content: chunk.pageContent.trim(),
      tokens: countTokens(chunk.pageContent),
      ordinal,
      metadata: {
        path,
        title,
        mime,
        source: path,
        ...chunk.metadata,
      },
    } satisfies ChunkRecord;
  });
}
