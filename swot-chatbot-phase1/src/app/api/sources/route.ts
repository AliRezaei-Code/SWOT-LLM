import { NextResponse } from "next/server";
import { getChunkById, getDocumentById } from "@/lib/rag/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chunkId = searchParams.get("id");
  const documentId = searchParams.get("documentId");

  try {
    if (chunkId) {
      const chunk = await getChunkById(chunkId);
      if (!chunk) {
        return NextResponse.json({ error: "Chunk not found" }, { status: 404 });
      }
      return NextResponse.json({
        id: chunk.id,
        content: chunk.content,
        ordinal: chunk.ordinal,
        document: {
          id: chunk.document.id,
          title: chunk.document.title,
          path: chunk.document.path,
          mime: chunk.document.mime,
        },
      });
    }

    if (documentId) {
      const document = await getDocumentById(documentId);
      if (!document) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      return NextResponse.json(document);
    }

    return NextResponse.json({ error: "Expected id or documentId" }, { status: 400 });
  } catch (error) {
    console.error("/api/sources", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
