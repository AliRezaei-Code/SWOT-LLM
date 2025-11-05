import { embedTexts } from "@/lib/embeddings";
import { searchSimilarChunks, type SearchResult } from "@/lib/rag/store";

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Embedding dimensions do not match");
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function maximumMarginalRelevance({
  query,
  candidates,
  lambda = 0.6,
  topN,
}: {
  query: number[];
  candidates: SearchResult[];
  lambda?: number;
  topN: number;
}): SearchResult[] {
  if (candidates.length === 0 || topN <= 0) {
    return [];
  }

  const selected: SearchResult[] = [];
  const remaining = new Set(candidates.map((_, index) => index));

  let firstIndex = 0;
  let bestScore = -Infinity;
  candidates.forEach((candidate, index) => {
    const score = cosineSimilarity(query, candidate.embedding);
    if (score > bestScore) {
      bestScore = score;
      firstIndex = index;
    }
  });

  selected.push(candidates[firstIndex]);
  remaining.delete(firstIndex);

  while (selected.length < topN && remaining.size > 0) {
    let bestCandidate = -1;
    let best = -Infinity;

    for (const index of remaining) {
      const candidate = candidates[index];
      const similarityToQuery = cosineSimilarity(query, candidate.embedding);
      let maxSimilarityToSelected = 0;
      for (const chosen of selected) {
        const similarity = cosineSimilarity(candidate.embedding, chosen.embedding);
        if (similarity > maxSimilarityToSelected) {
          maxSimilarityToSelected = similarity;
        }
      }
      const mmrScore = lambda * similarityToQuery - (1 - lambda) * maxSimilarityToSelected;
      if (mmrScore > best) {
        best = mmrScore;
        bestCandidate = index;
      }
    }

    if (bestCandidate === -1) {
      break;
    }
    selected.push(candidates[bestCandidate]);
    remaining.delete(bestCandidate);
  }

  return selected;
}

export interface RetrievalResult extends SearchResult {}

export async function retrieveRelevantChunks(query: string, {
  topK = Number.parseInt(process.env.RAG_TOP_K ?? "6", 10),
  mmrK = 4,
}: {
  topK?: number;
  mmrK?: number;
} = {}): Promise<{ queryEmbedding: number[]; chunks: RetrievalResult[]; }>
{
  const [queryEmbedding] = await embedTexts([query]);
  if (!queryEmbedding) {
    return { queryEmbedding: [], chunks: [] };
  }

  const candidates = await searchSimilarChunks({ vector: queryEmbedding, topK });
  const reranked = maximumMarginalRelevance({
    query: queryEmbedding,
    candidates,
    topN: Math.min(mmrK, candidates.length),
  });

  return { queryEmbedding, chunks: reranked };
}
