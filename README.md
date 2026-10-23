# AgriSoko Pocket G03

INES-Ruhengeri · Integrated Mobile and Artificial Intelligence · Group assignment 3

A standalone Android product that answers “who built this?” with an evidence-grounded member profile. The matcher is a small TF-IDF service. It does not invent biographies, metrics or testimonials

| Field | Value |
| --- | --- |
| Group code | **G03** |
| App name | AgriSoko Pocket G03 |
| Package | `rw.ines.agrisoko.pocket.g03` |
| Version | 1.0.0 |
| Verification code | `COMBO-G03-7014` |
| Repository | https://github.com/Mogadi/agrisoko-pocket-g03 |
| Release | https://github.com/Mogadi/agrisoko-pocket-g03/releases/tag/v1.0.0 |
| APK path | `build/AgriSokoPocket_G03.apk` |
| Final commit | Record after `v1.0.0` is tagged |

## Members and roles

Mohammed Osama Hasan is listed first as Product and GitHub lead.

| # | Name | Registration | Primary role | Review |
| ---: | --- | --- | --- | --- |
| 1 | Mohammed Osama Hasan | 25/27014 | Product and GitHub lead | Reviews mobile UI evidence |
| 2 | Nuzha ZainEl-Abdeen Mohammed Ismail | 25/27419 | AI and data engineer | Reviews API tests and no-match safety |
| 3 | Ehab Fakhralden Mohamed Hamid | 25/27950 | API and integration engineer | Reviews mobile networking |
| 4 | Mojtaba Abdalitieef Ahmed | 25/27660 | Mobile UI and navigation engineer | Reviews UI/UX evidence |
| 5 | Lazarus Simboya Ira Inyasio | 25/28180 | Offline and quality engineer | Reviews AI query evaluation |
| 6 | Feras Saifaddin Ismail Mohammed | 25/27916 | Release and evidence engineer | Reviews repository traceability |

GitHub owner: `Mogadi`. Other `githubUsername` values in `ai-api/data/members.json` are placeholders until each member writes their real username.

## Product purpose

Potato cooperatives, employers and innovation partners in Musanze can ask about any group member by name, nickname, role, skill or feature. The app returns the best matching approved profile, a confidence score, the reason, and links to GitHub evidence. Offline, exact name, nickname and role lookup still works and is labelled as an offline match.

## Architecture

See `docs/ARCHITECTURE.md`. React Native (Expo, TypeScript) talks to FastAPI. FastAPI runs scikit-learn TF-IDF over `ai-api/data/members.json`. A SHA-256 fingerprint of that file is published at `GET /model-info`.

## Setup and run

### AI service

```bash
cd ai-api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python build_index.py
pytest -q
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

On a physical phone, replace `127.0.0.1` with the computer’s LAN address in the About screen.

### Mobile app

```bash
cd mobile
npm install
npx expo start
```

API URL is configurable on the About screen and stored in AsyncStorage. Default: `http://127.0.0.1:8000`. Timeout: 8 seconds. No credentials are hard-coded.

### Android APK (EAS)

```bash
cd mobile
npx eas-cli login
npx eas-cli init    # once; paste the project id into app.json extra.eas.projectId
npx eas-cli build -p android --profile preview
```

Copy the downloaded artifact to `build/AgriSokoPocket_G03.apk`. Attach it to GitHub Release `v1.0.0`.

## Matching rules

- Document per member: name, aliases, role, skills, feature, problem, contribution, evidence summary
- Vectorizer: word n-grams (1–2) + character n-grams (3–5)
- Metric: cosine similarity
- Exact name or alias boost: +0.30
- Content-term boost: +0.12 per approved token in the name, role, skills, feature or contribution, capped at 0.45
- Confidence threshold: **0.45**
- Introduction text is copied from `introductionDraft`

## Tested devices

Complete the rows in `evidence/TEST_LOG.pdf` when the APK is installed. Automated API and matching tests run with `pytest` in `ai-api/tests/`.

## Evidence files

| File | Location |
| --- | --- |
| Technical report | `docs/COMBO_A3_G03_REPORT.pdf` |
| Demo video | `evidence/COMBO_A3_G03_DEMO.mp4` |
| Contributions | `evidence/CONTRIBUTIONS.pdf` |
| Test log | `evidence/TEST_LOG.pdf` |
| Feedback | `evidence/FEEDBACK.pdf` |
| AI use | `evidence/AI_USE.md` |
| Demo script | `evidence/DEMO_SCRIPT.md` |

## Known limitations

- The matcher only repeats approved dataset fields.
- Offline mode does not run TF-IDF; it only does exact name, nickname and role lookup.
- GitHub issue, pull request and commit URLs become live after each member pushes.
- The APK binary is produced by EAS; it is not committed from a laptop without that build.
- External tester names are recorded only with consent in `FEEDBACK.pdf`. They are not invented.

## License

Academic submission for INES-Ruhengeri, 2026. Not an open-source product licence.
