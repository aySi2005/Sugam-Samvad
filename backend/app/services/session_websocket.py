"""
Multi-device WebSocket handler for interpretation sessions.
Handles participant connections, message routing, and session management.
"""

import asyncio
import json
import logging
from typing import Dict, Set
from datetime import datetime, timezone

from fastapi import WebSocket, WebSocketDisconnect

from app.services import storage
from app.services import session_manager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)

session_logger = logging.getLogger("diplomai.sessions")


# Global session manager to track active WebSocket connections per session
class SessionConnectionManager:
    """Manages WebSocket connections for multi-device interpretation sessions."""
    
    def __init__(self):
        # session_id -> {participant_id -> websocket}
        self.active_connections: Dict[int, Dict[int, WebSocket]] = {}
        # participant_id -> (session_id, participant_info)
        self.participant_map: Dict[int, tuple] = {}
    
    async def connect(
        self,
        session_id: int,
        participant_id: int,
        websocket: WebSocket,
        participant_info: dict,
    ):
        """Register a new participant connection."""
        await websocket.accept()
        
        if session_id not in self.active_connections:
            self.active_connections[session_id] = {}
        
        self.active_connections[session_id][participant_id] = websocket
        self.participant_map[participant_id] = (session_id, participant_info)
        
        session_logger.info(
            f"Participant {participant_info['name']} ({participant_info['language']}) "
            f"connected to session {session_id}"
        )
    
    def disconnect(self, participant_id: int):
        """Unregister a participant connection."""
        if participant_id in self.participant_map:
            session_id, participant_info = self.participant_map[participant_id]
            
            if session_id in self.active_connections:
                del self.active_connections[session_id][participant_id]
                
                # Clean up empty session
                if not self.active_connections[session_id]:
                    del self.active_connections[session_id]
            
            del self.participant_map[participant_id]
            
            session_logger.info(
                f"Participant {participant_info['name']} disconnected from session {session_id}"
            )
    
    async def broadcast_to_session(
        self,
        session_id: int,
        message: dict,
        exclude_participant: int | None = None,
    ):
        """Broadcast message to all participants in a session."""
        if session_id not in self.active_connections:
            return
        
        for participant_id, websocket in self.active_connections[session_id].items():
            if exclude_participant and participant_id == exclude_participant:
                continue
            
            try:
                await websocket.send_json(message)
            except Exception as e:
                session_logger.warning(f"Failed to send message to participant {participant_id}: {e}")
    
    LANGUAGE_CODE_NAME_MAP = {
        "en": "english",
        "hi": "hindi",
        "fr": "french",
        "ar": "arabic",
        "es": "spanish",
        "ru": "russian",
        "it": "italian",
        "ja": "japanese",
        "de": "german",
        "he": "hebrew",
        "english": "en",
        "hindi": "hi",
        "french": "fr",
        "arabic": "ar",
        "spanish": "es",
        "russian": "ru",
        "italian": "it",
        "japanese": "ja",
        "german": "de",
        "hebrew": "he",
    }

    @classmethod
    def languages_match(cls, lang1: str, lang2: str) -> bool:
        l1 = (lang1 or "").strip().lower()
        l2 = (lang2 or "").strip().lower()
        if l1 == l2:
            return True
        return cls.LANGUAGE_CODE_NAME_MAP.get(l1) == l2 or cls.LANGUAGE_CODE_NAME_MAP.get(l2) == l1

    async def send_to_participant_language(
        self,
        session_id: int,
        target_language: str,
        message: dict,
    ):
        """Send message only to participants with specific language preference."""
        if session_id not in self.active_connections:
            return
        
        participants = storage.get_session_participants(session_id)
        target_participants = [
            p for p in participants
            if self.languages_match(p.get("participantLanguage"), target_language)
        ]
        
        for participant in target_participants:
            participant_id = participant["id"]
            if participant_id in self.active_connections[session_id]:
                websocket = self.active_connections[session_id][participant_id]
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    session_logger.warning(f"Failed to send to participant {participant_id}: {e}")
    
    def get_session_participants(self, session_id: int) -> list[dict]:
        """Get all active participants in a session."""
        if session_id not in self.active_connections:
            return []
        
        participants = []
        for participant_id in self.active_connections[session_id].keys():
            if participant_id in self.participant_map:
                _, info = self.participant_map[participant_id]
                participants.append({
                    "id": participant_id,
                    **info,
                })
        
        return participants


# Global instance
connection_manager = SessionConnectionManager()


