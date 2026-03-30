"""
db.py - SQLite database setup and helpers for the emission factors scraper.
"""

import sqlite3
from datetime import datetime

DB_PATH = "emission_factors.db"


def get_connection():
    return sqlite3.connect(DB_PATH)


def init_db():
    """Create tables if they don't exist."""
    conn = get_connection()
    cur = conn.cursor()

    cur.executescript("""
        CREATE TABLE IF NOT EXISTS categories (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            cc_id           INTEGER UNIQUE NOT NULL,
            name            TEXT NOT NULL,
            level1          TEXT,
            level2          TEXT
        );

        CREATE TABLE IF NOT EXISTS coefficients (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            cc_id               INTEGER NOT NULL,
            name                TEXT,
            production_area     TEXT,
            value               TEXT,
            value_numeric       REAL,
            unit                TEXT,
            announcement_year   INTEGER,
            scraped_at          TEXT,
            FOREIGN KEY (cc_id) REFERENCES categories(cc_id)
        );

        CREATE INDEX IF NOT EXISTS idx_coefficients_cc_id ON coefficients(cc_id);
    """)

    conn.commit()
    conn.close()
    print(f"[DB] Initialized database: {DB_PATH}")


def upsert_category(cc_id: int, name: str, level1: str, level2: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO categories (cc_id, name, level1, level2)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(cc_id) DO UPDATE SET
            name   = excluded.name,
            level1 = excluded.level1,
            level2 = excluded.level2
    """, (cc_id, name, level1, level2))
    conn.commit()
    conn.close()


def insert_coefficients(cc_id: int, rows: list[dict]):
    """Insert a batch of coefficient rows for a given cc_id."""
    if not rows:
        return
    conn = get_connection()
    cur = conn.cursor()
    now = datetime.now().isoformat()
    cur.executemany("""
        INSERT INTO coefficients
            (cc_id, name, production_area, value, value_numeric, unit, announcement_year, scraped_at)
        VALUES
            (:cc_id, :name, :production_area, :value, :value_numeric, :unit, :announcement_year, :scraped_at)
    """, [{**r, "cc_id": cc_id, "scraped_at": now} for r in rows])
    conn.commit()
    conn.close()


def category_already_scraped(cc_id: int) -> bool:
    """Return True if we already have coefficient records for this cc_id."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM coefficients WHERE cc_id = ?", (cc_id,))
    count = cur.fetchone()[0]
    conn.close()
    return count > 0
