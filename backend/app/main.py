import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from silero_vad import load_silero_vad

from app.services import storage
from app.services import session_manager
from app.services import session_websocket
from app.services.websocket_handlers import build_websocket_endpoint

app = FastAPI(title="DiplomAI Real-Time Interpreter")

default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://sugam-samvad.vercel.app",
]

env_origins = os.getenv("ALLOWED_ORIGINS", "")
if env_origins:
    default_origins.extend([origin.strip() for origin in env_origins.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=default_origins,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


storage.initialize()

print("Loading Silero VAD model...")
VAD_MODEL = load_silero_vad(onnx=True)
print("✅ Silero VAD model loaded")


@app.get("/")
async def root():
    return {
        "message": "DiplomAI backend is running"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "vad": "silero",
    }


@app.post("/api/login")
async def login(payload: dict):
    email = (payload or {}).get("email", "").strip().lower()
    password = (payload or {}).get("password", "")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required.")

    user = storage.get_user_by_email(email)

    if user is None:
        raise HTTPException(status_code=401, detail="Account not found. Please sign up first.")

    if user["password"] != storage._hash_password(password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    updated_user = storage.authenticate_or_create_user(email, password)

    if updated_user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {
        "message": "Login successful",
        "user": updated_user,
    }


@app.post("/api/signup")
async def signup(payload: dict):
    name = (payload or {}).get("name", "").strip()
    email = (payload or {}).get("email", "").strip().lower()
    password = (payload or {}).get("password", "")

    if not name or not email or not password:
        raise HTTPException(status_code=400, detail="Name, email and password are required.")

    user = storage.create_user(name, email, password)

    if user is None:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    return {
        "message": "User created successfully",
        "user": user,
    }


@app.get("/api/sessions")
async def get_sessions(user_id: int | None = None):
    if user_id is None:
        raise HTTPException(status_code=400, detail="user_id is required.")

    sessions = storage.get_sessions_by_user(user_id)

    return {
        "sessions": sessions,
    }


@app.get("/api/sessions/{session_id}")
async def get_session_details(session_id: int, user_id: int | None = None):
    if user_id is None:
        raise HTTPException(status_code=400, detail="user_id is required.")

    session = storage.get_session(session_id, user_id)

    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    return session


# ========== MULTI-DEVICE INTERPRETATION SESSION ENDPOINTS ==========


@app.post("/api/interpretation-sessions")
async def create_interpretation_session(payload: dict):
    """Create a new multi-device interpretation session."""
    title = (payload or {}).get("title")
    description = (payload or {}).get("description")
    creator_user_id = (payload or {}).get("creator_user_id")

    try:
        session = session_manager.create_session(
            title=title,
            description=description,
            creator_user_id=creator_user_id,
        )
        return {
            "message": "Interpretation session created successfully",
            "session": session,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")


@app.post("/api/interpretation-sessions/{session_code}/join")
async def join_interpretation_session(session_code: str, payload: dict):
    """Join an existing interpretation session."""
    participant_name = (payload or {}).get("participant_name", "").strip()
    participant_language = (payload or {}).get("participant_language", "").strip()
    user_id = (payload or {}).get("user_id")

    if not participant_name or not participant_language:
        raise HTTPException(status_code=400, detail="Participant name and language are required.")

    result = session_manager.join_session(
        session_code=session_code,
        participant_name=participant_name,
        participant_language=participant_language,
        user_id=user_id,
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Session not found or is inactive.")

    return {
        "message": "Successfully joined session",
        "session": result["session"],
        "participant": result["participant"],
    }


@app.get("/api/interpretation-sessions/{session_code}")
async def get_interpretation_session(session_code: str):
    """Get interpretation session details."""
    session = storage.get_interpretation_session(session_code)

    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    return session


@app.get("/api/interpretation-sessions/{session_code}/participants")
async def get_session_participants(session_code: str):
    """Get all participants in a session."""
    session = storage.get_interpretation_session(session_code)

    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    participants = storage.get_session_participants(session["id"])

    return {
        "sessionCode": session_code,
        "participants": participants,
        "participantCount": len(participants),
    }


@app.get("/api/interpretation-sessions/{session_code}/summary")
async def get_session_summary(session_code: str):
    """Get session summary including participants and interpretations."""
    session = storage.get_interpretation_session(session_code)

    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    summary = session_manager.get_session_summary(session["id"])

    return summary


@app.get("/api/interpretation-sessions/{session_code}/transcript")
async def get_session_transcript(session_code: str):
    """Get formatted transcript of the entire session."""
    session = storage.get_interpretation_session(session_code)

    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    transcript = session_manager.export_session_transcript(session["id"])

    return {
        "sessionCode": session_code,
        "transcript": transcript,
    }


@app.post("/api/interpretation-sessions/{session_code}/close")
async def close_interpretation_session(session_code: str):
    """Close an interpretation session (mark as inactive)."""
    session = storage.get_interpretation_session(session_code)

    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    storage.deactivate_interpretation_session(session["id"])

    return {
        "message": "Session closed successfully",
        "sessionCode": session_code,
    }


# ========== MULTI-DEVICE INTERPRETATION SESSION WEBSOCKET ==========


@app.websocket("/ws/session/{session_code}/{participant_id}")
async def interpretation_session_websocket(
    websocket: WebSocket,
    session_code: str,
    participant_id: int,
):
    """
    WebSocket endpoint for multi-device interpretation sessions.
    Participants connect here with their session code and participant ID.
    """
    # Verify participant and session
    session = storage.get_interpretation_session(session_code)
    if session is None:
        await websocket.accept()
        await websocket.close(code=1008, reason="Session not found")
        return
    
    participant = None
    try:
        # Note: In a real implementation, you'd fetch the participant from DB
        # For now, we'll handle it in the session handler
        participants = storage.get_session_participants(session["id"])
        participant = next((p for p in participants if p["id"] == participant_id), None)
        
        if participant is None:
            await websocket.accept()
            await websocket.close(code=1008, reason="Participant not found")
            return
    except Exception:
        await websocket.accept()
        await websocket.close(code=1008, reason="Invalid participant")
        return
    
    participant_info = {
        "id": participant["id"],
        "name": participant["participantName"],
        "language": participant["participantLanguage"],
    }
    
    await session_websocket.handle_session_websocket(
        websocket=websocket,
        session_code=session_code,
        participant_id=participant_id,
        participant_info=participant_info,
        vad_model=VAD_MODEL,
    )


_ws_endpoint_handler = build_websocket_endpoint(VAD_MODEL)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await _ws_endpoint_handler(websocket)

