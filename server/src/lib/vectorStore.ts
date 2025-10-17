import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import type { Collection } from "mongodb";

import { environment } from "../config/environment.js";
import { getMongoCollection } from "./mongoClient.js";
import { getEmbeddings } from "./embeddings.js";

let vectorStorePromise: Promise<MongoDBAtlasVectorSearch> | null = null;

export const getVectorStore = async () => {
  if (!vectorStorePromise) {
    vectorStorePromise = (async () => {
      const collection: Collection = await getMongoCollection(environment.mongoVectorCollection);
      return new MongoDBAtlasVectorSearch(getEmbeddings(), {
        collection,
        indexName: environment.mongoVectorIndex,
        textKey: "content",
        embeddingKey: "embedding"
      });
    })();
  }
  return vectorStorePromise;
};
