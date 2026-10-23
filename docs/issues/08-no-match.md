# Issue 8 — No-match safety

**Owner:** Nuzha ZainEl-Abdeen Mohammed Ismail  
**Branch:** `feature/tfidf-matching`  
**Module:** ai-api

## Acceptance criteria
- Confidence below 0.45 returns no match, suggestions, and no invented profile.
- Vague, unrelated and gibberish queries are covered in `evaluation/queries.json`.
