import dotenv from "dotenv";

dotenv.config();

export const environment = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  mongoUri: process.env.MONGODB_URI ?? "mongodb://localhost:27017/wqta",
  mongoDbName: process.env.MONGODB_DB_NAME ?? "wqta",
  mongoVectorCollection: process.env.MONGODB_VECTOR_COLLECTION ?? "corpus_chunks",
  mongoVectorIndex: process.env.MONGODB_VECTOR_INDEX ?? "vector_index",
  mongoConversationsCollection: process.env.MONGODB_CONVERSATIONS_COLLECTION ?? "conversations",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL ?? "llama3:8b",
  embeddingsModel: process.env.EMBEDDINGS_MODEL ?? "Xenova/all-MiniLM-L6-v2",
  retrievalK: process.env.RETRIEVAL_K ? Number(process.env.RETRIEVAL_K) : 4,
  allowCorsOrigins: (process.env.ALLOW_CORS_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((value) => value.trim())
};
