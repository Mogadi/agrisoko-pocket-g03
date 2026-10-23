"""Consistent text normalisation for indexing and queries.

Owned by: Nuzha ZainEl-Abdeen Mohammed Ismail (AI and data engineer)
"""

from __future__ import annotations

import re
from typing import Any, Iterable

WHITESPACE_RE = re.compile(r"\s+")
NON_TOKEN_RE = re.compile(r"[^a-z0-9+/.\-]+")

SEARCH_FIELDS = (
    "fullName",
    "aliases",
    "githubUsername",
    "role",
    "skills",
    "targetUser",
    "problem",
    "contribution",
    "feature",
    "outcomeMetric",
    "testerFeedback",
    "introductionDraft",
)


def normalize(text: str | None) -> str:
    if not text:
        return ""
    lowered = text.lower().replace("'", " ")
    cleaned = NON_TOKEN_RE.sub(" ", lowered)
    return WHITESPACE_RE.sub(" ", cleaned).strip()


def _stringify(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [value]
    if isinstance(value, dict):
        return [str(v) for v in value.values() if v]
    if isinstance(value, Iterable) and not isinstance(value, (bytes, bytearray)):
        parts: list[str] = []
        for item in value:
            parts.extend(_stringify(item))
        return parts
    return [str(value)]


def member_document(member: dict[str, Any]) -> str:
    """Build one searchable document. Empty optional fields are skipped, never drop the member."""
    chunks: list[str] = []
    for field in SEARCH_FIELDS:
        chunks.extend(_stringify(member.get(field)))
    return normalize(" ".join(chunks))


def name_keys(member: dict[str, Any]) -> list[str]:
    keys = [normalize(member.get("fullName"))]
    for alias in member.get("aliases") or []:
        keys.append(normalize(str(alias)))
    for token in normalize(member.get("fullName")).split():
        if len(token) > 2:
            keys.append(token)
    github = normalize(member.get("githubUsername"))
    if github:
        keys.append(github)
    # unique, keep order
    seen: set[str] = set()
    ordered: list[str] = []
    for key in keys:
        if key and key not in seen:
            seen.add(key)
            ordered.append(key)
    return ordered
