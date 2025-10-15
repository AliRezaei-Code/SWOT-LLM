"""Simple retrieval pipeline that uses the knowledge base search."""

from __future__ import annotations

from typing import List

from .knowledge_base import Document, KnowledgeBase


class RetrievalResult(dict):
    """Container for retrieval results with scoring metadata."""

    def __init__(self, document: Document, score: int) -> None:
        super().__init__(
            {
                "id": document.id,
                "title": document.title,
                "score": score,
                "content": document.content,
                "source": document.source,
                "metadata": document.metadata,
            }
        )
        self.document = document
        self.score = score


class Retriever:
    """Keyword-based retriever used for both internal and external modes."""

    def __init__(self, knowledge_base: KnowledgeBase) -> None:
        self.knowledge_base = knowledge_base

    def retrieve(self, query: str, limit: int = 5) -> List[RetrievalResult]:
        scored_results = []
        for document in self.knowledge_base.documents:
            score = self._score(document, query)
            if score > 0:
                scored_results.append(RetrievalResult(document, score))
        scored_results.sort(key=lambda result: result.score, reverse=True)
        return scored_results[:limit]

    @staticmethod
    def _score(document: Document, query: str) -> int:
        keywords = {token.lower() for token in query.split() if token}
        tokens = document.content.lower().split()
        return sum(1 for token in tokens if token in keywords)
