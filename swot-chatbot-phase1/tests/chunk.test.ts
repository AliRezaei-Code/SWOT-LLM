import { describe, expect, it } from "vitest";
import { Document } from "langchain/document";
import { chunkDocuments } from "@/lib/rag/chunk";

function generateText(length: number): string {
  return "A".repeat(length).split("").map((char, index) => ((index + 1) % 50 === 0 ? "\n" : char)).join("");
}

describe("chunkDocuments", () => {
  it("splits long documents into overlapping chunks", async () => {
    const text = generateText(3600);
    const docs = [
      new Document({
        pageContent: text,
        metadata: { source: "test.md", title: "Test", mime: "text/markdown" },
      }),
    ];

    const chunks = await chunkDocuments(docs);

    expect(chunks.length).toBeGreaterThan(2);
    expect(chunks[0].ordinal).toBe(0);
    expect(chunks[1].ordinal).toBe(1);
    expect(chunks[0].metadata.path).toBe("test.md");
    expect(chunks.every((chunk) => chunk.content.length <= 1300)).toBe(true);
    expect(chunks.every((chunk) => chunk.tokens > 0)).toBe(true);
  });
});
