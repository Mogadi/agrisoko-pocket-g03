#!/usr/bin/env python3
"""Validate members.json, build the TF-IDF index metadata and write the fingerprint.

Owned by: Nuzha ZainEl-Abdeen Mohammed Ismail (AI and data engineer)

Usage:
    python build_index.py
    python build_index.py --members data/members.json --out models
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from app.data_loader import DatasetError, load_dataset  # noqa: E402
from app.matching import (  # noqa: E402
    DEFAULT_THRESHOLD,
    EXACT_BOOST,
    MODEL_VERSION,
    VECTORIZER_DESCRIPTION,
    MemberMatcher,
    member_document,
)
from evaluation.evaluate import run_evaluation  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Build AgriSoko G03 matching index metadata.")
    parser.add_argument("--members", type=Path, default=ROOT / "data" / "members.json")
    parser.add_argument("--out", type=Path, default=ROOT / "models")
    parser.add_argument("--threshold", type=float, default=DEFAULT_THRESHOLD)
    args = parser.parse_args()

    try:
        dataset = load_dataset(args.members)
    except DatasetError as exc:
        print(f"VALIDATION FAILED: {exc}", file=sys.stderr)
        return 1

    members = dataset["members"]
    matcher = MemberMatcher(members, threshold=args.threshold)
    documents = [member_document(m) for m in members]

    args.out.mkdir(parents=True, exist_ok=True)
    evaluation = run_evaluation(matcher, ROOT / "evaluation" / "queries.json")

    meta = {
        "groupCode": dataset.get("groupCode", "G03"),
        "verificationCode": dataset.get("verificationCode"),
        "datasetVersion": dataset.get("datasetVersion"),
        "modelVersion": MODEL_VERSION,
        "vectorizerType": VECTORIZER_DESCRIPTION,
        "threshold": args.threshold,
        "exactBoost": EXACT_BOOST,
        "memberCount": len(members),
        "memberIds": [m["id"] for m in members],
        "datasetFingerprint": f"sha256:{dataset['_fingerprint']}",
        "builtAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "documentCharCounts": {m["id"]: len(doc) for m, doc in zip(members, documents)},
        "limitations": [
            "Returns only approved members.json fields.",
            "Does not invent biographies, metrics, links or testimonials.",
            f"Queries scoring below {args.threshold} are rejected as no-match.",
        ],
        "evaluationSummary": {
            "top1Accuracy": evaluation["top1Accuracy"],
            "noMatchRejectionAccuracy": evaluation["noMatchRejectionAccuracy"],
            "memberQueryCount": evaluation["memberQueryCount"],
            "noMatchQueryCount": evaluation["noMatchQueryCount"],
        },
    }

    meta_path = args.out / "index_meta.json"
    eval_path = args.out / "evaluation.json"
    fp_path = args.out / "fingerprint.txt"

    meta_path.write_text(json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    eval_path.write_text(json.dumps(evaluation, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    fp_path.write_text(dataset["_fingerprint"] + "\n", encoding="utf-8")

    print(f"Validated {len(members)} members.")
    print(f"Fingerprint sha256:{dataset['_fingerprint']}")
    print(f"Top-1 accuracy: {evaluation['top1Accuracy']}")
    print(f"No-match rejection accuracy: {evaluation['noMatchRejectionAccuracy']}")
    print(f"Wrote {meta_path}")
    print(f"Wrote {eval_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
