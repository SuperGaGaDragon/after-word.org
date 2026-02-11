#!/usr/bin/env python3
"""
Database migration runner
Usage: python run_migration.py <migration_file.sql>
"""

import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir.parent))

from backend.config import DATABASE_URL

try:
    import psycopg
except ImportError:
    psycopg = None

try:
    import psycopg2
except ImportError:
    psycopg2 = None


def run_migration(sql_file: Path) -> None:
    """Execute SQL migration file"""
    if not sql_file.exists():
        raise FileNotFoundError(f"Migration file not found: {sql_file}")

    sql_content = sql_file.read_text()
    print(f"Running migration: {sql_file.name}")
    print(f"SQL content length: {len(sql_content)} chars")

    if psycopg is not None:
        print("Using psycopg driver")
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql_content)
                conn.commit()
        print("✓ Migration completed successfully (psycopg)")
        return

    if psycopg2 is not None:
        print("Using psycopg2 driver")
        conn = psycopg2.connect(DATABASE_URL)
        try:
            cursor = conn.cursor()
            cursor.execute(sql_content)
            conn.commit()
            cursor.close()
            print("✓ Migration completed successfully (psycopg2)")
        finally:
            conn.close()
        return

    raise RuntimeError("No PostgreSQL driver found. Install psycopg or psycopg2.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python run_migration.py <migration_file.sql>")
        sys.exit(1)

    migration_file = Path(__file__).parent / sys.argv[1]
    try:
        run_migration(migration_file)
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        sys.exit(1)
