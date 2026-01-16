from backend.errors import BusinessError
from backend.modules.auth import change, check, login, signup
from backend.modules.auth import passwords


def _make_executor(store):
    def executor(query):
        sql = query["sql"]
        params = query["params"]
        if "INSERT INTO users" in sql:
            user_id = f"user-{len(store)}"
            store[params["email"]] = {
                "id": user_id,
                "email": params["email"],
                "username": params["username"],
                "password_hash": params["password_hash"],
            }
            return {"id": user_id}
        if "FROM users WHERE email" in sql:
            return store.get(params["email"])
        if "FROM users WHERE username" in sql:
            for user in store.values():
                if user["username"] == params["username"]:
                    return user
            return None
        if "UPDATE users SET password_hash" in sql:
            user = store.get(params["email"])
            if user:
                user["password_hash"] = params["password_hash"]
            return {"ok": True}
        if "UPDATE users SET username" in sql:
            user = store.get(params["email"])
            if user:
                user["username"] = params["username"]
            return {"ok": True}
        return None

    return executor


def _setup(store):
    executor = _make_executor(store)
    check.set_query_executor(executor)
    signup.set_query_executor(executor)
    login.set_query_executor(executor)
    change.set_query_executor(executor)
    return executor


def test_signup_and_login():
    store = {}
    _setup(store)
    user = signup.signup("a@b.com", "usera", "secret")
    assert user["email"] == "a@b.com"
    logged = login.login("usera", "secret")
    assert logged["username"] == "usera"


def test_signup_rejects_duplicates():
    store = {}
    _setup(store)
    signup.signup("a@b.com", "usera", "secret")
    try:
        signup.signup("a@b.com", "userb", "secret")
    except BusinessError as exc:
        assert exc.code == "email_taken"
    else:
        raise AssertionError("expected email_taken")


def test_change_username_and_password():
    store = {}
    _setup(store)
    signup.signup("a@b.com", "usera", "secret")
    change.change_username("a@b.com", "userb")
    assert store["a@b.com"]["username"] == "userb"
    change.change_password("a@b.com", "secret", "newpass", "newpass")
    assert passwords.verify_password("newpass", store["a@b.com"]["password_hash"])
