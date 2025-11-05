import fs from "node:fs/promises";
import path from "node:path";
import { Document } from "langchain/document";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";

export type LoadedDocument = Document<Record<string, unknown>>;

const SUPPORTED_EXTENSIONS = new Set([".pdf", ".md", ".txt"]);

function detectMime(ext: string): string {
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".md":
      return "text/markdown";
    case ".txt":
    default:
      return "text/plain";
  }
}

async function isFile(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function walkDirectory(root: string): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files: string[] = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(root, entry.name);
      if (entry.isDirectory()) {
        const nested = await walkDirectory(entryPath);
        files.push(...nested);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.has(ext)) {
          files.push(entryPath);
        }
      }
    }),
  );
  return files.sort();
}

export async function discoverFiles(rootDir: string): Promise<string[]> {
  if (!(await isFile(rootDir))) {
    const stat = await fs.stat(rootDir);
    if (!stat.isDirectory()) {
      throw new Error(`Expected directory or file at ${rootDir}`);
    }
    return walkDirectory(rootDir);
  }
  const ext = path.extname(rootDir).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    return [];
  }
  return [rootDir];
}

export async function loadDocument(filePath: string): Promise<LoadedDocument[]> {
  const ext = path.extname(filePath).toLowerCase();
  const title = path.basename(filePath, ext);
  const metadata = {
    source: filePath,
    title,
    mime: detectMime(ext),
  } satisfies Record<string, unknown>;

  if (ext === ".pdf") {
    const loader = new PDFLoader(filePath, {
      splitPages: false,
    });
    const docs = await loader.load();
    return docs.map((doc) =>
      new Document({
        pageContent: doc.pageContent,
        metadata: { ...metadata, ...(doc.metadata ?? {}) },
      }),
    );
  }

  const loader = new TextLoader(filePath, {
    autodetectEncoding: true,
  });
  const docs = await loader.load();
  return docs.map((doc) =>
    new Document({
      pageContent: doc.pageContent,
      metadata: { ...metadata, ...(doc.metadata ?? {}) },
    }),
  );
}

export async function loadCorpus(rootDir: string): Promise<LoadedDocument[]> {
  const files = await discoverFiles(rootDir);
  const documents: LoadedDocument[] = [];
  for (const file of files) {
    const docs = await loadDocument(file);
    documents.push(...docs);
  }
  return documents;
}
