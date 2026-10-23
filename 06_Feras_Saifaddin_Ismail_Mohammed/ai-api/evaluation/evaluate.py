"""Run the recorded query suite and report accuracy.

Owned by: Nuzha ZainEl-Abdeen Mohammed Ismail (AI and data engineer)
"""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path
from typing import Any

import pandas as pd

from app.matching import MemberMatcher


def run_evaluation(matcher: MemberMatcher, queries_path: Path) -> dict[str, Any]:
    payload = json.loads(queries_path.read_text(encoding="utf-8"))
    member_queries = payload["memberQueries"]
    no_match_queries = payload["noMatchQueries"]

    rows: list[dict[str, Any]] = []
    confusion: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))

    member_correct = 0
    for item in member_queries:
        result = matcher.ask(item["query"])
        predicted = result.member["id"] if result.member else "NO_MATCH"
        expected = item["expectedId"]
        ok = predicted == expected and not result.no_match
        if ok:
            member_correct += 1
        confusion[expected][predicted] += 1
        rows.append(
            {
                "id": item["id"],
                "kind": item["kind"],
                "query": item["query"],
                "expectedId": expected,
                "predictedId": predicted,
                "confidence": result.confidence,
                "correct": ok,
                "reason": result.reason,
            }
        )

    no_match_correct = 0
    for item in no_match_queries:
        result = matcher.ask(item["query"])
        predicted = result.member["id"] if result.member else "NO_MATCH"
        ok = result.no_match is True
        if ok:
            no_match_correct += 1
        confusion["NO_MATCH"][predicted] += 1
        rows.append(
            {
                "id": item["id"],
                "kind": item["kind"],
                "query": item["query"],
                "expectedId": None,
                "predictedId": predicted,
                "confidence": result.confidence,
                "correct": ok,
                "reason": result.reason,
            }
        )

    member_total = len(member_queries)
    no_match_total = len(no_match_queries)
    errors = [row for row in rows if not row["correct"]]

    table = pd.DataFrame(rows)
    confusion_frame = (
        pd.crosstab(table["expectedId"].fillna("NO_MATCH"), table["predictedId"], dropna=False)
        if not table.empty
        else pd.DataFrame()
    )

    return {
        "threshold": matcher.threshold,
        "memberQueryCount": member_total,
        "noMatchQueryCount": no_match_total,
        "top1Accuracy": round(member_correct / member_total, 4) if member_total else 0.0,
        "noMatchRejectionAccuracy": (
            round(no_match_correct / no_match_total, 4) if no_match_total else 0.0
        ),
        "confusion": {src: dict(dst) for src, dst in confusion.items()},
        "confusionTable": confusion_frame.to_dict(),
        "errors": errors,
        "rows": rows,
    }
