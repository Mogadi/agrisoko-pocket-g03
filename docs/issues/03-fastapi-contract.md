# Issue 3 — FastAPI contract

**Owner:** Ehab Fakhralden Mohamed Hamid (25/27950)  
**Branch:** `feature/fastapi-contract`  
**Module:** ai-api  
**Reviewer:** Lazarus Simboya Ira Inyasio

## Acceptance criteria
- `GET /health`, `/members`, `/members/{id}`, `/model-info` and `POST /ask` match the assignment contract.
- Empty questions return 422. Unknown ids return 404.
- Responses never invent fields that are not in the approved dataset.
- Dockerfile can run the service on port 8000.
