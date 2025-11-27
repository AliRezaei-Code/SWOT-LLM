import { describe, expect, it } from "vitest";
import { maximumMarginalRelevance, cosineSimilarity } from "@/lib/rag/retrieve";
import type { SearchResult } from "@/lib/rag/store";

function makeVector(values: number[]): number[] {
  return values;
}

describe("maximumMarginalRelevance", () => {
  it("selects diverse candidates", () => {
    const query = makeVector([1, 0, 0, 0]);
    const candidates: SearchResult[] = [
      {
        chunkId: "a",
        documentId: "doc1",
        title: "A",
        path: "a",
        mime: "text/plain",
        content: "",
        ordinal: 0,
        tokens: 0,
        score: 0.98,
        embedding: makeVector([0.9, 0.1, 0, 0]),
      },
      {
        chunkId: "b",
        documentId: "doc2",
        title: "B",
        path: "b",
        mime: "text/plain",
        content: "",
        ordinal: 0,
        tokens: 0,
        score: 0.94,
        embedding: makeVector([0.85, 0.05, 0.05, 0.05]),
      },
      {
        chunkId: "c",
        documentId: "doc3",
        title: "C",
        path: "c",
        mime: "text/plain",
        content: "",
        ordinal: 0,
        tokens: 0,
        score: 0.91,
        embedding: makeVector([0.6, 0.1, 0.6, 0]),
      },
      {
        chunkId: "d",
        documentId: "doc4",
        title: "D",
        path: "d",
        mime: "text/plain",
        content: "",
        ordinal: 0,
        tokens: 0,
        score: 0.89,
        embedding: makeVector([0.4, 0.4, 0.7, 0]),
      },
    ];

    const selection = maximumMarginalRelevance({ query, candidates, topN: 3, lambda: 0.6 });

    expect(selection).toHaveLength(3);
    // Ensure we selected top-scoring first candidate.
    expect(selection[0].chunkId).toBe("a");
    // Ensure selections are unique and encourage diversity.
    const similarities = selection.map((candidate) => cosineSimilarity(candidate.embedding, query));
    expect(new Set(selection.map((item) => item.chunkId)).size).toBe(selection.length);
    expect(similarities[0]).toBeGreaterThan(similarities[1]! - 1e-6);
  });
});
