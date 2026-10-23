"""Load and fingerprint the approved member dataset.

Owned by: Nuzha ZainEl-Abdeen Mohammed Ismail (AI and data engineer)
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

REQUIRED_KEYS = (
    "id",
    "fullName",
    "registrationNumber",
    "aliases",
    "githubUsername",
    "role",
    "skills",
    "targetUser",
    "problem",
    "contribution",
    "feature",
    "outcomeMetric",
    "evidenceLinks",
    "testerFeedback",
    "introductionDraft",
)

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MEMBERS_PATH = ROOT / "data" / "members.json"


class DatasetError(ValueError):
    pass


def canonical_bytes(payload: Any) -> bytes:
    return json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode(
        "utf-8"
    )


def fingerprint_payload(payload: Any) -> str:
    return hashlib.sha256(canonical_bytes(payload)).hexdigest()


def validate_member(member: dict[str, Any], index: int) -> None:
    missing = [key for key in REQUIRED_KEYS if key not in member]
    if missing:
        raise DatasetError(f"Member at index {index} is missing keys: {', '.join(missing)}")
    if not str(member.get("fullName", "")).strip():
        raise DatasetError(f"Member at index {index} has an empty fullName.")
    if not str(member.get("id", "")).strip():
        raise DatasetError(f"Member at index {index} has an empty id.")
    if not isinstance(member.get("aliases"), list):
        raise DatasetError(f"Member {member.get('id')} aliases must be a list.")
    if not isinstance(member.get("skills"), list):
        raise DatasetError(f"Member {member.get('id')} skills must be a list.")
    if not isinstance(member.get("evidenceLinks"), dict):
        raise DatasetError(f"Member {member.get('id')} evidenceLinks must be an object.")


def load_dataset(path: Path | None = None) -> dict[str, Any]:
    members_path = path or DEFAULT_MEMBERS_PATH
    if not members_path.exists():
        raise DatasetError(f"members.json not found at {members_path}")
    payload = json.loads(members_path.read_text(encoding="utf-8"))
    members = payload.get("members")
    if not isinstance(members, list):
        raise DatasetError("members.json must contain a members array.")
    ids: set[str] = set()
    for index, member in enumerate(members):
        if not isinstance(member, dict):
            raise DatasetError(f"Member at index {index} must be an object.")
        validate_member(member, index)
        member_id = member["id"]
        if member_id in ids:
            raise DatasetError(f"Duplicate member id '{member_id}'.")
        ids.add(member_id)
    payload["_path"] = str(members_path)
    payload["_fingerprint"] = fingerprint_payload(
        {k: v for k, v in payload.items() if not str(k).startswith("_")}
    )
    return payload


def public_directory_fields(member: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": member["id"],
        "fullName": member["fullName"],
        "aliases": member.get("aliases", []),
        "githubUsername": member.get("githubUsername"),
        "role": member["role"],
        "skills": member.get("skills", []),
        "feature": member.get("feature"),
    }


SAFE_PROFILE_KEYS = REQUIRED_KEYS


def approved_profile(member: dict[str, Any]) -> dict[str, Any]:
    return {key: member.get(key) for key in SAFE_PROFILE_KEYS}
