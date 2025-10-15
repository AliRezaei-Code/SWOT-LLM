"""Chlorine dosing recommendation engine."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List

import json

from .generator import ExternalGenerator, InternalGenerator
from .knowledge_base import KnowledgeBase
from .retriever import Retriever
from .telemetry import TelemetrySnapshot, load_telemetry


@dataclass
class Recommendation:
    site_id: str
    generated_at: str
    text: str
    dose_mg_per_L: float
    safety_score: float
    actions: List[str]
    citations: List[str]


class Validator:
    """Ensures generated sections adhere to template expectations."""

    @staticmethod
    def validate_sections(section_titles: Iterable[str], template_sections: Iterable[str]) -> None:
        expected = list(template_sections)
        titles = list(section_titles)
        if titles != expected:
            raise ValueError(f"Section order mismatch. Expected {expected} but received {titles}.")


class RecordStore:
    """Append-only record store backed by JSONL."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def append(self, recommendation: Recommendation) -> None:
        payload = {
            "site_id": recommendation.site_id,
            "generated_at": recommendation.generated_at,
            "text": recommendation.text,
            "dose_mg_per_L": recommendation.dose_mg_per_L,
            "safety_score": recommendation.safety_score,
            "actions": recommendation.actions,
            "citations": recommendation.citations,
        }
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(payload) + "\n")


class RecommendationEngine:
    """Coordinates retrieval, generation, and validation."""

    def __init__(self, knowledge_base: KnowledgeBase, record_store: RecordStore | None = None) -> None:
        self.knowledge_base = knowledge_base
        self.retriever = Retriever(knowledge_base)
        self.record_store = record_store or RecordStore(Path("records/recommendations.jsonl"))

    def generate_internal(self, template_name: str, topic: str) -> List[str]:
        template = self.knowledge_base.get_template(template_name)
        generator = InternalGenerator(template)
        evidence = self.retriever.retrieve(topic)
        sections = generator.generate(topic, evidence)
        Validator.validate_sections([section.title for section in sections], template.sections.keys())
        return [section.body for section in sections]

    def generate_external(self, site_id: str) -> Recommendation:
        telemetry_points = list(load_telemetry(site_id))
        if not telemetry_points:
            raise ValueError(f"No telemetry available for site '{site_id}'.")
        latest = telemetry_points[-1]
        query = f"chlorine {latest.residual_mg_L:.2f} safety"
        evidence = self.retriever.retrieve(query)
        dose = self._compute_dose(latest)
        safety = self._compute_safety_score(latest, dose)
        actions = self._derive_actions(latest, dose, safety)
        generator = ExternalGenerator()
        text = generator.generate(latest, actions, evidence, safety)
        recommendation = Recommendation(
            site_id=site_id,
            generated_at=latest.timestamp.isoformat(),
            text=text,
            dose_mg_per_L=dose,
            safety_score=safety,
            actions=actions,
            citations=[result["id"] for result in evidence],
        )
        self.record_store.append(recommendation)
        return recommendation

    @staticmethod
    def _compute_dose(telemetry: TelemetrySnapshot) -> float:
        target_residual = 0.8
        current = telemetry.residual_mg_L
        adjustment = max(target_residual - current, 0.0)
        base_dose = 1.5
        return round(base_dose + adjustment, 2)

    @staticmethod
    def _compute_safety_score(telemetry: TelemetrySnapshot, dose: float) -> float:
        turbidity_penalty = min(telemetry.turbidity_NTU / 10.0, 1.0)
        residual_penalty = abs(telemetry.residual_mg_L - 0.8) / 2.0
        dose_penalty = abs(dose - 1.5) / 3.0
        score = max(0.0, 1.0 - (turbidity_penalty + residual_penalty + dose_penalty))
        return round(score, 2)

    @staticmethod
    def _derive_actions(telemetry: TelemetrySnapshot, dose: float, safety: float) -> List[str]:
        actions = [
            f"Apply chlorine dose of {dose:.2f} mg/L to achieve target residual.",
            "Log adjustment in daily operations sheet.",
        ]
        if telemetry.turbidity_NTU > 5:
            actions.append("Investigate filtration – turbidity exceeds preferred threshold.")
        if safety < 0.5:
            actions.append("Flag for supervisor review due to low safety score.")
        return actions
