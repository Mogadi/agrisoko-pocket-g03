import json

from app.data_loader import fingerprint_payload, load_dataset, DatasetError
from app.matching import MemberMatcher
import pytest


def test_fingerprint_is_stable(dataset):
    payload = {k: v for k, v in dataset.items() if not str(k).startswith("_")}
    first = fingerprint_payload(payload)
    second = fingerprint_payload(payload)
    assert first == second
    assert len(first) == 64


def test_load_rejects_duplicate_ids(tmp_path, dataset):
    payload = {k: v for k, v in dataset.items() if not str(k).startswith("_")}
    payload["members"] = payload["members"] + [payload["members"][0]]
    path = tmp_path / "members.json"
    path.write_text(json.dumps(payload), encoding="utf-8")
    with pytest.raises(DatasetError, match="Duplicate"):
        load_dataset(path)


def test_empty_dataset_matcher():
    matcher = MemberMatcher([], threshold=0.45)
    result = matcher.ask("Osama")
    assert result.member is None
    assert result.no_match is True
