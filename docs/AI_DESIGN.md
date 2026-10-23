# AI design — G03

**Owner:** Nuzha ZainEl-Abdeen Mohammed Ismail.

## Schema
See required keys in `ai-api/app/data_loader.py` and records in `ai-api/data/members.json`.

## Text
`app/textprep.py` lowercases, strips punctuation and keeps aliases. A member is never dropped because an optional field is empty.

## Vectorizer
`sklearn.pipeline.FeatureUnion` of word TF-IDF (1–2) and char_wb TF-IDF (3–5), `sublinear_tf=True`.

## Confidence
`min(1.0, cosine + name boost + content-term boost)`.

* Name boost is +0.30 when a normalised full name, alias, GitHub username or name token longer than two characters is contained in the query. A short nickname such as "Moj" has a cosine near 0.07, so +0.25 stayed under the 0.45 threshold.
* Content-term boost is +0.12 for each remaining query token that appears in the member's name, aliases, role, skills, feature or contribution. Stopwords such as "who" and "built" are ignored. The extra boost is capped at 0.45.

Long profiles were diluting cosine on short questions such as "Who is Ehab?". The recorded no-match queries still score below 0.20, so the threshold stays 0.45.

## Threshold
**0.45**, kept after the evaluation queries. A lower threshold was not required once the content-term boost was added.

## Grounding
`POST /ask` returns `introductionDraft` and `evidenceLinks` from the dataset. It cannot add a new metric, quote or URL.
