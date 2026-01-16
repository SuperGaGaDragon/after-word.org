from backend.storage.conversation import repo as conversation_repo
from backend.storage.user import repo as user_repo
from backend.storage.user_retrieve import repo as user_retrieve_repo
from backend.storage.work import repo as work_repo
from backend.storage.work_retrieve import repo as work_retrieve_repo


def test_user_repo_queries() -> None:
    created = user_repo.create_user("a@example.com", "alice", "hash")
    assert "INSERT INTO users" in created["sql"]
    assert created["params"]["email"] == "a@example.com"
    assert created["params"]["username"] == "alice"

    by_email = user_repo.get_user_by_email("b@example.com")
    assert "FROM users WHERE email" in by_email["sql"]
    assert by_email["params"]["email"] == "b@example.com"

    by_username = user_repo.get_user_by_username("bob")
    assert "FROM users WHERE username" in by_username["sql"]
    assert by_username["params"]["username"] == "bob"

    updated_pw = user_repo.update_password("c@example.com", "new-hash")
    assert "UPDATE users SET password_hash" in updated_pw["sql"]
    assert updated_pw["params"]["email"] == "c@example.com"
    assert updated_pw["params"]["password_hash"] == "new-hash"

    updated_name = user_repo.update_username("d@example.com", "newname")
    assert "UPDATE users SET username" in updated_name["sql"]
    assert updated_name["params"]["email"] == "d@example.com"
    assert updated_name["params"]["username"] == "newname"


def test_user_retrieve_contracts() -> None:
    query = user_retrieve_repo.list_users_basic()
    assert "ORDER BY created_at DESC" in query["sql"]
    assert query["params"] == {}


def test_work_repo_contracts() -> None:
    created = work_repo.create_work("owner@example.com")
    assert "INSERT INTO works" in created["sql"]
    assert created["params"]["user_email"] == "owner@example.com"

    updated = work_repo.update_work_content("work-1", "owner@example.com", "body")
    assert "UPDATE works SET content" in updated["sql"]
    assert updated["params"]["work_id"] == "work-1"
    assert updated["params"]["user_email"] == "owner@example.com"

    fetched = work_retrieve_repo.get_work("work-2", "reader@example.com")
    assert "WHERE id" in fetched["sql"]
    assert fetched["params"]["work_id"] == "work-2"
    assert fetched["params"]["user_email"] == "reader@example.com"

    listed = work_retrieve_repo.list_works("reader@example.com")
    assert "WHERE user_email" in listed["sql"]
    assert "ORDER BY updated_at DESC" in listed["sql"]
    assert listed["params"]["user_email"] == "reader@example.com"


def test_conversation_repo_contracts() -> None:
    created = conversation_repo.create_comment("work-1", "user@example.com", "hi")
    assert "INSERT INTO conversations" in created["sql"]
    assert "role, content" in created["sql"]
    assert created["params"]["work_id"] == "work-1"
    assert created["params"]["user_email"] == "user@example.com"

    listed = conversation_repo.list_comments("work-2", "user@example.com")
    assert "FROM conversations" in listed["sql"]
    assert "ORDER BY created_at ASC" in listed["sql"]
    assert listed["params"]["work_id"] == "work-2"
    assert listed["params"]["user_email"] == "user@example.com"
