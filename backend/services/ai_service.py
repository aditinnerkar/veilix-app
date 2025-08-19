"""
AI Service for processing chat messages and integrating with OpenAI
"""

import os
import logging
from typing import Optional, Dict, Any
from openai import OpenAI
from datetime import datetime

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self):
        """Initialize AI service with OpenAI client"""
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = None
        self.sessions = {}  # Session storage for conversation history
        
        if self.api_key:
            try:
                self.client = OpenAI(api_key=self.api_key)
                logger.info("✅ OpenAI client initialized successfully")
            except Exception as e:
                logger.error(f"❌ Failed to initialize OpenAI client: {str(e)}")
                self.client = None
        else:
            logger.warning("⚠️  No OpenAI API key found, using mock responses")

    def is_available(self) -> bool:
        """Check if AI service is available"""
        return self.client is not None

    def get_status(self) -> Dict[str, Any]:
        """Get service status"""
        return {
            "available": self.is_available(),
            "api_key_configured": bool(self.api_key),
            "active_sessions": len(self.sessions)
        }

    async def process_message(self, session_id: str, message: str, xml_content: Optional[str] = None) -> str:
        """Process a chat message with context"""
        try:
            # Initialize session if not exists
            if session_id not in self.sessions:
                self.sessions[session_id] = {
                    "messages": [],
                    "xml_content": xml_content,
                    "created_at": datetime.now()
                }

            # Add user message to session
            self.sessions[session_id]["messages"].append({
                "role": "user",
                "content": message,
                "timestamp": datetime.now()
            })

            # Generate response
            if self.client:
                response = await self._call_openai_with_session(session_id, message, xml_content)
            else:
                response = self._generate_mock_response(message, xml_content)

            # Add AI response to session
            self.sessions[session_id]["messages"].append({
                "role": "assistant", 
                "content": response,
                "timestamp": datetime.now()
            })

            return response

        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            return f"I apologize, but I encountered an error processing your request: {str(e)}"

    async def _call_openai_with_session(self, session_id: str, message: str, xml_content: Optional[str] = None) -> str:
        """Call OpenAI API with session context"""
        try:
            session = self.sessions.get(session_id, {})
            messages = []

            # System prompt with DEXPI context
            system_prompt = """You are an expert AI assistant specializing in Process & Instrumentation Diagrams (P&ID) and DEXPI XML analysis. 
            
            You help engineers and operators understand P&ID diagrams by:
            - Analyzing DEXPI XML structure and components
            - Explaining process flow and equipment relationships
            - Identifying potential issues or optimization opportunities
            - Providing technical insights about process engineering
            
            Always provide clear, technical, and actionable responses. If a DEXPI XML file has been uploaded, reference its specific components and structure in your analysis."""

            if xml_content:
                system_prompt += f"\n\nCurrent DEXPI XML Context:\n```xml\n{xml_content[:2000]}...\n```"

            messages.append({"role": "system", "content": system_prompt})

            # Add conversation history (last 10 messages to manage token usage)
            recent_messages = session.get("messages", [])[-10:]
            for msg in recent_messages:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

            # Call OpenAI
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                max_tokens=1000,
                temperature=0.7
            )

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return self._generate_mock_response(message, xml_content)

    def _generate_mock_response(self, message: str, xml_content: Optional[str] = None) -> str:
        """Generate mock response when OpenAI is not available"""
        if xml_content:
            if "component" in message.lower():
                return "🔧 **Component Analysis** (Mock Response)\n\nI can see your DEXPI XML file contains various process components. Here's what I found:\n\n• **Pumps**: Several centrifugal pumps for fluid transfer\n• **Valves**: Control and isolation valves throughout the system\n• **Vessels**: Process vessels and tanks for storage/reaction\n• **Instruments**: Temperature, pressure, and flow measurements\n\nFor detailed analysis, please ensure OpenAI API is configured."

            elif "flow" in message.lower():
                return "🌊 **Process Flow Analysis** (Mock Response)\n\nBased on your P&ID:\n\n• **Main Process Flow**: Raw materials → Reaction vessel → Separation → Product\n• **Utilities**: Steam, cooling water, and compressed air systems\n• **Control Loops**: Temperature and pressure control systems\n• **Safety**: Emergency shutdown valves and relief systems\n\nThis appears to be a typical chemical process configuration."

            else:
                return "📋 **P&ID Analysis** (Mock Response)\n\nI can see you've uploaded a DEXPI XML file. I can help you analyze:\n\n• Process components and their relationships\n• Flow paths and control systems\n• Equipment specifications\n• Safety and instrumentation details\n\nPlease ask specific questions about components, flows, or any particular aspect you'd like me to analyze."
        else:
            return "👋 Hello! I'm your P&ID analysis assistant. Upload a DEXPI XML file and I'll help you analyze:\n\n• Process components\n• Flow diagrams\n• Control systems\n• Equipment relationships\n\nWhat would you like to know about your process diagram?"

    def get_session_history(self, session_id: str) -> list:
        """Get conversation history for a session"""
        return self.sessions.get(session_id, {}).get("messages", [])

    def clear_session(self, session_id: str) -> bool:
        """Clear session data"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False
