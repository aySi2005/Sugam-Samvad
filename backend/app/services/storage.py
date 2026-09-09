from __future__ import annotations

from datetime import datetime, timezone
import json
import sqlite3
from pathlib import Path


DB_PATH = Path(__file__).resolve().parents[2] / "diplomai.db"


def _connect() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize() -> None:
    with _connect() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                source_language TEXT NOT NULL,
                target_languages TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS segments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                transcript TEXT NOT NULL,
                translations TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(session_id) REFERENCES sessions(id)
            );
            """
        )


def create_session(source_language: str, target_languages: list[str]) -> int:
    with _connect() as connection:
        cursor = connection.execute(
            "INSERT INTO sessions (created_at, source_language, target_languages) VALUES (?, ?, ?)",
            (datetime.now(timezone.utc).isoformat(), source_language, json.dumps(target_languages)),
        )
        return int(cursor.lastrowid)


def save_segment(session_id: int, transcript: str, translations: list[dict]) -> None:
    with _connect() as connection:
        connection.execute(
            "INSERT INTO segments (session_id, transcript, translations, created_at) VALUES (?, ?, ?, ?)",
            (session_id, transcript, json.dumps(translations, ensure_ascii=False), datetime.now(timezone.utc).isoformat()),
        )


def get_session(session_id: int) -> dict | None:
    with _connect() as connection:
        session = connection.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
        if session is None:
            return None
        segments = connection.execute(
            "SELECT id, transcript, translations, created_at FROM segments WHERE session_id = ? ORDER BY id",
            (session_id,),
        ).fetchall()
    return {
        "id": session["id"],
        "createdAt": session["created_at"],
        "sourceLanguage": session["source_language"],
        "targetLanguages": json.loads(session["target_languages"]),
        "segments": [
            {
                "id": segment["id"],
                "transcript": segment["transcript"],
                "translations": json.loads(segment["translations"]),
                "createdAt": segment["created_at"],
            }
            for segment in segments
        ],
    }
