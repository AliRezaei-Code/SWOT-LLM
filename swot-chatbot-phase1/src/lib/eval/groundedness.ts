import type { Citation, GroundednessAssessment } from "@/lib/rag/answer";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 4);
}

function unique(tokens: string[]): Set<string> {
  return new Set(tokens);
}

export function evaluateGroundedness({
  answer,
  citations,
}: {
  answer: string;
  citations: Citation[];
}): GroundednessAssessment {
  const answerTokens = tokenize(answer);
  const answerSet = unique(answerTokens);
  const evidenceTokens = citations.flatMap((citation) => tokenize(citation.content));
  const evidenceSet = unique(evidenceTokens);

  let overlap = 0;
  answerSet.forEach((token) => {
    if (evidenceSet.has(token)) {
      overlap += 1;
    }
  });

  const coverage = answerSet.size > 0 ? overlap / answerSet.size : 0;
  const grounded = coverage >= 0.45 || citations.length === 0;

  const missingEvidence = answerTokens
    .filter((token) => !evidenceSet.has(token))
    .slice(0, 5);

  return {
    grounded,
    confidence: Number(coverage.toFixed(2)),
    missingEvidence,
  };
}
