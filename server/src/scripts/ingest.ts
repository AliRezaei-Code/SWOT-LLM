import fs from "fs";
import path from "path";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { DirectoryLoader } from "@langchain/community/document_loaders/fs/directory";
import { TextLoader } from "@langchain/community/document_loaders/fs/text";

import { environment } from "../config/environment.js";
import { getVectorStore } from "../lib/vectorStore.js";
import { closeMongoClient } from "../lib/mongoClient.js";

const CORPUS_DIR =
  process.env.CORPUS_DIR ??
  path.resolve(process.cwd(), "..", "data", "corpus");

const main = async () => {
  console.log("[ingest] Starting corpus ingestion");
  console.log(`[ingest] Target directory: ${CORPUS_DIR}`);

  if (!fs.existsSync(CORPUS_DIR)) {
    console.error(
      "[ingest] Corpus directory not found. Create data/corpus and add .md/.txt documents before running ingestion."
    );
    process.exit(1);
  }

  const loader = new DirectoryLoader(CORPUS_DIR, {
    ".md": (filePath) => new TextLoader(filePath),
    ".txt": (filePath) => new TextLoader(filePath)
  });

  const rawDocuments = await loader.load();
  if (rawDocuments.length === 0) {
    console.warn("[ingest] No documents found. Add markdown or text files to the corpus directory.");
    process.exit(0);
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 900,
    chunkOverlap: 150,
    separators: ["\n\n", "\n", ". ", "; ", ", ", " "]
  });

  const documents = await splitter.splitDocuments(rawDocuments);

  const vectorStore = await getVectorStore();

  console.log(
    `[ingest] Inserting ${documents.length} chunks into MongoDB Atlas collection "${environment.mongoVectorCollection}" using index "${environment.mongoVectorIndex}"`
  );

  await vectorStore.addDocuments(
    documents.map((doc) => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        docId:
          doc.metadata?.docId ??
          path.relative(CORPUS_DIR, (doc.metadata?.source as string) ?? doc.metadata?.path ?? "unknown"),
        ingestedAt: new Date().toISOString()
      }
    }))
  );

  console.log("[ingest] Completed successfully.");
};

main()
  .catch((error) => {
    console.error("[ingest] Failed to ingest corpus", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeMongoClient();
  });
