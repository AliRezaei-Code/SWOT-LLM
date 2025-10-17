import type { Request, Response } from "express";

import { streamChatResponse } from "../services/chatService.js";

const sendEvent = (res: Response, event: string, data: unknown) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

export const postChat = async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.status(200);

  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  let aborted = false;
  req.on("close", () => {
    aborted = true;
  });

  try {
    await streamChatResponse(req.body, {
      onConversationId: (id) => sendEvent(res, "conversation", { conversationId: id }),
      onCitations: (citations) => sendEvent(res, "citations", { citations }),
      onToken: (token) => sendEvent(res, "token", { token }),
      onDone: (payload) => sendEvent(res, "done", payload),
      onError: (error) => sendEvent(res, "error", { message: error.message }),
      isAborted: () => aborted
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    sendEvent(res, "error", { message });
  } finally {
    sendEvent(res, "close", {});
    res.end();
  }
};
