"""
Session Service for managing chat sessions and their lifecycle
"""

import logging
import asyncio
from typing import Dict, Optional
from datetime import datetime, timedelta
import uuid

from models.chat_models import ChatSession, SessionStatus

logger = logging.getLogger(__name__)


class SessionService:
    def __init__(self):
        """Initialize session service"""
        self.sessions: Dict[str, ChatSession] = {}
        self.cleanup_interval = 3600  # 1 hour in seconds
        self.session_timeout = 24 * 3600  # 24 hours in seconds

    def is_available(self) -> bool:
        """Check if session service is available"""
        return True

    async def create_session(self, filename: str, xml_content: bytes) -> str:
        """Create a new chat session"""
        session_id = str(uuid.uuid4())
        
        session = ChatSession(
            id=session_id,
            status=SessionStatus.ACTIVE,
            created_at=datetime.now(),
            last_activity=datetime.now(),
            filename=filename,
            xml_content=xml_content.decode('utf-8') if xml_content else None,
            metadata={
                "file_size": len(xml_content) if xml_content else 0,
                "created_by": "user"
            }
        )
        
        self.sessions[session_id] = session
        logger.info(f"Created session {session_id} for file {filename}")
        
        return session_id

    async def get_session(self, session_id: str) -> Optional[ChatSession]:
        """Get session by ID"""
        session = self.sessions.get(session_id)
        
        if session and self._is_session_expired(session):
            await self.delete_session(session_id)
            return None
            
        return session

    async def update_activity(self, session_id: str) -> bool:
        """Update session last activity"""
        if session_id in self.sessions:
            self.sessions[session_id].last_activity = datetime.now()
            return True
        return False

    async def delete_session(self, session_id: str) -> bool:
        """Delete a session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            logger.info(f"Deleted session {session_id}")
            return True
        return False

    async def get_active_session_count(self) -> int:
        """Get count of active sessions"""
        active_count = 0
        for session in self.sessions.values():
            if not self._is_session_expired(session):
                active_count += 1
        return active_count

    async def get_total_session_count(self) -> int:
        """Get total session count"""
        return len(self.sessions)

    def _is_session_expired(self, session: ChatSession) -> bool:
        """Check if session is expired"""
        expiry_time = session.last_activity + timedelta(seconds=self.session_timeout)
        return datetime.now() > expiry_time

    async def periodic_cleanup(self):
        """Periodic cleanup of expired sessions"""
        while True:
            try:
                await asyncio.sleep(self.cleanup_interval)
                await self._cleanup_expired_sessions()
            except asyncio.CancelledError:
                logger.info("Session cleanup task cancelled")
                break
            except Exception as e:
                logger.error(f"Error in session cleanup: {str(e)}")

    async def _cleanup_expired_sessions(self):
        """Clean up expired sessions"""
        expired_sessions = []
        
        for session_id, session in self.sessions.items():
            if self._is_session_expired(session):
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            await self.delete_session(session_id)
        
        if expired_sessions:
            logger.info(f"Cleaned up {len(expired_sessions)} expired sessions")

    async def update_session_status(self, session_id: str, status: SessionStatus) -> bool:
        """Update session status"""
        if session_id in self.sessions:
            self.sessions[session_id].status = status
            self.sessions[session_id].last_activity = datetime.now()
            return True
        return False
