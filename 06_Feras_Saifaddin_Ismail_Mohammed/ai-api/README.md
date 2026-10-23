# AgriSoko Pocket G03 — AI matching API

Python FastAPI service that answers "who built this?" from approved `data/members.json` records. It uses TF-IDF and cosine similarity. It does not call a generative API.

## Setup

```bash
cd ai-api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python build_index.py
pytest -q
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check: `GET http://127.0.0.1:8000/health`

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Status, version, group code |
| GET | `/members` | Safe directory fields |
| GET | `/members/{id}` | Full approved profile or 404 |
| POST | `/ask` | `{ "query": "..." }` matching result |
| GET | `/model-info` | Vectorizer, threshold, fingerprint, limitations |

## Matching rules

- Word n-grams (1–2) plus character n-grams (3–5)
- Cosine similarity
- Exact name or alias boost of +0.25, capped at 1.0
- Confidence threshold **0.45**
- Introductions copied from `introductionDraft` only