async def handle_session_websocket(
    websocket: WebSocket,
    session_code: str,
    participant_id: int,
    participant_info: dict,
    vad_model,
):
    """
    Handle WebSocket connection for a participant in an interpretation session.
    This is session-aware and coordinates with other participants.
    """
    # Get session
    session = storage.get_interpretation_session(session_code)
    if session is None:
        await websocket.accept()
        await websocket.close(code=1008, reason="Session not found")
        return
    
    session_id = session["id"]
    
    # Connect to session
    await connection_manager.connect(session_id, participant_id, websocket, participant_info)
    
    # Send welcome / connected state to this participant including room history
    try:
        existing_interpretations = storage.get_session_interpretations(session_id)
        await websocket.send_json({
            "type": "session_connected",
            "sessionId": session_id,
            "sessionCode": session_code,
            "sessionTitle": session.get("title") or "Diplomatic Session",
            "participant": participant_info,
            "activeParticipants": connection_manager.get_session_participants(session_id),
            "history": existing_interpretations,
        })
    except Exception as e:
        session_logger.warning(f"Failed to send initial session state: {e}")

    # Notify all participants that someone joined
    await connection_manager.broadcast_to_session(
        session_id,
        {
            "type": "participant_joined",
            "participant": {
                "id": participant_id,
                "name": participant_info["name"],
                "language": participant_info["language"],
            },
            "activeParticipants": connection_manager.get_session_participants(session_id),
        },
    )
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            
            # Handle different message types
            if message_type == "interpretation":
                # Participant has spoken and we have a transcription + translations
                transcript = message.get("transcript", "")
                translations = message.get("translations", {})
                risk_analysis = message.get("risk_analysis")
                source_language = message.get("sourceLanguage", participant_info.get("language", "auto"))
                
                # If speaker's own language isn't explicitly in translations, add it
                speaker_lang = participant_info.get("language", "en")
                if speaker_lang not in translations and transcript:
                    translations[speaker_lang] = transcript

                # Save to database
                interpretation_id = storage.save_interpretation(
                    interpretation_session_id=session_id,
                    participant_id=participant_id,
                    source_language=source_language,
                    transcript=transcript,
                    translations=translations,
                    risk_analysis=risk_analysis,
                )
                
                # Route translations to participants based on their language preference
                for target_language, translation_text in translations.items():
                    await connection_manager.send_to_participant_language(
                        session_id,
                        target_language,
                        {
                            "type": "interpretation_received",
                            "interpretationId": interpretation_id,
                            "from": {
                                "participantId": participant_id,
                                "participantName": participant_info["name"],
                                "sourceLanguage": source_language,
                            },
                            "originalTranscript": transcript,
                            "translation": translation_text,
                            "targetLanguage": target_language,
                            "riskAnalysis": risk_analysis,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        },
                    )

                # Send confirmation to sender
                await websocket.send_json({
                    "type": "interpretation_sent",
                    "interpretationId": interpretation_id,
                    "transcript": transcript,
                    "translations": translations,
                    "riskAnalysis": risk_analysis,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
                
            elif message_type == "keep_alive":
                # Respond to keep-alive ping
                await websocket.send_json({
                    "type": "keep_alive_response",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })

            elif message_type == "language_change":
                updated_participant = storage.update_participant_language(
                    participant_id,
                    message.get("language", ""),
                )
                if updated_participant is None:
                    continue

                participant_info["language"] = updated_participant["participantLanguage"]
                await connection_manager.broadcast_to_session(
                    session_id,
                    {
                        "type": "participant_updated",
                        "participant": updated_participant,
                        "activeParticipants": connection_manager.get_session_participants(session_id),
                    },
                )
            
            elif message_type == "status":
                # Broadcast participant status to others
                status = message.get("status")
                await connection_manager.broadcast_to_session(
                    session_id,
                    {
                        "type": "participant_status",
                        "participant": {
                            "id": participant_id,
                            "name": participant_info["name"],
                        },
                        "status": status,
                    },
                    exclude_participant=participant_id,
                )
    
    except WebSocketDisconnect:
        session_logger.info(f"WebSocket disconnect: participant {participant_id}")
    except Exception as e:
        session_logger.error(f"WebSocket error: {e}")
    finally:
        # Cleanup
        connection_manager.disconnect(participant_id)
        
        # Notify remaining participants
        await connection_manager.broadcast_to_session(
            session_id,
            {
                "type": "participant_left",
                "participant": {
                    "id": participant_id,
                    "name": participant_info["name"],
                },
                "activeParticipants": connection_manager.get_session_participants(session_id),
            },
        )
        
        # Check if session is empty and can be closed
        if not connection_manager.get_session_participants(session_id):
            session_logger.info(f"Session {session_id} is now empty")
