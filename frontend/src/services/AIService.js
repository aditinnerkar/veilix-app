/**
 * AI Service Module
 * Now connects to FastAPI Backend instead of direct OpenAI calls
 */

class AIServiceClass {
  constructor() {
    // Backend URL
    this.backendURL = 'http://localhost:8000';
    // Session management
    this.sessions = new Map(); // sessionId -> { messages: [], xmlContent: '', metadata: {} }
  }

  /**
   * Create a new chat session with backend
   * @param {File} xmlFile - The XML file for this session
   * @returns {Promise<string>} - Session ID
   */
  async createSession(xmlFile) {
    try {
      const formData = new FormData();
      formData.append('file', xmlFile);

      const response = await fetch(`${this.backendURL}/sessions/create`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create session');
      }

      const result = await response.json();
      
      // Store session locally for UI management
      this.sessions.set(result.session_id, {
        messages: [],
        filename: xmlFile.name,
        createdAt: new Date(),
        lastActivity: new Date()
      });

      return result.session_id;
    } catch (error) {
      console.error('Session creation error:', error);
      throw error;
    }
  }

  /**
   * Send message to backend and get AI response
   * @param {string} sessionId - The session ID
   * @param {string} message - The user message
   * @returns {Promise<string>} - AI response
   */
  async processMessage(sessionId, message) {
    try {
      const response = await fetch(`${this.backendURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: message
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to process message');
      }

      const result = await response.json();
      
      // Update local session
      if (this.sessions.has(sessionId)) {
        const session = this.sessions.get(sessionId);
        session.lastActivity = new Date();
        // Add messages to local storage for UI
        session.messages.push(
          { role: 'user', content: message, timestamp: new Date() },
          { role: 'assistant', content: result.response, timestamp: new Date() }
        );
      }

      return result.response;
    } catch (error) {
      console.error('Message processing error:', error);
      throw error;
    }
  }

  /**
   * Get session data
   * @param {string} sessionId - The session ID
   * @returns {Object|null} - Session data or null if not found
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Delete a session
   * @param {string} sessionId - The session ID
   */
  async deleteSession(sessionId) {
    try {
      // Delete from backend
      await fetch(`${this.backendURL}/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      
      // Delete from local storage
      this.sessions.delete(sessionId);
    } catch (error) {
      console.error('Session deletion error:', error);
      // Still delete locally even if backend fails
      this.sessions.delete(sessionId);
    }
  }

  /**
   * Clear old sessions (older than 1 hour)
   */
  clearOldSessions() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastActivity < oneHourAgo) {
        this.deleteSession(sessionId);
      }
    }
  }

  /**
   * Check backend health and API status
   * @returns {Promise<Object>} - Status information
   */
  async getApiStatus() {
    try {
      const response = await fetch(`${this.backendURL}/health`);
      if (response.ok) {
        const status = await response.json();
        return {
          available: true,
          openai_configured: status.openai_available,
          active_sessions: status.active_sessions,
          backend_connected: true
        };
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
    }
    
    return {
      available: false,
      openai_configured: false,
      active_sessions: 0,
      backend_connected: false
    };
  }

  /**
   * Download GraphML export for a session
   * @param {string} sessionId - The session ID
   * @returns {Promise<void>}
   */
  async downloadGraphML(sessionId) {
    try {
      const response = await fetch(`${this.backendURL}/sessions/${sessionId}/graphml`);
      if (!response.ok) {
        throw new Error('GraphML export not available');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sessionId}_graph.graphml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('GraphML download error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const AIService = new AIServiceClass();
