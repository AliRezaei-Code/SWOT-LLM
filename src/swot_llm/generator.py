"""Structured content generation for internal and external modes."""

from __future__ import annotations

from dataclasses import dataclass
from typing import List

from .knowledge_base import Template
from .retriever import RetrievalResult
from .telemetry import TelemetrySnapshot


@dataclass
class GeneratedSection:
    title: str
    body: str


class InternalGenerator:
    """Generates LaTeX-ready content for internal workflows."""

    def __init__(self, template: Template) -> None:
        self.template = template

    def generate(self, topic: str, evidence: List[RetrievalResult]) -> List[GeneratedSection]:
        sections = []
        for section, instructions in self.template.sections.items():
            citations = self._format_citations(evidence)
            body = (
                f"% {instructions}\n"
                f"\\section{{{section}}}\n"
                f"{self._compose_body(topic, section, evidence)}\n"
                f"\\textbf{{Citations}}: {citations}"
            )
            sections.append(GeneratedSection(title=section, body=body))
        return sections

    @staticmethod
    def _compose_body(topic: str, section: str, evidence: List[RetrievalResult]) -> str:
        snippets = []
        for result in evidence:
            snippet = result["content"][:200].replace("\n", " ")
            snippets.append(f"{result['title']}: {snippet}…")
        joined = " ".join(snippets) if snippets else "No supporting passages found."
        return f"{topic} — {section}. {joined}"

    @staticmethod
    def _format_citations(evidence: List[RetrievalResult]) -> str:
        if not evidence:
            return "None"
        return "; ".join(f"{result['title']} ({result['source']})" for result in evidence)


class ExternalGenerator:
    """Produces human-readable recommendations for operators."""

    def generate(
        self,
        telemetry: TelemetrySnapshot,
        recommendations: List[str],
        evidence: List[RetrievalResult],
        safety_score: float,
    ) -> str:
        header = (
            f"Site: {telemetry.site_id} | Timestamp: {telemetry.timestamp.isoformat()}\n"
            f"Flow: {telemetry.flow_rate_m3_h:.2f} m3/h | Residual chlorine: {telemetry.residual_mg_L:.2f} mg/L"
        )
        body_lines = [f"- {item}" for item in recommendations]
        citations = (
            "Citations: "
            + (", ".join(f"{result['title']} ({result['source']})" for result in evidence) if evidence else "None")
        )
        return "\n".join([header, "Safety score: %.2f" % safety_score, *body_lines, citations])
