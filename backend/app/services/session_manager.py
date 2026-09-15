"""
Session management for multi-device interpretation system.
Handles session creation, participant management, and QR code generation.
"""

import random
import string
import json
import os
from datetime import datetime, timezone
from pathlib import Path

import qrcode
from io import BytesIO
import base64

from app.services import storage


def generate_session_code(length: int = 6) -> str:
    """Generate a unique session code (e.g., SS-ABC123)."""
    chars = string.ascii_uppercase + string.digits
    code = ''.join(random.choices(chars, k=length))
    return f"SS-{code}"


def generate_qr_code(session_code: str) -> str:
    """
    Generate a QR code for a session and return as base64 data URL.
    QR code contains the session code.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(session_code)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    img_bytes = buffer.getvalue()
    img_base64 = base64.b64encode(img_bytes).decode()
    
    return f"data:image/png;base64,{img_base64}"


def create_session(
    title: str | None = None,
    description: str | None = None,
    creator_user_id: int | None = None,
) -> dict:
    """
    Create a new interpretation session.
    Returns session details with QR code.
    """
    # Generate unique session code
    session_code = generate_session_code()
    
    # Create session in database
    session_id = storage.create_interpretation_session(
        session_code=session_code,
        creator_user_id=creator_user_id,
        title=title,
        description=description,
    )
    
    # Generate QR code
    qr_code_data = generate_qr_code(session_code)
    
    return {
        "id": session_id,
        "sessionCode": session_code,
        "title": title,
        "description": description,
        "creatorUserId": creator_user_id,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "qrCode": qr_code_data,
        "joinUrl": (
            f"{os.getenv('FRONTEND_URL', 'https://sugam-samvad.vercel.app').rstrip('/')}/join/{session_code}"
        ),
    }


def join_session(
    session_code: str,
    participant_name: str,
    participant_language: str,
    user_id: int | None = None,
) -> dict | None:
    """
    Join an existing interpretation session as a participant.
    """
    # Get session
    session = storage.get_interpretation_session(session_code)
    
    if session is None:
        return None
    
    if not session["isActive"]:
        return None
    
    # Add participant
    participant = storage.add_participant(
        interpretation_session_id=session["id"],
        participant_name=participant_name,
        participant_language=participant_language,
        user_id=user_id,
    )
    
    return {
        "session": session,
        "participant": participant,
    }


def get_session_summary(interpretation_session_id: int) -> dict:
    """
    Get comprehensive session summary including participants and interpretations.
    """
    # Get participants
    participants = storage.get_session_participants(interpretation_session_id)
    
    # Get interpretations
    interpretations = storage.get_session_interpretations(interpretation_session_id)
    
    # Count by language
    language_counts = {}
    for interp in interpretations:
        lang = interp["participantLanguage"]
        language_counts[lang] = language_counts.get(lang, 0) + 1
    
    # Calculate risk metrics
    high_risk_count = 0
    for interp in interpretations:
        if interp["riskAnalysis"] and interp["riskAnalysis"].get("riskScore", 0) > 0.7:
            high_risk_count += 1
    
    return {
        "sessionId": interpretation_session_id,
        "participantCount": len(participants),
        "interpretationCount": len(interpretations),
        "languageCounts": language_counts,
        "highRiskCount": high_risk_count,
        "participants": participants,
        "interpretations": interpretations,
    }


def export_session_transcript(interpretation_session_id: int) -> str:
    """
    Export complete session transcript as formatted text.
    """
    interpretations = storage.get_session_interpretations(interpretation_session_id)
    
    lines = []
    lines.append("=" * 80)
    lines.append("INTERPRETATION SESSION TRANSCRIPT")
    lines.append("=" * 80)
    lines.append("")
    
    for interp in interpretations:
        lines.append(f"[{interp['createdAt']}] {interp['participantName']} ({interp['participantLanguage']})")
        lines.append(f"Original: {interp['transcript']}")
        
        for target_lang, translation in interp['translations'].items():
            lines.append(f"  → {target_lang}: {translation}")
        
        if interp["riskAnalysis"]:
            risk = interp["riskAnalysis"]
            lines.append(f"  ⚠ Risk Score: {risk.get('riskScore', 0):.2f}")
            if risk.get('flags'):
                lines.append(f"    Flags: {', '.join(risk['flags'])}")
        
        lines.append("")
    
    return "\n".join(lines)


def get_language_routing_map(interpretation_session_id: int) -> dict:
    """
    Get routing map for translations.
    Maps participant to their preferred language.
    """
    participants = storage.get_session_participants(interpretation_session_id)
    
    routing_map = {}
    for participant in participants:
        routing_map[participant["id"]] = {
            "name": participant["participantName"],
            "language": participant["participantLanguage"],
            "socketId": participant["socketId"],
        }
    
    return routing_map
