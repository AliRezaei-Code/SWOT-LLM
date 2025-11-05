import { NextResponse } from "next/server";
import { TextEncoder } from "node:util";
import { prisma } from "@/lib/db";
import { streamRagAnswer } from "@/lib/rag/answer";
import type { ChatMessage } from "@/lib/models";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body?.message ?? "").trim();
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const abortController = new AbortController();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        const sendToken = (token: string) => {
          controller.enqueue(encoder.encode(`event: token\ndata: ${JSON.stringify(token)}\n\n`));
        };

        try {
          const historyRows = await prisma.message.findMany({
            orderBy: { createdAt: "desc" },
            take: 30,
          });
          const history: ChatMessage[] = historyRows
            .reverse()
            .map((row) => ({
              role: row.role as ChatMessage["role"],
              content: row.content,
            }));

          await prisma.message.create({
            data: { role: "user", content: message },
          });

          const { answer, citations, groundedness } = await streamRagAnswer({
            query: message,
            history,
            onToken: sendToken,
            signal: abortController.signal,
          });

          await prisma.message.create({
            data: {
              role: "assistant",
              content: answer,
            },
          });

          send("done", { citations, groundedness });
          controller.close();
        } catch (error) {
          console.error("/api/chat", error);
          send("error", { message: (error as Error).message });
          controller.close();
        }
      },
      cancel() {
        abortController.abort();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
