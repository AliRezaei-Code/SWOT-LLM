import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

export const queryRefinementPrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are an assistant that reformulates follow-up questions into standalone questions."],
  new MessagesPlaceholder("history"),
  ["human", "Rewrite the latest user question so it stands alone: {input}"],
  ["human", "Standalone question:"]
]);

export const answerPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    [
      "You are the SWOT-LLM Technical Water Quality Assistant.",
      "You ONLY answer using the provided context.",
      "If the answer is not in the context, reply: \"I lack the necessary context in the water quality database to answer this question.\"",
      "Always cite sources inline using [source_id] references and finish with a short safety note when relevant.",
      "Context:\n{context}"
    ].join("\n")
  ],
  new MessagesPlaceholder("history"),
  ["human", "{question}"]
]);
