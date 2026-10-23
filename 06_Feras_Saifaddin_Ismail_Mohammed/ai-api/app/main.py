"""FastAPI service for AgriSoko Pocket G03.

Owned by: Ehab Fakhralden Mohamed Hamid (API and integration engineer)
"""

from __future__ import annotations

import json
import logging
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import (
    API_TITLE,
    API_VERSION,
    GIT_COMMIT,
    GROUP_CODE_VALUE,
    LOG_LEVEL,
    MEMBERS_PATH,
    METADATA_PATH,
    MODEL_VERSION_VALUE,
    THRESHOLD,
)
from .data_loader import DatasetError, approved_profile, load_dataset, public_directory_fields
from .matching import EXACT_BOOST, MODEL_VERSION, VECTORIZER_DESCRIPTION, MemberMatcher
from .schemas import AskRequest, AskResponse, HealthResponse, MemberProfile, ModelInfoResponse

logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("agrisoko.api")

LIMITATIONS = [
    "The matcher only returns fields stored in the approved members.json file.",
    "It does not call an external generative API and will not invent metrics, quotes or links.",
    "Questions below the 0.45 confidence threshold return no match, even if a weak cosine score exists.",
    "Offline phones use exact name, nickname and role lookup, not the TF-IDF index.",
    "GitHub evidence URLs are accurate only after each member pushes the named branch, issue and pull request.",
]


def _load_evaluation() -> dict[str, Any] | None:
    path = MEMBERS_PATH.parent.parent / "models" / "evaluation.json"
    if not path.exists():
        alt = METADATA_PATH.parent / "evaluation.json"
        path = alt
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


class AppState:
    dataset: dict[str, Any] | None = None
    members: list[dict[str, Any]]
    matcher: MemberMatcher | None = None
    fingerprint: str = ""
    by_id: dict[str, dict[str, Any]]

    def __init__(self) -> None:
        self.members = []
        self.by_id = {}


state = AppState()


def bootstrap(members_path=None) -> None:
    dataset = load_dataset(members_path or MEMBERS_PATH)
    state.dataset = dataset
    state.members = dataset["members"]
    state.fingerprint = dataset["_fingerprint"]
    state.matcher = MemberMatcher(state.members, threshold=THRESHOLD)
    state.by_id = {m["id"]: m for m in state.members}
    logger.info(
        "Loaded %s members fingerprint=%s threshold=%s",
        len(state.members),
        state.fingerprint[:12],
        THRESHOLD,
    )


@asynccontextmanager
async def lifespan(_app: FastAPI):
    try:
        bootstrap()
    except DatasetError as exc:
        logger.error("Failed to load members.json: %s", exc)
        raise
    yield


app = FastAPI(title=API_TITLE, version=API_VERSION, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    response = await call_next(request)
    logger.info("%s %s -> %s", request.method, request.url.path, response.status_code)
    return response


@app.exception_handler(DatasetError)
async def dataset_error_handler(_request: Request, exc: DatasetError):
    return JSONResponse(status_code=500, content={"detail": str(exc)})


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        version=API_VERSION,
        groupCode=GROUP_CODE_VALUE,
        modelVersion=MODEL_VERSION_VALUE or MODEL_VERSION,
        memberCount=len(getattr(state, "members", []) or []),
    )


@app.get("/members", response_model=list)
def list_members():
    return [public_directory_fields(m) for m in state.members]


@app.get("/members/{member_id}", response_model=MemberProfile)
def get_member(member_id: str):
    member = state.by_id.get(member_id)
    if not member:
        raise HTTPException(
            status_code=404,
            detail=f"No approved member found for id '{member_id}'.",
        )
    return approved_profile(member)


@app.post("/ask", response_model=AskResponse)
def ask(body: AskRequest) -> AskResponse:
    result = state.matcher.ask(body.query)
    match_payload = approved_profile(result.member) if result.member else None
    evidence = result.member.get("evidenceLinks") if result.member else None
    return AskResponse(
        query=body.query,
        groupCode=GROUP_CODE_VALUE,
        modelVersion=MODEL_VERSION,
        match=match_payload,
        confidence=result.confidence,
        reason=result.reason,
        matchedTerms=result.matched_terms,
        introduction=result.introduction,
        evidenceLinks=evidence,
        noMatch=result.no_match,
        suggestions=result.suggestions,
        threshold=state.matcher.threshold,
        boostApplied=result.boost_applied,
    )


@app.get("/model-info", response_model=ModelInfoResponse)
def model_info() -> ModelInfoResponse:
    return ModelInfoResponse(
        vectorizerType=VECTORIZER_DESCRIPTION,
        threshold=THRESHOLD,
        exactBoost=EXACT_BOOST,
        datasetFingerprint=f"sha256:{state.fingerprint}",
        memberCount=len(state.members),
        modelVersion=MODEL_VERSION,
        groupCode=GROUP_CODE_VALUE,
        limitations=LIMITATIONS,
        buildCommit=GIT_COMMIT,
        evaluation=_load_evaluation(),
    )
