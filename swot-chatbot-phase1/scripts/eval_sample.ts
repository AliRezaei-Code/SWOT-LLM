#!/usr/bin/env tsx
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import yaml from "yaml";
import consola from "consola";
import { retrieveRelevantChunks } from "@/lib/rag/retrieve";
import { streamRagAnswer } from "@/lib/rag/answer";
import type { ChatMessage } from "@/lib/models";
import { prisma } from "@/lib/db";

interface EvalSample {
  question: string;
  expectedPaths: string[];
}

async function loadSamples(): Promise<EvalSample[]> {
  const filePath = path.resolve(process.cwd(), "scripts/eval_samples.yaml");
  const file = await fs.readFile(filePath, "utf8");
  const data = yaml.parse(file) as EvalSample[];
  return data;
}

async function main() {
  const samples = await loadSamples();
  if (!samples.length) {
    consola.warn("No evaluation samples found.");
    return;
  }

  let hits = 0;
  let groundednessSum = 0;

  for (const sample of samples) {
    consola.start(`Evaluating: ${sample.question}`);
    const retrieval = await retrieveRelevantChunks(sample.question);
    const topPaths = retrieval.chunks.map((chunk) => chunk.path);
    const hit = sample.expectedPaths.some((pathItem) => topPaths.includes(pathItem));
    if (hit) {
      hits += 1;
    }

    const result = await streamRagAnswer({
      query: sample.question,
      history: [] as ChatMessage[],
      onToken: () => {},
    });

    groundednessSum += result.groundedness.confidence;
    consola.info(`Hit@k: ${hit ? "✅" : "❌"}`);
    consola.info(`Groundedness: ${result.groundedness.confidence.toFixed(2)}`);
  }

  const hitRate = hits / samples.length;
  const groundednessAvg = groundednessSum / samples.length;
  consola.box(
    `Evaluation complete\nSamples: ${samples.length}\nHit@k: ${(hitRate * 100).toFixed(1)}%\nAvg groundedness: ${groundednessAvg.toFixed(2)}`,
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
