import { useState, useRef, useEffect } from 'react';
import AIChat from "../assets/icons/AIChat.svg";
import Star from '../assets/icons/Star.svg';
import { AIService } from '../services/AIService';

export default function ChatSection() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [xmlFile, setXmlFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Get API status on component mount
    const loadApiStatus = async () => {
      try {
        const status = await AIService.getApiStatus();
        setApiStatus(status);
      } catch (error) {
        console.error('Failed to get API status:', error);
        setApiStatus({
          available: false,
          openai_configured: false,
          backend_connected: false
        });
      }
    };

    loadApiStatus();
    
    // Clean up old sessions periodically
    const cleanupInterval = setInterval(() => {
      AIService.clearOldSessions();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'text/xml' || file.name.endsWith('.xml'))) {
      setXmlFile(file);
      setMessages([]); // Clear previous messages
      
      try {
        // Create new session
        const newSessionId = await AIService.createSession(file);
        setSessionId(newSessionId);
        
        // Add welcome message
        const welcomeMessage = {
          id: Date.now(),
          type: 'ai',
          content: `I've successfully loaded your P&ID XML file "${file.name}". I can now help you analyze the process diagram, equipment, instrumentation, and flows. What would you like to know about your process diagram?`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      } catch (error) {
        alert('Error processing XML file: ' + error.message);
      }
    } else {
      alert('Please upload a valid XML file.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !xmlFile || !sessionId) return;

    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await AIService.processMessage(sessionId, inputValue);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (sessionId) {
      AIService.deleteSession(sessionId);
    }
    setMessages([]);
    setSessionId(null);
    setXmlFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section id="chat" className="relative bg-[#0b0b0b] text-white py-24 min-h-screen flex flex-col items-center justify-center">
      <div className="mx-auto max-w-6xl px-6 w-full flex flex-col items-center">
        {/* Pill */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 backdrop-blur-sm">
            <img src={Star} alt="star" className="h-3 w-3 opacity-60" />
            <span className="text-[16px] leading-none text-white/70">
              AI Chat
            </span>
            <img src={Star} alt="star" className="h-3 w-3 opacity-60" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-center text-[34px] leading-tight font-semibold tracking-[-0.01em] mt-4">
          Professional AI Chat with P&ID Analysis
        </h2>

        <p className="mt-4 text-center text-white/75 max-w-[60ch] text-lg">
          Upload your XML files and interact with our AI to gain intelligent insights and analysis for your technical documentation.
        </p>

        {/* API Status Indicator */}
        {apiStatus && (
          <div className="mt-4 flex justify-center">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              apiStatus.backend_connected && apiStatus.openai_configured
                ? 'bg-green-600/20 border border-green-500/30 text-green-200' 
                : apiStatus.backend_connected
                ? 'bg-yellow-600/20 border border-yellow-500/30 text-yellow-200'
                : 'bg-red-600/20 border border-red-500/30 text-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                apiStatus.backend_connected && apiStatus.openai_configured 
                  ? 'bg-green-400' 
                  : apiStatus.backend_connected
                  ? 'bg-yellow-400' 
                  : 'bg-red-400'
              }`}></div>
              <span>
                {apiStatus.backend_connected && apiStatus.openai_configured
                  ? 'OpenAI API Connected' 
                  : apiStatus.backend_connected
                  ? 'Backend Connected (Mock Mode)'
                  : 'Backend Disconnected'
                }
              </span>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="mt-10 w-full max-w-4xl">
          <div className="
            group relative rounded-[15px] border border-white/10
            bg-white/[0.02] p-6 
            transition-all duration-300 transform-gpu
            hover:shadow-[0_10px_40px_rgba(255,255,255,0.06)]
            hover:border-white/20
            after:content-[''] after:absolute after:inset-0 after:rounded-[15px]
            after:border after:border-white/10 after:[border-style:dashed]
            after:pointer-events-none after:opacity-60
          ">
            {/* subtle hover glow */}
            <div className="pointer-events-none absolute inset-0 rounded-[15px] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute -inset-1 rounded-[24px] blur-[16px] bg-white/[0.03]" />
            </div>

            {/* File Upload Section */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="flex-shrink-0">
                <img src={AIChat} alt="AI Chat" className="h-12 w-12" />
              </div>
              <div className="flex-grow flex items-center gap-3">
                <input
                  type="file"
                  accept=".xml"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="
                    px-4 py-2 rounded-lg border border-white/20 bg-white/[0.05]
                    text-white/80 hover:text-white hover:bg-white/[0.08]
                    transition-all duration-200
                  "
                >
                  {xmlFile ? `Loaded: ${xmlFile.name}` : 'Upload P&ID XML File'}
                </button>
                
                {sessionId && (
                  <>
                    <div className="text-sm text-white/60">
                      Session Active
                    </div>
                    <button
                      onClick={handleClearChat}
                      className="
                        px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-600/10
                        text-red-300 hover:text-red-200 hover:bg-red-600/20
                        transition-all duration-200 text-sm
                      "
                    >
                      Clear Chat
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="chat-messages chat-scroll min-h-[300px] max-h-[400px] overflow-y-auto mb-4 space-y-4 p-2 rounded-lg"
            >
              {messages.length === 0 ? (
                <div className="text-center text-white/50 py-12">
                  {sessionId 
                    ? "Chat session is ready. Ask me anything about your P&ID diagram!"
                    : "Upload a P&ID XML file to start an AI-powered conversation about your process diagram"
                  }
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      <div
                        className={`
                          max-w-[75%] px-4 py-3 rounded-xl
                          transition-all duration-200 ease-in-out
                          ${message.type === 'user'
                            ? 'bg-gradient-to-r from-blue-600/30 to-blue-500/20 border border-blue-400/30 text-white shadow-lg shadow-blue-500/10'
                            : message.type === 'error'
                            ? 'bg-gradient-to-r from-red-600/30 to-red-500/20 border border-red-400/30 text-red-200 shadow-lg shadow-red-500/10'
                            : 'bg-gradient-to-r from-white/10 to-white/5 border border-white/15 text-white/95 shadow-lg shadow-white/5'
                          }
                          backdrop-blur-sm
                        `}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <span className="text-xs opacity-60 mt-2 block">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-gradient-to-r from-white/10 to-white/5 border border-white/15 text-white/90 max-w-[75%] px-4 py-3 rounded-xl backdrop-blur-sm shadow-lg shadow-white/5">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Invisible element for auto-scroll */}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex gap-3 items-end">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={sessionId ? "Continue the conversation about your P&ID..." : "Please upload a P&ID XML file first"}
                disabled={!sessionId || isLoading}
                className="
                  flex-grow px-4 py-3 rounded-xl border border-white/20 
                  bg-gradient-to-r from-white/5 to-white/10 text-white placeholder-white/50
                  focus:outline-none focus:border-white/40 focus:bg-gradient-to-r focus:from-white/10 focus:to-white/15
                  disabled:opacity-50 disabled:cursor-not-allowed
                  resize-none min-h-[50px] max-h-[120px]
                  backdrop-blur-sm shadow-lg shadow-white/5
                  transition-all duration-200 ease-in-out
                "
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || !sessionId || isLoading}
                className="
                  px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600/80 to-blue-500/80 
                  hover:from-blue-600 hover:to-blue-500
                  text-white font-medium transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:shadow-[0_8px_32px_rgba(59,130,246,0.4)]
                  active:scale-95 backdrop-blur-sm
                  border border-blue-500/30
                "
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Send'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
