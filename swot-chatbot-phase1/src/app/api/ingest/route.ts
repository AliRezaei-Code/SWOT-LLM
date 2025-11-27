import { NextResponse } from "next/server";
import path from "node:path";
import { loadCorpus } from "@/lib/rag/loader";
import { chunkDocuments } from "@/lib/rag/chunk";
import { embedTexts } from "@/lib/embeddings";
import { upsertDocumentWithChunks } from "@/lib/rag/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Ingestion is disabled in production" }, { status: 403 });
  }

  const startedAt = Date.now();

  try {
    const body = await request.json();
    const rootDir = String(body?.rootDir ?? "").trim();
    if (!rootDir) {
      return NextResponse.json({ error: "rootDir is required" }, { status: 400 });
    }

    const corpus = await loadCorpus(rootDir);
    if (corpus.length === 0) {
      return NextResponse.json({ message: "No supported documents found", counts: { files: 0, chunks: 0, embeddings: 0 } });
    }

    const chunkRecords = await chunkDocuments(corpus);
    const embeddings = await embedTexts(chunkRecords.map((chunk) => chunk.content));

    const grouped = new Map<string, { title: string; mime: string; chunks: Array<(typeof chunkRecords)[number]> }>();
    chunkRecords.forEach((chunk) => {
      const key = chunk.metadata.path;
      const group = grouped.get(key);
      if (group) {
        group.chunks.push(chunk);
      } else {
        grouped.set(key, {
          title: String(chunk.metadata.title ?? path.basename(key)),
          mime: String(chunk.metadata.mime ?? "text/plain"),
          chunks: [chunk],
        });
      }
    });

    let offset = 0;
    let documentsUpserted = 0;
    let totalChunks = 0;
    for (const [docPath, group] of grouped.entries()) {
      const vectors = embeddings.slice(offset, offset + group.chunks.length);
      offset += group.chunks.length;
      await upsertDocumentWithChunks({
        path: docPath,
        title: group.title,
        mime: group.mime,
        chunks: group.chunks,
        vectors,
        replace: true,
      });
      documentsUpserted += 1;
      totalChunks += group.chunks.length;
    }

    const durationMs = Date.now() - startedAt;

    return NextResponse.json({
      message: "Ingestion complete",
      counts: {
        files: documentsUpserted,
        chunks: totalChunks,
        embeddings: totalChunks,
        durationMs,
      },
    });
  } catch (error) {
    console.error("/api/ingest", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
