# API contract — G03

**Owner:** Ehab Fakhralden Mohamed Hamid

Base URL (local): `http://127.0.0.1:8000`  
Timeout from the phone: 8000 ms

## GET /health
`{ "status": "ok", "version": "1.0.0", "groupCode": "G03", "modelVersion": "tfidf-g03-1.0.0", "memberCount": 6 }`

## GET /members
Array of `{ id, fullName, aliases, githubUsername, role, skills, feature }`.

## GET /members/{id}
Full approved profile or `{ "detail": "No approved member found for id '…'." }` with 404.

## POST /ask
Request: `{ "query": "Who built offline mode?" }`  
Empty or whitespace-only query → 422.  
Success includes `match`, `confidence`, `reason`, `introduction`, `evidenceLinks`, `modelVersion`, `groupCode`, `noMatch`.

## GET /model-info
Vectorizer type, threshold, exact boost, SHA-256 fingerprint, limitations, build commit, evaluation summary.

## Fallback
If the phone cannot reach the server it uses bundled exact lookup and labels the source offline or cached.
