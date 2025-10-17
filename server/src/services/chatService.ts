import { randomUUID } from "crypto";

type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export const generateChatPlaceholder = async (conversation: ChatTurn[], message: string) => {
  // TODO: replace with actual retrieval augmented generation pipeline.
  return {
    conversation: [
      ...conversation,
      { id: randomUUID(), role: "user" as const, content: message },
      {
        id: randomUUID(),
        role: "assistant" as const,
        content:
          "Placeholder response from the RAG assistant. Integrate embeddings, retrieval, and LLM calls to generate grounded answers."
      }
    ],
    citations: [
      { id: "doc-001", title: "Chlorination SOP v3.2" },
      { id: "doc-014", title: "Distribution System Troubleshooting Guide" }
    ]
  };
};
