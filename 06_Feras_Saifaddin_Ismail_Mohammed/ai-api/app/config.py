"""Runtime configuration. No secrets are stored in the APK or repository.

Owned by: Ehab Fakhralden Mohamed Hamid (API and integration engineer)
"""

from __future__ import annotations

import os
from pathlib import Path

from .matching import DEFAULT_THRESHOLD, MODEL_VERSION
from . import GROUP_CODE

ROOT = Path(__file__).resolve().parents[1]


def env(name: str, default: str) -> str:
    value = os.getenv(name)
    return default if value is None or value.strip() == "" else value.strip()


GROUP_CODE_VALUE = env("AGRISOKO_GROUP_CODE", GROUP_CODE)
MODEL_VERSION_VALUE = env("AGRISOKO_MODEL_VERSION", MODEL_VERSION)
THRESHOLD = float(env("AGRISOKO_THRESHOLD", str(DEFAULT_THRESHOLD)))
MEMBERS_PATH = Path(env("AGRISOKO_MEMBERS_PATH", str(ROOT / "data" / "members.json")))
METADATA_PATH = Path(env("AGRISOKO_METADATA_PATH", str(ROOT / "models" / "index_meta.json")))
GIT_COMMIT = env("GIT_COMMIT", "unreleased")
LOG_LEVEL = env("LOG_LEVEL", "INFO")
API_TITLE = "AgriSoko Pocket G03 Matching API"
API_VERSION = "1.0.0"
