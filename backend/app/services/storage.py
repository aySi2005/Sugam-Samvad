from __future__ import annotations

from datetime import datetime, timezone
import hashlib
import json
import sqlite3
from pathlib import Path


DB_PATH = Path(__file__).resolve().parents[2] / "diplomai.db"


def _connect() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def initialize() -> None:
    with _connect() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                source_language TEXT NOT NULL,
                target_languages TEXT NOT NULL,
                user_id INTEGER
            );
            CREATE TABLE IF NOT EXISTS segments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                transcript TEXT NOT NULL,
                translations TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(session_id) REFERENCES sessions(id)
            );
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                created_at TEXT NOT NULL,
                last_login_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS interpretation_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_code TEXT NOT NULL UNIQUE,
                creator_user_id INTEGER,
                title TEXT,
                description TEXT,
                created_at TEXT NOT NULL,
                is_active INTEGER DEFAULT 1,
                FOREIGN KEY(creator_user_id) REFERENCES users(id)
            );
            CREATE TABLE IF NOT EXISTS participants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                interpretation_session_id INTEGER NOT NULL,
                participant_name TEXT NOT NULL,
                participant_language TEXT NOT NULL,
                user_id INTEGER,
                joined_at TEXT NOT NULL,
                socket_id TEXT,
                FOREIGN KEY(interpretation_session_id) REFERENCES interpretation_sessions(id),
                FOREIGN KEY(user_id) REFERENCES users(id)
            );
            CREATE TABLE IF NOT EXISTS interpretations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                interpretation_session_id INTEGER NOT NULL,
                participant_id INTEGER NOT NULL,
                source_language TEXT NOT NULL,
                transcript TEXT NOT NULL,
                translations TEXT NOT NULL,
                risk_analysis TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(interpretation_session_id) REFERENCES interpretation_sessions(id),
                FOREIGN KEY(participant_id) REFERENCES participants(id)
            );
            CREATE TABLE IF NOT EXISTS meeting_transcripts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                session_id INTEGER,
                title TEXT NOT NULL,
                description TEXT,
                source_language TEXT NOT NULL,
                target_languages TEXT NOT NULL,
                full_transcript TEXT NOT NULL,
                segments TEXT NOT NULL,
                duration_seconds INTEGER,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(session_id) REFERENCES sessions(id)
            );
            """
        )

        columns = [row["name"] for row in connection.execute("PRAGMA table_info(users)")]

        if "name" not in columns:
            connection.execute("ALTER TABLE users ADD COLUMN name TEXT")
        if "role" not in columns:
            connection.execute("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'")

        session_columns = [row["name"] for row in connection.execute("PRAGMA table_info(sessions)")]

        if "user_id" not in session_columns:
            connection.execute("ALTER TABLE sessions ADD COLUMN user_id INTEGER")

    _ensure_default_admin()


def _ensure_default_admin() -> None:
    admin_email = "admin@web.in"
    admin_name = "Master Admin"
    admin_password = "admin123"
    admin_hash = _hash_password(admin_password)
    now = datetime.now(timezone.utc).isoformat()

    with _connect() as connection:
        existing_user = connection.execute(
            "SELECT id, name, password, role FROM users WHERE email = ?",
            (admin_email,),
        ).fetchone()

        if existing_user is None:
            connection.execute(
                "INSERT INTO users (name, email, password, role, created_at, last_login_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (admin_name, admin_email, admin_hash, "admin", now, now, now),
            )
            return

        connection.execute(
            "UPDATE users SET name = ?, password = ?, role = ?, updated_at = ?, last_login_at = ? WHERE id = ?",
            (admin_name, admin_hash, "admin", now, now, existing_user["id"]),
        )


def create_session(source_language: str, target_languages: list[str], user_id: int | None = None) -> int:
    with _connect() as connection:
        cursor = connection.execute(
            "INSERT INTO sessions (created_at, source_language, target_languages, user_id) VALUES (?, ?, ?, ?)",
            (
                datetime.now(timezone.utc).isoformat(),
                source_language,
                json.dumps(target_languages),
                user_id,
            ),
        )
        return int(cursor.lastrowid)


def save_segment(session_id: int, transcript: str, translations: list[dict]) -> None:
    with _connect() as connection:
        connection.execute(
            "INSERT INTO segments (session_id, transcript, translations, created_at) VALUES (?, ?, ?, ?)",
            (session_id, transcript, json.dumps(translations, ensure_ascii=False), datetime.now(timezone.utc).isoformat()),
        )


def get_sessions_by_user(user_id: int) -> list[dict]:
    with _connect() as connection:
        rows = connection.execute(
            "SELECT * FROM sessions WHERE user_id = ? ORDER BY id DESC",
            (user_id,),
        ).fetchall()

    sessions = []

    for row in rows:
        sessions.append(
            {
                "id": row["id"],
                "createdAt": row["created_at"],
                "sourceLanguage": row["source_language"],
                "targetLanguages": json.loads(row["target_languages"]),
                "userId": row["user_id"],
                "segments": [],
            }
        )

    return sessions


def get_session(session_id: int, user_id: int | None = None) -> dict | None:
    with _connect() as connection:
        if user_id is None:
            session = connection.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
        else:
            session = connection.execute(
                "SELECT * FROM sessions WHERE id = ? AND user_id = ?",
                (session_id, user_id),
            ).fetchone()

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
        "userId": session["user_id"],
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


def get_user_by_email(email: str) -> dict | None:
    normalized_email = (email or "").strip().lower()

    if not normalized_email:
        return None

    with _connect() as connection:
        row = connection.execute(
            "SELECT id, name, email, password, role, created_at, last_login_at, updated_at FROM users WHERE email = ?",
            (normalized_email,),
        ).fetchone()

    if row is None:
        return None

    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "password": row["password"],
        "role": row["role"] or "user",
        "created_at": row["created_at"],
        "last_login_at": row["last_login_at"],
        "updated_at": row["updated_at"],
    }


def authenticate_or_create_user(email: str, password: str) -> dict | None:
    normalized_email = (email or "").strip().lower()
    password = password or ""

    if not normalized_email or not password:
        return None

    existing_user = get_user_by_email(normalized_email)
    now = datetime.now(timezone.utc).isoformat()

    if existing_user is None:
        hashed_password = _hash_password(password)

        with _connect() as connection:
            connection.execute(
                "INSERT INTO users (name, email, password, created_at, last_login_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                (None, normalized_email, hashed_password, now, now, now),
            )

        user = get_user_by_email(normalized_email)
        if user is None:
            return None

        return {
            "id": user["id"],
            "name": user.get("name"),
            "email": user["email"],
            "role": user.get("role", "user"),
            "created_at": user["created_at"],
            "last_login_at": user["last_login_at"],
        }

    if existing_user["password"] != _hash_password(password):
        return None

    with _connect() as connection:
        connection.execute(
            "UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?",
            (now, now, existing_user["id"]),
        )

    return {
        "id": existing_user["id"],
        "name": existing_user.get("name"),
        "email": existing_user["email"],
        "role": existing_user.get("role", "user"),
        "created_at": existing_user["created_at"],
        "last_login_at": now,
    }


def create_user(name: str, email: str, password: str) -> dict | None:
    normalized_email = (email or "").strip().lower()
    trimmed_name = (name or "").strip()
    password = password or ""

    if not trimmed_name or not normalized_email or not password:
        return None

    existing_user = get_user_by_email(normalized_email)

    if existing_user is not None:
        return None

    now = datetime.now(timezone.utc).isoformat()
    hashed_password = _hash_password(password)

    with _connect() as connection:
        cursor = connection.execute(
            "INSERT INTO users (name, email, password, created_at, last_login_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (trimmed_name, normalized_email, hashed_password, now, now, now),
        )

    created_user = get_user_by_email(normalized_email)

    if created_user is None:
        return None

    return {
        "id": created_user["id"],
        "name": created_user.get("name"),
        "email": created_user["email"],
        "role": created_user.get("role", "user"),
        "created_at": created_user["created_at"],
        "last_login_at": created_user["last_login_at"],
    }


# ========== MULTI-DEVICE INTERPRETATION SESSION FUNCTIONS ==========


def create_interpretation_session(
    session_code: str,
    creator_user_id: int | None = None,
    title: str | None = None,
    description: str | None = None,
) -> int:
    """Create a new multi-device interpretation session."""
    now = datetime.now(timezone.utc).isoformat()
    
    with _connect() as connection:
        cursor = connection.execute(
            """INSERT INTO interpretation_sessions 
               (session_code, creator_user_id, title, description, created_at, is_active)
               VALUES (?, ?, ?, ?, ?, 1)""",
            (session_code, creator_user_id, title, description, now),
        )
        return int(cursor.lastrowid)


def get_interpretation_session(session_code: str) -> dict | None:
    """Get interpretation session by code."""
    with _connect() as connection:
        session = connection.execute(
            "SELECT * FROM interpretation_sessions WHERE session_code = ?",
            (session_code,),
        ).fetchone()
        
        if session is None:
            return None
        
        return {
            "id": session["id"],
            "sessionCode": session["session_code"],
            "creatorUserId": session["creator_user_id"],
            "title": session["title"],
            "description": session["description"],
            "createdAt": session["created_at"],
            "isActive": bool(session["is_active"]),
        }


def add_participant(
    interpretation_session_id: int,
    participant_name: str,
    participant_language: str,
    user_id: int | None = None,
) -> dict:
    """Add a participant to an interpretation session."""
    now = datetime.now(timezone.utc).isoformat()
    
    with _connect() as connection:
        cursor = connection.execute(
            """INSERT INTO participants
               (interpretation_session_id, participant_name, participant_language, user_id, joined_at)
               VALUES (?, ?, ?, ?, ?)""",
            (interpretation_session_id, participant_name, participant_language, user_id, now),
        )
        participant_id = int(cursor.lastrowid)
        
        participant = connection.execute(
            "SELECT * FROM participants WHERE id = ?",
            (participant_id,),
        ).fetchone()
    
    return {
        "id": participant["id"],
        "interpretationSessionId": participant["interpretation_session_id"],
        "participantName": participant["participant_name"],
        "participantLanguage": participant["participant_language"],
        "userId": participant["user_id"],
        "joinedAt": participant["joined_at"],
        "socketId": participant["socket_id"],
    }


def get_session_participants(interpretation_session_id: int) -> list[dict]:
    """Get all participants in a session."""
    with _connect() as connection:
        participants = connection.execute(
            """SELECT * FROM participants 
               WHERE interpretation_session_id = ? 
               ORDER BY joined_at""",
            (interpretation_session_id,),
        ).fetchall()
    
    return [
        {
            "id": p["id"],
            "interpretationSessionId": p["interpretation_session_id"],
            "participantName": p["participant_name"],
            "participantLanguage": p["participant_language"],
            "userId": p["user_id"],
            "joinedAt": p["joined_at"],
            "socketId": p["socket_id"],
        }
        for p in participants
    ]


def save_interpretation(
    interpretation_session_id: int,
    participant_id: int,
    source_language: str,
    transcript: str,
    translations: dict,
    risk_analysis: dict | None = None,
) -> int:
    """Save an interpretation (transcription + translations + risk analysis)."""
    now = datetime.now(timezone.utc).isoformat()
    
    with _connect() as connection:
        cursor = connection.execute(
            """INSERT INTO interpretations
               (interpretation_session_id, participant_id, source_language, transcript, translations, risk_analysis, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                interpretation_session_id,
                participant_id,
                source_language,
                transcript,
                json.dumps(translations, ensure_ascii=False),
                json.dumps(risk_analysis, ensure_ascii=False) if risk_analysis else None,
                now,
            ),
        )
        return int(cursor.lastrowid)


