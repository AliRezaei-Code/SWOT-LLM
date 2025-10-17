import { MongoClient } from "mongodb";

import { environment } from "../config/environment.js";

let clientPromise: Promise<MongoClient> | null = null;
let clientInstance: MongoClient | null = null;

export const getMongoClient = (): Promise<MongoClient> => {
  if (!clientPromise) {
    clientPromise = MongoClient.connect(environment.mongoUri, {
      maxPoolSize: 10
    });
    clientPromise.then((client) => {
      clientInstance = client;
    });
  }
  return clientPromise;
};

export const getMongoCollection = async (collectionName: string) => {
  const client = await getMongoClient();
  return client.db(environment.mongoDbName).collection(collectionName);
};

export const closeMongoClient = async () => {
  if (clientInstance) {
    await clientInstance.close();
    clientInstance = null;
    clientPromise = null;
  }
};
