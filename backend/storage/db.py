from __future__ import annotations

from typing import Any, Dict, Optional

from backend.config import DATABASE_URL

try:  # pragma: no cover - import guarding depends on environment
    import psycopg
    from psycopg.rows import dict_row
except ImportError:  # pragma: no cover
    psycopg = None
    dict_row = None

try:  # pragma: no cover - import guarding depends on environment
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:  # pragma: no cover
    psycopg2 = None
    RealDictCursor = None

Query = Dict[str, Any]


def _fetch_result(cursor, sql: str) -> Any:
    if cursor.description is None:
        return None
    if "ORDER BY" in sql.upper():
        return cursor.fetchall()
    return cursor.fetchone()


def execute_query(query: Query) -> Optional[Any]:
    sql = query.get("sql")
    params = query.get("params") or {}
    if not sql:
        raise ValueError("query missing sql")

    if psycopg is not None:
        with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql, params)
                return _fetch_result(cursor, sql)

    if psycopg2 is not None:
        with psycopg2.connect(DATABASE_URL) as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(sql, params)
                result = _fetch_result(cursor, sql)
            conn.commit()
        return result

    raise RuntimeError("No PostgreSQL driver found. Install psycopg or psycopg2.")
