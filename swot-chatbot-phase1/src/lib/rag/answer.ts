import type { ChatMessage } from "@/lib/models";
import { streamChatCompletion } from "@/lib/models";
import type { RetrievalResult } from "@/lib/rag/retrieve";
import { retrieveRelevantChunks } from "@/lib/rag/retrieve";
import { evaluateGroundedness } from "@/lib/eval/groundedness";

export interface Citation {
  id: string;
  documentId: string;
  ordinal: number;
  title: string;
  path: string;
  mime: string;
  snippet: string;
  content: string;
  score: number;
}

export interface GroundednessAssessment {
  grounded: boolean;
  confidence: number;
  missingEvidence?: string[];
}

export interface StreamAnswerResult {
  answer: string;
  citations: Citation[];
  groundedness: GroundednessAssessment;
}

function buildContext(chunks: RetrievalResult[]): string {
  return chunks
    .map((chunk) => `Source ${chunk.documentId}:${chunk.ordinal}\nTitle: ${chunk.title}\nPath: ${chunk.path}\n---\n${chunk.content}`)
    .join("\n\n");
}

const SYSTEM_PROMPT = `You are an internal SWOT analyst helping colleagues reason over proprietary material.
Use the provided context chunks to answer questions concisely.
- Cite the supporting evidence inline using the format [Source documentId:ordinal].
- Focus on findings that are explicitly grounded in the context; do not speculate.
- When information is insufficient, say so clearly and suggest next steps.
- Respond in markdown.
- Summaries should distinguish Strengths, Weaknesses, Opportunities, and Threats when applicable.`;

function mapCitations(answer: string, chunks: RetrievalResult[]): Citation[] {
  const matches = new Set<string>();
  const regex = /([A-Za-z0-9_-]+):(\d+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(answer)) !== null) {
    matches.add(`${match[1]}:${match[2]}`);
  }

  const citations: Citation[] = [];
  for (const chunk of chunks) {
    const key = `${chunk.documentId}:${chunk.ordinal}`;
    if (matches.has(key)) {
      citations.push({
        id: chunk.chunkId,
        documentId: chunk.documentId,
        ordinal: chunk.ordinal,
        title: chunk.title,
        path: chunk.path,
        mime: chunk.mime,
        snippet: chunk.content.slice(0, 280),
        content: chunk.content,
        score: chunk.score,
      });
    }
  }
  return citations;
}

export async function streamRagAnswer({
  query,
  history,
  onToken,
  signal,
}: {
  query: string;
  history: ChatMessage[];
  onToken: (token: string) => void;
  signal?: AbortSignal;
}): Promise<StreamAnswerResult> {
  const { chunks } = await retrieveRelevantChunks(query);
  const context = chunks.length > 0 ? buildContext(chunks) : "No relevant context found.";

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    {
      role: "user",
      content: `Context:\n${context}\n\nQuestion: ${query}`,
    },
  ];

  const { content } = await streamChatCompletion({ messages, onToken, signal });

  const citations = mapCitations(content, chunks);
  const groundedness = evaluateGroundedness({
    answer: content,
    citations,
  });

  return { answer: content, citations, groundedness };
}
