# Architecture — AgriSoko Pocket G03

```
Android APK (Expo / React Native)
        |  Axios, 8s timeout
        |  NetInfo + AsyncStorage
        v
FastAPI  GET /health /members /members/{id} /model-info
         POST /ask
        |
        v
TF-IDF FeatureUnion + cosine similarity
        |
        v
ai-api/data/members.json  (SHA-256 fingerprint)
```

Online path: validate text → POST /ask → show live result and cache it.  
Offline path: exact name, nickname or role against the bundled directory → label **Offline match**.  
Server failure: retry, keep last useful result, or fall back to offline exact lookup.

No generative API is required. The phone never stores secrets.
