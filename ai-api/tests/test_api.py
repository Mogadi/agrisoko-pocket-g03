from app.schemas import AskResponse, HealthResponse, ModelInfoResponse


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = HealthResponse.model_validate(response.json())
    assert body.status == "ok"
    assert body.groupCode == "G03"
    assert body.memberCount == 6


def test_members_directory_hides_private_fields(client):
    response = client.get("/members")
    assert response.status_code == 200
    people = response.json()
    assert len(people) == 6
    assert people[0]["id"] == "mohammed-osama-hasan"
    assert "introductionDraft" not in people[0]
    assert "registrationNumber" not in people[0]


def test_member_by_id(client):
    response = client.get("/members/lazarus-simboya")
    assert response.status_code == 200
    body = response.json()
    assert body["fullName"].startswith("Lazarus")
    assert "evidenceLinks" in body


def test_member_404(client):
    response = client.get("/members/not-a-person")
    assert response.status_code == 404
    assert "No approved member found" in response.json()["detail"]


def test_ask_success_schema(client):
    response = client.post("/ask", json={"query": "Tell me about Nuzha"})
    assert response.status_code == 200
    body = AskResponse.model_validate(response.json())
    assert body.noMatch is False
    assert body.match is not None
    assert body.match.id == "nuzha-zainel-abdeen"
    assert body.introduction
    assert body.groupCode == "G03"
    assert body.modelVersion.startswith("tfidf")


def test_ask_no_match_schema(client):
    response = client.post("/ask", json={"query": "Who invented the airplane propeller?"})
    assert response.status_code == 200
    body = AskResponse.model_validate(response.json())
    assert body.noMatch is True
    assert body.match is None
    assert body.suggestions


def test_missing_question_rejected(client):
    response = client.post("/ask", json={"query": "   "})
    assert response.status_code == 422


def test_missing_body_rejected(client):
    response = client.post("/ask", json={})
    assert response.status_code == 422


def test_model_info(client):
    response = client.get("/model-info")
    assert response.status_code == 200
    body = ModelInfoResponse.model_validate(response.json())
    assert body.threshold == 0.45
    assert body.datasetFingerprint.startswith("sha256:")
    assert body.groupCode == "G03"
    assert len(body.limitations) >= 3
