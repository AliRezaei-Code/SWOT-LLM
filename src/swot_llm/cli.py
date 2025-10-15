"""Command line interface for the Water Quality Technical Assistant."""

from __future__ import annotations

from pathlib import Path
from typing import Optional

import click

from .knowledge_base import KnowledgeBase
from .recommendation import RecommendationEngine, RecordStore


@click.group()
def main() -> None:
    """Entry point for the swot-llm command line interface."""


def _get_engine(record_path: Optional[Path] = None) -> RecommendationEngine:
    kb = KnowledgeBase()
    record_store = RecordStore(record_path) if record_path is not None else None
    return RecommendationEngine(kb, record_store=record_store)


@main.command()
@click.option("--template", "template_name", required=True, help="Template name to use.")
@click.option("--topic", required=True, help="Grant or project topic.")
def internal(template_name: str, topic: str) -> None:
    """Generate LaTeX-ready content for internal workflows."""

    engine = _get_engine()
    sections = engine.generate_internal(template_name, topic)
    for section in sections:
        print("=" * 60)
        print(section)


@main.command()
@click.option("--site", required=True, help="Site identifier to use.")
@click.option(
    "--record-store",
    type=click.Path(path_type=Path),
    default=Path("records/recommendations.jsonl"),
    help="Path to the JSONL record store.",
)
def external(site: str, record_store: Path) -> None:
    """Generate operational advice for a site."""

    engine = _get_engine(record_store)
    recommendation = engine.generate_external(site)
    print(recommendation.text)


@main.command(name="daily-run")
@click.option("--site", required=True, help="Site identifier to process.")
def daily_run(site: str) -> None:
    """Simulate the automated daily run."""

    engine = _get_engine()
    recommendation = engine.generate_external(site)
    print(f"Generated recommendation for {recommendation.site_id} at {recommendation.generated_at}")
    print("Actions:")
    for action in recommendation.actions:
        print(f"  - {action}")


if __name__ == "__main__":
    main()
