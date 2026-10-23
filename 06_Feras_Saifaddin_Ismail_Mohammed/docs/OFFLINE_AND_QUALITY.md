# Offline behaviour and quality — G03

**Owner:** Lazarus Simboya Ira Inyasio

- Directory and last successful ask/profile are stored in AsyncStorage.
- `members.json` is bundled in `mobile/src/data/members.json` so a first launch works with no cache.
- Offline answers require an exact name, nickname or role. Feature questions wait for the network.
- Source badges: **Live match**, **Cached result**, **Offline match**.
- Axios timeout 8 seconds. Result screen Retry re-sends the same question.
- Last useful introduction is kept on the Result screen when the server fails.
- Device checks belong in `evidence/TEST_LOG.pdf` (two Android configurations minimum).
