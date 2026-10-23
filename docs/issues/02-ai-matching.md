# Issue 2 — AI matching engine

**Owner:** Nuzha ZainEl-Abdeen Mohammed Ismail (25/27419)  
**Branch:** `feature/tfidf-matching`  
**Module:** ai-api  
**Reviewer:** Ehab Fakhralden Mohamed Hamid

## Acceptance criteria
- `members.json` validates required keys and keeps a member if an optional field is empty.
- TF-IDF word + char features, cosine similarity, documented +0.25 name/alias boost.
- Threshold 0.45 unless evaluation justifies a change.
- At least three queries per member and five no-match queries, with accuracy reported by `build_index.py`.
