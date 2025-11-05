import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { ChunkRecord } from "@/lib/rag/chunk";

export interface UpsertResult {
  documentId: string;
  chunkCount: number;
}

function sqlVector(vector: number[]) {
  return Prisma.sql`ARRAY[${Prisma.join(vector)}]::vector`;
}

export async function upsertDocumentWithChunks({
  path,
  title,
  mime,
  chunks,
  vectors,
  replace,
}: {
  path: string;
  title: string;
  mime: string;
  chunks: ChunkRecord[];
  vectors: number[][];
  replace?: boolean;
}): Promise<UpsertResult> {
  if (chunks.length !== vectors.length) {
    throw new Error("Chunks and vectors length mismatch");
  }

  return prisma.$transaction(async (tx) => {
    const document = await tx.document.upsert({
      where: { path },
      update: { title, mime },
      create: { path, title, mime },
    });

    if (replace) {
      await tx.embedding.deleteMany({ where: { chunk: { documentId: document.id } } });
      await tx.chunk.deleteMany({ where: { documentId: document.id } });
    }

    let inserted = 0;
    for (let index = 0; index < chunks.length; index += 1) {
      const chunk = chunks[index];
      const vector = vectors[index];

      const createdChunk = await tx.chunk.create({
        data: {
          documentId: document.id,
          ordinal: chunk.ordinal,
          content: chunk.content,
          tokens: chunk.tokens,
        },
      });

      await tx.$executeRaw`
        INSERT INTO "Embedding" ("chunkId", "vector")
        VALUES (${createdChunk.id}, ${sqlVector(vector)})
        ON CONFLICT ("chunkId")
        DO UPDATE SET "vector" = EXCLUDED."vector";
      `;
      inserted += 1;
    }

    return { documentId: document.id, chunkCount: inserted } satisfies UpsertResult;
  });
}

export interface SearchResult {
  chunkId: string;
  documentId: string;
  title: string;
  path: string;
  mime: string;
  content: string;
  ordinal: number;
  tokens: number;
  score: number;
  embedding: number[];
}

export async function searchSimilarChunks({
  vector,
  topK,
}: {
  vector: number[];
  topK: number;
}): Promise<SearchResult[]> {
  const vectorSql = sqlVector(vector);
  const rows = await prisma.$queryRaw<Array<{
    chunkId: string;
    documentId: string;
    title: string;
    path: string;
    mime: string;
    content: string;
    ordinal: number;
    tokens: number;
    score: number;
    embedding: number[];
  }>>`
    SELECT
      c."id" AS "chunkId",
      c."documentId" AS "documentId",
      d."title" AS "title",
      d."path" AS "path",
      d."mime" AS "mime",
      c."content" AS "content",
      c."ordinal" AS "ordinal",
      c."tokens" AS "tokens",
      1 - (e."vector" <#> ${vectorSql}) AS "score",
      (e."vector"::float4[]) AS "embedding"
    FROM "Embedding" e
    JOIN "Chunk" c ON c."id" = e."chunkId"
    JOIN "Document" d ON d."id" = c."documentId"
    ORDER BY e."vector" <#> ${vectorSql} ASC
    LIMIT ${topK}
  `;

  return rows;
}

export async function getChunkById(id: string) {
  return prisma.chunk.findUnique({
    where: { id },
    include: {
      document: true,
    },
  });
}

export async function getDocumentById(id: string) {
  return prisma.document.findUnique({ where: { id } });
}
