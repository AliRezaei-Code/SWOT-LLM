"""Utilities for loading documents and templates used by the assistant."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List

import json


DATA_DIR = Path(__file__).parent / "data"
DOCUMENT_DIR = DATA_DIR / "documents"
TEMPLATE_DIR = DATA_DIR / "templates"


@dataclass
class Document:
    """Represents a document available in the knowledge base."""

    id: str
    title: str
    source: str
    metadata: Dict[str, str]
    content: str


@dataclass
class Template:
    """Represents a LaTeX-aligned template with sections."""

    name: str
    version: str
    latex_preamble: str
    sections: Dict[str, str]


class KnowledgeBase:
    """Loads and provides access to documents and templates."""

    def __init__(self, document_dir: Path | None = None, template_dir: Path | None = None) -> None:
        self.document_dir = document_dir or DOCUMENT_DIR
        self.template_dir = template_dir or TEMPLATE_DIR
        self._documents = {doc.id: doc for doc in self._load_documents()}
        self._templates = {tpl.name: tpl for tpl in self._load_templates()}

    def _load_documents(self) -> Iterable[Document]:
        for path in sorted(self.document_dir.glob("*.json")):
            with path.open("r", encoding="utf-8") as handle:
                payload = json.load(handle)
            yield Document(
                id=payload["id"],
                title=payload["title"],
                source=payload.get("source", "internal"),
                metadata=payload.get("metadata", {}),
                content=payload["content"],
            )

    def _load_templates(self) -> Iterable[Template]:
        for path in sorted(self.template_dir.glob("*.json")):
            with path.open("r", encoding="utf-8") as handle:
                payload = json.load(handle)
            yield Template(
                name=payload["name"],
                version=payload.get("version", "1.0"),
                latex_preamble=payload.get("latex_preamble", ""),
                sections=payload.get("sections", {}),
            )

    @property
    def documents(self) -> List[Document]:
        return list(self._documents.values())

    @property
    def templates(self) -> List[Template]:
        return list(self._templates.values())

    def get_document(self, doc_id: str) -> Document:
        return self._documents[doc_id]

    def get_template(self, name: str) -> Template:
        return self._templates[name]

    def search(self, query: str, limit: int = 5) -> List[Document]:
        """Naive keyword search across document contents."""

        keywords = {token.lower() for token in query.split() if token}
        scored: List[tuple[int, Document]] = []
        for document in self._documents.values():
            doc_tokens = document.content.lower().split()
            score = sum(1 for token in doc_tokens if token in keywords)
            if score:
                scored.append((score, document))
        scored.sort(key=lambda item: item[0], reverse=True)
        return [doc for _, doc in scored[:limit]]
