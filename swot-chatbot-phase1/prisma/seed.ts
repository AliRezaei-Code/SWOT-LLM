import "dotenv/config";
import { Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/db";

function sqlVector(vector: number[]) {
  return Prisma.sql`ARRAY[${Prisma.join(vector)}]::vector`;
}

async function seed() {
  const existing = await prisma.document.findFirst({ where: { path: "seed/swot-intro" } });
  if (existing) {
    console.log("Seed data already present");
    return;
  }

  const document = await prisma.document.create({
    data: {
      title: "Getting started with SWOT Chatbot",
      path: "seed/swot-intro",
      mime: "text/markdown",
    },
  });

  const chunk = await prisma.chunk.create({
    data: {
      documentId: document.id,
      ordinal: 0,
      content:
        "This internal chatbot analyses strengths, weaknesses, opportunities, and threats from curated documents to support strategic planning.",
      tokens: 32,
    },
  });

  const dummyVector = Array.from({ length: 3072 }, (_, index) => ((index % 7) - 3) / 100);

  await prisma.$executeRaw`
    INSERT INTO "Embedding" ("chunkId", "vector")
    VALUES (${chunk.id}, ${sqlVector(dummyVector)})
    ON CONFLICT ("chunkId") DO UPDATE SET "vector" = EXCLUDED."vector";
  `;

  console.log("Seed inserted");
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
