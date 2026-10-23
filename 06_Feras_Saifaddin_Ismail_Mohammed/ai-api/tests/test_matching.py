from app.matching import MemberMatcher, member_document


def test_exact_name_query(matcher):
    result = matcher.ask("Tell me about Mohammed Osama Hasan")
    assert result.no_match is False
    assert result.member["id"] == "mohammed-osama-hasan"
    assert result.confidence >= 0.45
    assert result.boost_applied is True
    assert "Mohammed" in result.introduction


def test_alias_query(matcher):
    result = matcher.ask("Who is Moj?")
    assert result.member["id"] == "mojtaba-abdalitieef"
    assert result.boost_applied is True


def test_role_query(matcher):
    result = matcher.ask("Who is the AI and data engineer?")
    assert result.member["id"] == "nuzha-zainel-abdeen"
    assert result.confidence >= 0.45


def test_feature_query(matcher):
    result = matcher.ask("Who built offline mode and AsyncStorage cache?")
    assert result.member["id"] == "lazarus-simboya"
    assert result.no_match is False


def test_no_match_unrelated(matcher):
    result = matcher.ask("What is the weather in Kigali today?")
    assert result.no_match is True
    assert result.member is None
    assert result.confidence < 0.45 or result.introduction is None
    assert result.suggestions


def test_empty_dataset_returns_no_match():
    empty = MemberMatcher([], threshold=0.45)
    result = empty.ask("Tell me about Nuzha")
    assert result.no_match is True
    assert result.member is None
    assert "empty" in result.reason.lower()


def test_missing_question(matcher):
    result = matcher.ask("   ")
    assert result.no_match is True
    assert result.confidence == 0.0
    assert result.member is None


def test_does_not_invent_fields(matcher, members):
    result = matcher.ask("Tell me about Ehab")
    assert result.member is not None
    approved_ids = {m["id"] for m in members}
    assert result.member["id"] in approved_ids
    assert result.introduction == result.member["introductionDraft"]


def test_member_document_keeps_member_with_empty_optional():
    member = {
        "fullName": "Test Person",
        "aliases": ["Tester"],
        "role": "Tester",
        "skills": [],
        "feature": "",
        "problem": "x",
        "contribution": "y",
        "outcomeMetric": "",
        "introductionDraft": "My name is Test.",
        "githubUsername": "",
        "targetUser": "",
        "testerFeedback": "",
    }
    doc = member_document(member)
    assert "test person" in doc
    assert "tester" in doc
