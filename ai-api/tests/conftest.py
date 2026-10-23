from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.data_loader import load_dataset  # noqa: E402
from app.main import app, bootstrap  # noqa: E402
from app.matching import MemberMatcher  # noqa: E402


@pytest.fixture(scope="session")
def dataset():
    return load_dataset(ROOT / "data" / "members.json")


@pytest.fixture(scope="session")
def members(dataset):
    return dataset["members"]


@pytest.fixture(scope="session")
def matcher(members):
    return MemberMatcher(members, threshold=0.45)


@pytest.fixture
def client(members):
    bootstrap(ROOT / "data" / "members.json")
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def sample_member(members):
    return copy.deepcopy(members[0])


@pytest.fixture
def members_json_path(tmp_path, dataset):
    path = tmp_path / "members.json"
    payload = {k: v for k, v in dataset.items() if not str(k).startswith("_")}
    path.write_text(json.dumps(payload), encoding="utf-8")
    return path
