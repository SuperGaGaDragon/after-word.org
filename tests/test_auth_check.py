from backend.modules.auth import check


def test_check_email_and_username() -> None:
    taken_emails = {"taken@example.com"}
    taken_usernames = {"taken_user"}

    def executor(query):
        params = query.get("params", {})
        email = params.get("email")
        username = params.get("username")
        if email in taken_emails:
            return {"email": email}
        if username in taken_usernames:
            return {"username": username}
        return None

    check.set_query_executor(executor)

    assert check.is_email_taken("taken@example.com") is True
    assert check.is_email_taken("free@example.com") is False
    assert check.is_username_taken("taken_user") is True
    assert check.is_username_taken("free_user") is False

    check.set_query_executor(lambda query: None)