def get_session_interpretations(interpretation_session_id: int) -> list[dict]:
    """Get all interpretations from a session."""
    with _connect() as connection:
        interpretations = connection.execute(
            """SELECT i.*, p.participant_name, p.participant_language
               FROM interpretations i
               JOIN participants p ON i.participant_id = p.id
               WHERE i.interpretation_session_id = ?
               ORDER BY i.created_at""",
            (interpretation_session_id,),
        ).fetchall()
    
    return [
        {
            "id": interp["id"],
            "interpretationSessionId": interp["interpretation_session_id"],
            "participantId": interp["participant_id"],
            "participantName": interp["participant_name"],
            "participantLanguage": interp["participant_language"],
            "sourceLanguage": interp["source_language"],
            "transcript": interp["transcript"],
            "translations": json.loads(interp["translations"]),
            "riskAnalysis": json.loads(interp["risk_analysis"]) if interp["risk_analysis"] else None,
            "createdAt": interp["created_at"],
        }
        for interp in interpretations
    ]


def update_participant_socket_id(participant_id: int, socket_id: str) -> None:
    """Update socket ID for a participant."""
    with _connect() as connection:
        connection.execute(
            "UPDATE participants SET socket_id = ? WHERE id = ?",
            (socket_id, participant_id),
        )


def update_participant_language(participant_id: int, language_code: str) -> dict | None:
    """Update a participant's preferred output language for the session."""
    normalized = (language_code or "").strip().lower()
    if not normalized:
        return None

    with _connect() as connection:
        participant = connection.execute(
            "SELECT * FROM participants WHERE id = ?",
            (participant_id,),
        ).fetchone()
        if participant is None:
            return None

        connection.execute(
            "UPDATE participants SET participant_language = ? WHERE id = ?",
            (normalized, participant_id),
        )

        refreshed = connection.execute(
            "SELECT * FROM participants WHERE id = ?",
            (participant_id,),
        ).fetchone()

    return {
        "id": refreshed["id"],
        "interpretationSessionId": refreshed["interpretation_session_id"],
        "participantName": refreshed["participant_name"],
        "participantLanguage": refreshed["participant_language"],
        "userId": refreshed["user_id"],
        "joinedAt": refreshed["joined_at"],
        "socketId": refreshed["socket_id"],
    }


def deactivate_interpretation_session(interpretation_session_id: int) -> None:
    """Mark a session as inactive."""
    with _connect() as connection:
        connection.execute(
            "UPDATE interpretation_sessions SET is_active = 0 WHERE id = ?",
            (interpretation_session_id,),
        )
