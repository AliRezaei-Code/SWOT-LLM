import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import type { Document } from "langchain/document";
import { z } from "zod";

import { environment } from "../config/environment.js";
import { ConversationModel, type ConversationDocument } from "../models/conversation.js";
import { getVectorStore } from "../lib/vectorStore.js";
import { getChatModel } from "../lib/chatModel.js";
import { answerPrompt, queryRefinementPrompt } from "../prompts/chatPrompts.js";

const chatInputSchema = z.object({
  message: z.string().min(1, "Message is required."),
  conversationId: z.string().optional()
});

type Citation = { id: string; title: string; snippet: string };

type StreamCallbacks = {
  onConversationId?: (id: string) => void;
  onCitations?: (citations: Citation[]) => void;
  onToken?: (token: string) => void;
  onDone?: (payload: { conversationId: string; response: string; citations: Citation[] }) => void;
  onError?: (error: Error) => void;
  isAborted?: () => boolean;
};

const toLangChainMessages = (conversation: ConversationDocument | null): BaseMessage[] => {
  if (!conversation) {
    return [];
  }

  return conversation.messages.map((message) => {
    if (message.role === "assistant") {
      return new AIMessage(message.content);
    }
    if (message.role === "system") {
      return new SystemMessage(message.content);
    }
    return new HumanMessage(message.content);
  });
};

const buildCitations = (docs: Document[]): Citation[] =>
  docs.map((doc, index) => {
    const source =
      doc.metadata?.docId ??
      doc.metadata?.source ??
      doc.metadata?.path ??
      doc.metadata?.title ??
      `doc-${index + 1}`;
    const title = doc.metadata?.title ?? source;
    const snippet = (doc.pageContent ?? "").slice(0, 320).replace(/\s+/g, " ").trim();

    return {
      id: String(source),
      title: String(title),
      snippet
    };
  });

const extractChunkText = (chunk: unknown): string => {
  if (typeof chunk === "string") {
    return chunk;
  }

  if (chunk && typeof chunk === "object" && "message" in chunk) {
    const message = (chunk as { message?: { content?: unknown } }).message;
    if (!message?.content) return "";

    if (typeof message.content === "string") {
      return message.content;
    }

    if (Array.isArray(message.content)) {
      return message.content
        .map((part) => {
          if (typeof part === "string") return part;
          if (part && typeof part === "object" && "text" in part) {
            return String((part as { text?: string }).text ?? "");
          }
          return "";
        })
        .join("");
    }
  }

  return "";
};

export const streamChatResponse = async (
  payload: unknown,
  callbacks: StreamCallbacks
): Promise<void> => {
  const input = chatInputSchema.parse(payload);
  const chatModel = getChatModel();
  const vectorStore = await getVectorStore();

  let conversation =
    input.conversationId !== undefined
      ? await ConversationModel.findById(input.conversationId)
      : null;

  if (!conversation) {
    conversation = await ConversationModel.create({
      messages: []
    });
  }

  callbacks.onConversationId?.(conversation.id);

  const historyMessages = toLangChainMessages(conversation);

  // Step 1: Reformulate the user query using chat history.
  const refinementMessages = await queryRefinementPrompt.formatMessages({
    history: historyMessages,
    input: input.message
  });
  const refined = await chatModel.invoke(refinementMessages);
  const standaloneQuestion =
    typeof refined.content === "string" && refined.content.trim().length > 0
      ? refined.content.trim()
      : input.message;

  // Step 2: Retrieve relevant documents.
  const retriever = vectorStore.asRetriever({
    k: environment.retrievalK
  });
  const docs = await retriever.getRelevantDocuments(standaloneQuestion);
  const citations = buildCitations(docs);
  callbacks.onCitations?.(citations);

  const context = docs
    .map((doc, index) => {
      const citation = citations[index];
      return [
        `Source [${citation.id}] - ${citation.title}`,
        doc.metadata?.url ? `URL: ${doc.metadata.url}` : "",
        doc.pageContent
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  // Step 3: Generate answer with streaming tokens.
  const answerMessages = await answerPrompt.formatMessages({
    context,
    history: historyMessages,
    question: input.message
  });

  let assembledResponse = "";

  try {
    const stream = await chatModel.stream(answerMessages);

    for await (const chunk of stream) {
      if (callbacks.isAborted?.()) {
        return;
      }
      const text = extractChunkText(chunk);
      if (!text) continue;
      assembledResponse += text;
      callbacks.onToken?.(text);
    }

    conversation.messages.push({
      role: "user",
      content: input.message,
      createdAt: new Date()
    });

    conversation.messages.push({
      role: "assistant",
      content: assembledResponse,
      citations,
      createdAt: new Date()
    });

    await conversation.save();

    callbacks.onDone?.({
      conversationId: conversation.id,
      response: assembledResponse,
      citations
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown chat error");
    callbacks.onError?.(err);
    throw err;
  }
};
