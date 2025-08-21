from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime


class ComponentData(BaseModel):
    id: str
    type: str
    name: Optional[str] = None
    properties: Dict[str, Any] = {}
    position: Optional[Dict[str, float]] = None


class FlowData(BaseModel):
    id: str
    from_component: str
    to_component: str
    flow_type: str
    properties: Dict[str, Any] = {}


class GraphNode(BaseModel):
    id: str
    label: str
    type: str
    properties: Dict[str, Any] = {}
    position: Optional[Dict[str, float]] = None


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    properties: Dict[str, Any] = {}


class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    metadata: Dict[str, Any] = {}


class DexpiAnalysisResult(BaseModel):
    session_id: str
    analysis_type: str
    components: List[ComponentData] = []
    flows: List[FlowData] = []
    graph: Optional[GraphData] = None
    summary: Optional[str] = None
    timestamp: datetime
    metadata: Dict[str, Any] = {}
