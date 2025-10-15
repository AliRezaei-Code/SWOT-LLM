"""Water Quality Technical Assistant reference implementation."""

from .knowledge_base import Document, Template, KnowledgeBase
from .telemetry import TelemetrySnapshot
from .recommendation import RecommendationEngine, Recommendation

__all__ = [
    "Document",
    "Template",
    "KnowledgeBase",
    "TelemetrySnapshot",
    "RecommendationEngine",
    "Recommendation",
]
