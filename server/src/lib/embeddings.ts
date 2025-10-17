import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface";

import { environment } from "../config/environment.js";

let embeddingsInstance: HuggingFaceTransformersEmbeddings | null = null;

export const getEmbeddings = () => {
  if (!embeddingsInstance) {
    embeddingsInstance = new HuggingFaceTransformersEmbeddings({
      modelName: environment.embeddingsModel,
      cacheDir: "./.cache/embeddings"
    });
  }
  return embeddingsInstance;
};
