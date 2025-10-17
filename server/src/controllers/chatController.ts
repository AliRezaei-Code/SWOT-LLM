import type { Request, Response } from "express";

import { generateChatPlaceholder } from "../services/chatService.js";

export const postChat = async (req: Request, res: Response) => {
  const { message, history } = req.body as {
    message?: string;
    history?: Array<{ id: string; role: "user" | "assistant"; content: string }>;
  };

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "Message is required." });
    return;
  }

  const conversation = Array.isArray(history) ? history : [];
  const result = await generateChatPlaceholder(conversation, message);

  res.status(200).json({
    response: result.conversation.at(-1),
    citations: result.citations,
    conversation: result.conversation
  });
};
