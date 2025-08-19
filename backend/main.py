"""
Simplified FastAPI Backend for Veilix AI P&ID Analysis
Integrates DEXPI utilities and OpenAI chat functionality
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import os
import tempfile
import logging
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI

# Import our DEXPI utilities
from PnID_utilities import load_dexpi_model, to_networkx_graph, export_graphml

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Veilix AI Backend",
    description="P&ID Analysis with DEXPI and OpenAI",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global storage for sessions
sessions: Dict[str, Dict[str, Any]] = {}

# OpenAI client
openai_client = None
api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    try:
        openai_client = OpenAI(api_key=api_key)
        logger.info("✅ OpenAI client initialized")
    except Exception as e:
        logger.error(f"❌ OpenAI initialization failed: {e}")


# Request/Response Models
class ChatMessage(BaseModel):
    message: str
    session_id: str


class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: Optional[datetime] = None

class SessionResponse(BaseModel):
    session_id: str
    status: str
    message: str


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "openai_available": openai_client is not None,
        "active_sessions": len(sessions)
    }


@app.post("/sessions/create", response_model=SessionResponse)
async def create_session(file: UploadFile = File(...)):
    """Create a new session with DEXPI XML file"""
    try:
        if not file.filename.endswith('.xml'):
            raise HTTPException(status_code=400, detail="Only XML files allowed")
        
        # Generate session ID
        session_id = f"session_{int(datetime.now().timestamp())}_{hash(file.filename) % 10000}"
        
        # Read and save file temporarily
        content = await file.read()
        
        # Save to temporary file for DEXPI processing
        with tempfile.NamedTemporaryFile(mode='wb', suffix='.xml', delete=False) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name
        
        try:
            # Process with DEXPI
            dexpi_model = load_dexpi_model(temp_path)
            graph = to_networkx_graph(dexpi_model)
            
            # Create GraphML export path
            graphml_path = temp_path.replace('.xml', '.graphml')
            export_graphml(graph, graphml_path)
            
            # Store session data
            sessions[session_id] = {
                "filename": file.filename,
                "xml_content": content.decode('utf-8'),
                "dexpi_model": dexpi_model,
                "graph": graph,
                "graphml_path": graphml_path,
                "temp_xml_path": temp_path,
                "messages": [],
                "created_at": datetime.now(),
                "last_activity": datetime.now()
            }
            
            logger.info(f"Created session {session_id} with {graph.number_of_nodes()} nodes, {graph.number_of_edges()} edges")
            
            return SessionResponse(
                session_id=session_id,
                status="success",
                message=f"DEXPI file processed: {graph.number_of_nodes()} components, {graph.number_of_edges()} connections"
            )
            
        except Exception as e:
            # Clean up temp file on error
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            raise HTTPException(status_code=500, detail=f"DEXPI processing failed: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatMessage):
    """Process chat message with P&ID context"""
    try:
        session_id = request.session_id
        message = request.message
        
        if session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = sessions[session_id]
        session["last_activity"] = datetime.now()
        
        # Add user message to history
        session["messages"].append({
            "role": "user",
            "content": message,
            "timestamp": datetime.now()
        })
        
        # Generate AI response
        if openai_client:
            response = await generate_openai_response(session, message)
        else:
            response = "Sorry, OpenAI API is not available. Please check the configuration."
        
        # Add AI response to history
        session["messages"].append({
            "role": "assistant",
            "content": response,
            "timestamp": datetime.now()
        })
        
        return ChatResponse(
            response=response,
            session_id=session_id,
            timestamp=datetime.now()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def generate_openai_response(session: Dict[str, Any], message: str) -> str:
    """Generate response using OpenAI"""
    try:
        graph = session["graph"]
        filename = session["filename"]
        
        # Convert graph to dictionary representation (like in AI_utilities copy.py)
        print("🔄 Converting graph data...")
        try:
            # Convert NetworkX graph to dictionary representation
            graph_dict = graph.__dict__
            
            # Convert to string for AI context
            graph_str = str(graph_dict)
            print(f"Graph data size: {len(graph_str)} characters")
            
            # Truncate if too long to avoid token limits
            if len(graph_str) > 50000:  # Reasonable limit for API calls
                graph_str = graph_str[:50000] + "... [truncated for brevity]"
                print("⚠️  Graph data truncated due to size limitations")
                
            graph_info = f"Complete P&ID Graph Data:\n{graph_str}"
            print(f"✅ Graph loaded successfully! ({graph.number_of_nodes()} nodes, {graph.number_of_edges()} edges)")
            
        except Exception as e:
            print(f"⚠️  Warning: Could not load complete graph data: {e}")
            # Fallback to basic info if conversion fails
            graph_info = f"""
            Graph Information (basic):
            - Nodes: {graph.number_of_nodes()}
            - Edges: {graph.number_of_edges()}
            - Error getting detailed data: {str(e)}
            """
        
        # System prompt with complete graph context (like in AI_utilities copy.py)
        system_prompt = f"""You are an expert in P&ID (Piping & Instrumentation Diagrams) analysis from file: {filename}. 
You help analyze process plants and can answer questions about:
- Components and equipment
- Process flows  
- Safety systems
- Instrumentation
- Graph structure and relationships

Current P&ID Graph Context:
{graph_info}

Answer in English and be precise. Use the graph data to provide specific insights about components, connections, and process flows."""

        # Build messages for OpenAI
        messages = [
            {"role": "system", "content": system_prompt},
        ]
        
        # Add recent conversation history (last 6 messages for context like in original)
        recent_messages = session["messages"][-6:]
        for msg in recent_messages:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        # Add current user message
        messages.append({"role": "user", "content": message})
        
        # Log the context being sent to OpenAI (for debugging)
        logger.info(f"Sending context to OpenAI with {len(system_prompt)} characters")
        logger.debug(f"Context preview: {system_prompt[:500]}...")
        
        # Call OpenAI with settings similar to AI_utilities copy.py
        response = openai_client.chat.completions.create(
            model="gpt-4o",  # Use gpt-4o like in original
            messages=messages,
            max_tokens=1500,
            temperature=0.7
        )
        
        ai_result = response.choices[0].message.content
        logger.info(f"Received OpenAI response with {len(ai_result)} characters")
        
        return ai_result
        
    except Exception as e:
        logger.error(f"OpenAI error: {e}")
        # Simple fallback without complex mock responses
        return f"Sorry, I encountered an error processing your request: {str(e)}. Please try again."


@app.get("/sessions/{session_id}/graphml")
async def download_graphml(session_id: str):
    """Download GraphML file for session"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    graphml_path = session.get("graphml_path")
    
    if not graphml_path or not os.path.exists(graphml_path):
        raise HTTPException(status_code=404, detail="GraphML file not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(
        graphml_path,
        media_type='application/xml',
        filename=f"{session['filename']}.graphml"
    )


@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete session and cleanup files"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    
    # Cleanup temporary files
    for path_key in ["temp_xml_path", "graphml_path"]:
        path = session.get(path_key)
        if path and os.path.exists(path):
            try:
                os.unlink(path)
            except Exception as e:
                logger.warning(f"Failed to delete {path}: {e}")
    
    # Remove session
    del sessions[session_id]
    
    return {"message": "Session deleted successfully"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
