"""Deterministic TF-IDF member matcher.

Owned by: Nuzha ZainEl-Abdeen Mohammed Ismail (AI and data engineer)

Rules
-----
* One document per member from approved profile fields only.
* Vectorizer: FeatureUnion of word (1-2) and character-within-word (3-5) TF-IDF.
* Similarity: cosine.
* Exact name/alias boost: +0.30 when a normalised name, alias, GitHub username
  or name token longer than two characters is a substring of the query.
* Content-term boost: +0.12 for each query token (length > 2, not a stopword)
  that appears in the member's name, aliases, role, skills, feature or
  contribution. This boost is capped at 0.45. It exists because a long
  profile dilutes cosine on short name and feature questions. Recorded
  no-match queries stay below 0.20, so the 0.45 threshold is unchanged.
* Confidence is min(1.0, cosine + name boost + content-term boost).
* Introductions are copied from introductionDraft. Nothing is invented.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.pipeline import FeatureUnion

from .textprep import member_document, name_keys, normalize

__all__ = [
    "DEFAULT_THRESHOLD",
    "EXACT_BOOST",
    "MODEL_VERSION",
    "VECTORIZER_DESCRIPTION",
    "MemberMatcher",
    "MatchResult",
    "member_document",
    "build_vectorizer",
]

DEFAULT_THRESHOLD = 0.45
EXACT_BOOST = 0.30
TERM_BOOST = 0.12
TERM_BOOST_CAP = 0.45
MODEL_VERSION = "tfidf-g03-1.0.0"
GROUP_CODE = "G03"
STOPWORDS = frozenset(
    "who is the a an of and to for me about tell what how do i my with in on "
    "built made build builds was were this that you your from into".split()
)

VECTORIZER_DESCRIPTION = (
    "TF-IDF FeatureUnion: word ngrams (1-2) + char_wb ngrams (3-5), "
    "sublinear_tf, L2 cosine similarity, exact name/alias boost +0.30, "
    "content-term boost +0.12 per approved token (cap 0.45), threshold 0.45"
)


def build_vectorizer() -> FeatureUnion:
    word = TfidfVectorizer(
        analyzer="word",
        ngram_range=(1, 2),
        min_df=1,
        sublinear_tf=True,
        norm="l2",
    )
    char = TfidfVectorizer(
        analyzer="char_wb",
        ngram_range=(3, 5),
        min_df=1,
        sublinear_tf=True,
        norm="l2",
    )
    return FeatureUnion([("word", word), ("char", char)])


def matched_terms(query: str, document: str, limit: int = 8) -> list[str]:
    q_tokens = [t for t in normalize(query).split() if len(t) > 1]
    d_set = set(document.split())
    overlap = [t for t in q_tokens if t in d_set]
    # unique, preserve query order
    seen: set[str] = set()
    ordered: list[str] = []
    for token in overlap:
        if token not in seen:
            seen.add(token)
            ordered.append(token)
    return ordered[:limit]


def focus_tokens(member: dict[str, Any]) -> set[str]:
    parts = [
        member.get("fullName"),
        member.get("role"),
        member.get("feature"),
        member.get("contribution"),
        " ".join(str(item) for item in member.get("aliases") or []),
        " ".join(str(item) for item in member.get("skills") or []),
    ]
    tokens = normalize(" ".join(str(part or "") for part in parts)).split()
    return {token for token in tokens if len(token) > 2 and token not in STOPWORDS}


def apply_term_boost(query: str, member: dict[str, Any]) -> tuple[float, list[str]]:
    """Boost approved profile words that cosine similarity under-weights."""
    query_tokens = [
        token
        for token in normalize(query).split()
        if len(token) > 2 and token not in STOPWORDS
    ]
    seen: set[str] = set()
    hits: list[str] = []
    known = focus_tokens(member)
    for token in query_tokens:
        if token in known and token not in seen:
            seen.add(token)
            hits.append(token)
    return min(TERM_BOOST_CAP, TERM_BOOST * len(hits)), hits


def apply_exact_boost(query: str, member: dict[str, Any]) -> tuple[float, str | None]:
    q = normalize(query)
    if not q:
        return 0.0, None
    for key in name_keys(member):
        if key and key in q:
            return EXACT_BOOST, key
    return 0.0, None


@dataclass
class MatchResult:
    member: dict[str, Any] | None
    confidence: float
    reason: str
    matched_terms: list[str] = field(default_factory=list)
    boost_applied: bool = False
    introduction: str | None = None
    no_match: bool = True
    suggestions: list[str] = field(default_factory=list)
    model_version: str = MODEL_VERSION
    group_code: str = GROUP_CODE
    raw_cosine: float = 0.0


class MemberMatcher:
    def __init__(
        self,
        members: list[dict[str, Any]],
        threshold: float = DEFAULT_THRESHOLD,
    ) -> None:
        self.members = list(members)
        self.threshold = threshold
        self.documents = [member_document(m) for m in self.members]
        self.vectorizer = build_vectorizer()
        self.matrix = None
        if self.members:
            self.matrix = self.vectorizer.fit_transform(self.documents)

    def suggest(self) -> list[str]:
        names = [m.get("fullName", "") for m in self.members]
        roles = [m.get("role", "") for m in self.members]
        features = [m.get("feature", "") for m in self.members]
        sample = [x for x in names + roles[:2] + features[:2] if x]
        return sample[:8]

    def ask(self, query: str) -> MatchResult:
        suggestions = self.suggest()
        cleaned = (query or "").strip()
        if not cleaned:
            return MatchResult(
                member=None,
                confidence=0.0,
                reason="No question was provided. Try a member name, role or feature.",
                suggestions=suggestions,
            )
        if not self.members or self.matrix is None:
            return MatchResult(
                member=None,
                confidence=0.0,
                reason="The approved member dataset is empty.",
                suggestions=[],
            )

        query_vec = self.vectorizer.transform([normalize(cleaned)])
        cosine = cosine_similarity(query_vec, self.matrix).flatten()

        scored: list[tuple[int, float, float, str | None, list[str]]] = []
        for index, raw in enumerate(cosine):
            name_boost, boost_key = apply_exact_boost(cleaned, self.members[index])
            term_boost, term_hits = apply_term_boost(cleaned, self.members[index])
            confidence = min(1.0, float(raw) + name_boost + term_boost)
            scored.append((index, confidence, float(raw), boost_key, term_hits))

        scored.sort(key=lambda row: row[1], reverse=True)
        best_index, confidence, raw, boost_key, term_hits = scored[0]
        terms = matched_terms(cleaned, self.documents[best_index])
        member = self.members[best_index]

        if confidence < self.threshold:
            return MatchResult(
                member=None,
                confidence=round(confidence, 4),
                raw_cosine=round(raw, 4),
                reason=(
                    "No confident match was found. "
                    "Ask for a member name, nickname, role, skill or feature."
                ),
                matched_terms=terms,
                suggestions=suggestions,
                no_match=True,
            )

        reason_parts = []
        if terms:
            reason_parts.append("Matched terms: " + ", ".join(terms))
        if boost_key:
            reason_parts.append(f"Exact name/alias boost applied for '{boost_key}'.")
        if term_hits:
            reason_parts.append("Content-term boost for: " + ", ".join(term_hits) + ".")
        reason_parts.append(f"Cosine similarity {raw:.3f}; confidence {confidence:.3f}.")

        return MatchResult(
            member=member,
            confidence=round(confidence, 4),
            raw_cosine=round(raw, 4),
            reason=" ".join(reason_parts),
            matched_terms=terms,
            boost_applied=bool(boost_key or term_hits),
            introduction=member.get("introductionDraft"),
            no_match=False,
            suggestions=[],
        )
