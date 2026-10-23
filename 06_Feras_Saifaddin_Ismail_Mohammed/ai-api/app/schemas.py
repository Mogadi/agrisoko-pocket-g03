"""Pydantic request and response models. The API never adds unapproved biography fields.

Owned by: Ehab Fakhralden Mohamed Hamid (API and integration engineer)
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field, field_validator


class AskRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=300)

    @field_validator("query")
    @classmethod
    def strip_query(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Question cannot be empty or whitespace.")
        return cleaned


class EvidenceLinks(BaseModel):
    repository: str | None = None
    issue: str | None = None
    branch: str | None = None
    pullRequest: str | None = None
    commit: str | None = None


class DirectoryMember(BaseModel):
    id: str
    fullName: str
    aliases: list[str] = []
    githubUsername: str | None = None
    role: str
    skills: list[str] = []
    feature: str | None = None


class MemberProfile(DirectoryMember):
    registrationNumber: str
    targetUser: str
    problem: str
    contribution: str
    outcomeMetric: str
    evidenceLinks: dict[str, Any]
    testerFeedback: str
    introductionDraft: str


class HealthResponse(BaseModel):
    status: str
    version: str
    groupCode: str
    modelVersion: str
    memberCount: int


class AskResponse(BaseModel):
    query: str
    groupCode: str
    modelVersion: str
    match: MemberProfile | None = None
    confidence: float
    reason: str
    matchedTerms: list[str] = []
    introduction: str | None = None
    evidenceLinks: dict[str, Any] | None = None
    noMatch: bool
    suggestions: list[str] = []
    threshold: float
    boostApplied: bool = False


class ModelInfoResponse(BaseModel):
    vectorizerType: str
    threshold: float
    exactBoost: float
    datasetFingerprint: str
    memberCount: int
    modelVersion: str
    groupCode: str
    limitations: list[str]
    buildCommit: str
    evaluation: dict[str, Any] | None = None
