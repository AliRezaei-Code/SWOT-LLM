#!/usr/bin/env tsx
import "dotenv/config";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import consola from "consola";
import { discoverFiles, loadDocument } from "@/lib/rag/loader";
import { chunkDocuments } from "@/lib/rag/chunk";
import { embedTexts } from "@/lib/embeddings";
import { upsertDocumentWithChunks } from "@/lib/rag/store";
import { prisma } from "@/lib/db";

interface CliOptions {
  root: string;
  force: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { root: "", force: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--root" || arg === "-r") {
      options.root = argv[index + 1] ?? "";
      index += 1;
    } else if (arg === "--force" || arg === "-f") {
      options.force = true;
    }
  }
  if (!options.root) {
    throw new Error("Usage: pnpm tsx scripts/ingest.ts --root <directory>");
  }
  return options;
}

async function fileHash(filePath: string): Promise<string> {
  const stat = await fs.stat(filePath);
  const hash = crypto.createHash("sha1");
  hash.update(filePath);
  hash.update(String(stat.mtimeMs));
  return hash.digest("hex");
}

async function main() {
  const started = Date.now();
  const options = parseArgs(process.argv.slice(2));
  const root = path.resolve(options.root);

  consola.start(`Scanning ${root}`);
  const files = await discoverFiles(root);
  if (files.length === 0) {
    consola.info("No supported documents found.");
    return;
  }

  const seen = new Set<string>();
  let processedFiles = 0;
  let totalChunks = 0;
  let totalEmbeddings = 0;

  for (const file of files) {
    const hash = await fileHash(file);
    if (seen.has(hash)) {
      consola.info(`Skipping duplicate ${file}`);
      continue;
    }
    seen.add(hash);

    const existing = await prisma.document.findUnique({ where: { path: file } });
    if (existing && !options.force) {
      consola.info(`Skipping unchanged file ${file}`);
      continue;
    }

    consola.start(`Ingesting ${file}`);
    const docs = await loadDocument(file);
    const chunks = await chunkDocuments(docs);
    if (chunks.length === 0) {
      consola.warn(`No content extracted from ${file}`);
      continue;
    }
    const embeddings = await embedTexts(chunks.map((chunk) => chunk.content));

    const representative = chunks[0];
    const title = representative.metadata.title ?? path.basename(file);
    const mime = representative.metadata.mime ?? "text/plain";

    await upsertDocumentWithChunks({
      path: representative.metadata.path,
      title,
      mime,
      chunks,
      vectors: embeddings,
      replace: true,
    });

    processedFiles += 1;
    totalChunks += chunks.length;
    totalEmbeddings += embeddings.length;
    consola.success(`Ingested ${file} (${chunks.length} chunks)`);
  }

  const durationMs = Date.now() - started;
  consola.box(
    `Ingestion complete\nFiles processed: ${processedFiles}\nChunks written: ${totalChunks}\nEmbeddings generated: ${totalEmbeddings}\nDuration: ${Math.round(durationMs / 1000)}s`,
  );
}

main()
  .catch((error) => {
    consola.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
