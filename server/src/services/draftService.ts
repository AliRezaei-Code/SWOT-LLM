import { randomUUID } from "crypto";

export const queueDraftGeneration = async (query: string) => {
  // TODO: integrate retrieval augmented generation pipeline.
  return {
    draftId: randomUUID(),
    status: "queued",
    query
  };
};
