import { ChatOllama } from "@langchain/community/chat_models/ollama";

import { environment } from "../config/environment.js";

let chatModelInstance: ChatOllama | null = null;

export const getChatModel = () => {
  if (!chatModelInstance) {
    chatModelInstance = new ChatOllama({
      baseUrl: environment.ollamaBaseUrl,
      model: environment.ollamaModel,
      temperature: 0.1,
      keepAlive: "5m"
    });
  }
  return chatModelInstance;
};
