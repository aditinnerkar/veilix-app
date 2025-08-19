"""
DEXPI Service for processing DEXPI XML files and extracting P&ID information
"""

import logging
import xml.etree.ElementTree as ET
from typing import Dict, List, Any, Optional
from datetime import datetime
import networkx as nx

from models.dexpi_models import (
    DexpiAnalysisResult, 
    ComponentData, 
    FlowData, 
    GraphData, 
    GraphNode, 
    GraphEdge
)

logger = logging.getLogger(__name__)


class DexpiService:
    def __init__(self):
        """Initialize DEXPI service"""
        self.sessions_data = {}  # Store processed data per session
        self.graphs = {}  # Store NetworkX graphs per session

    def is_available(self) -> bool:
        """Check if DEXPI service is available"""
        return True

    def get_status(self) -> Dict[str, Any]:
        """Get service status"""
        return {
            "available": True,
            "active_sessions": len(self.sessions_data),
            "total_graphs": len(self.graphs)
        }

    async def process_file(self, session_id: str, xml_content: bytes) -> bool:
        """Process DEXPI XML file and extract information"""
        try:
            # Parse XML
            xml_str = xml_content.decode('utf-8')
            root = ET.fromstring(xml_str)
            
            # Extract components and flows
            components = self._extract_components(root)
            flows = self._extract_flows(root)
            
            # Create NetworkX graph
            graph = self._create_networkx_graph(components, flows)
            
            # Store processed data
            self.sessions_data[session_id] = {
                "xml_root": root,
                "components": components,
                "flows": flows,
                "processed_at": datetime.now()
            }
            
            self.graphs[session_id] = graph
            
            logger.info(f"Processed DEXPI file for session {session_id}: {len(components)} components, {len(flows)} flows")
            return True
            
        except Exception as e:
            logger.error(f"Error processing DEXPI file: {str(e)}")
            return False

    def _extract_components(self, root: ET.Element) -> List[ComponentData]:
        """Extract components from DEXPI XML"""
        components = []
        
        # DEXPI namespace handling
        namespaces = {
            'dexpi': 'http://www.dexpi.org/schema/dexpi',
            'pid': 'http://www.dexpi.org/schema/pid'
        }
        
        try:
            # Look for equipment and piping components
            for equipment in root.findall(".//Equipment", namespaces) + root.findall(".//PipingComponent", namespaces):
                component_id = equipment.get('ID', f"comp_{len(components)}")
                component_type = equipment.get('ComponentClass', equipment.tag)
                
                # Extract position if available
                position = None
                position_elem = equipment.find(".//Position", namespaces)
                if position_elem is not None:
                    x = position_elem.get('X')
                    y = position_elem.get('Y')
                    if x and y:
                        position = {"x": float(x), "y": float(y)}
                
                # Extract properties
                properties = {}
                for attr in equipment.attrib:
                    properties[attr] = equipment.attrib[attr]
                
                # Extract text content as name
                name = equipment.get('TagName', equipment.get('Name', component_id))
                
                component = ComponentData(
                    id=component_id,
                    type=component_type,
                    name=name,
                    properties=properties,
                    position=position
                )
                components.append(component)
                
        except Exception as e:
            logger.warning(f"Error extracting components: {str(e)}")
            
        # If no DEXPI components found, try generic XML parsing
        if not components:
            components = self._extract_generic_components(root)
            
        return components

    def _extract_generic_components(self, root: ET.Element) -> List[ComponentData]:
        """Extract components from generic XML structure"""
        components = []
        
        # Look for common element types that might represent components
        for i, elem in enumerate(root.iter()):
            if elem.tag and len(elem.tag) > 1 and not elem.tag.startswith('{'):
                # Skip root and common structural elements
                if elem.tag.lower() in ['root', 'document', 'xml', 'schema']:
                    continue
                    
                component_id = elem.get('id', elem.get('ID', f"component_{i}"))
                component_type = elem.tag
                name = elem.get('name', elem.get('Name', elem.text if elem.text and len(elem.text.strip()) < 50 else None))
                
                properties = dict(elem.attrib)
                
                component = ComponentData(
                    id=component_id,
                    type=component_type,
                    name=name,
                    properties=properties
                )
                components.append(component)
                
        return components[:50]  # Limit to prevent too many components

    def _extract_flows(self, root: ET.Element) -> List[FlowData]:
        """Extract flows/connections from DEXPI XML"""
        flows = []
        
        # DEXPI namespace handling
        namespaces = {
            'dexpi': 'http://www.dexpi.org/schema/dexpi',
            'pid': 'http://www.dexpi.org/schema/pid'
        }
        
        try:
            # Look for pipes and connections
            for pipe in root.findall(".//Pipe", namespaces) + root.findall(".//Connection", namespaces):
                flow_id = pipe.get('ID', f"flow_{len(flows)}")
                
                # Extract connection points
                from_ref = pipe.get('FromComponent', pipe.get('StartComponent'))
                to_ref = pipe.get('ToComponent', pipe.get('EndComponent'))
                
                if from_ref and to_ref:
                    properties = dict(pipe.attrib)
                    
                    flow = FlowData(
                        id=flow_id,
                        from_component=from_ref,
                        to_component=to_ref,
                        flow_type="pipe",
                        properties=properties
                    )
                    flows.append(flow)
                    
        except Exception as e:
            logger.warning(f"Error extracting flows: {str(e)}")
            
        return flows

    def _create_networkx_graph(self, components: List[ComponentData], flows: List[FlowData]) -> nx.Graph:
        """Create NetworkX graph from components and flows"""
        G = nx.Graph()
        
        # Add nodes (components)
        for comp in components:
            G.add_node(comp.id, 
                      label=comp.name or comp.id,
                      type=comp.type,
                      properties=comp.properties)
        
        # Add edges (flows)
        for flow in flows:
            if G.has_node(flow.from_component) and G.has_node(flow.to_component):
                G.add_edge(flow.from_component, flow.to_component,
                          id=flow.id,
                          type=flow.flow_type,
                          properties=flow.properties)
        
        return G

    async def analyze_components(self, session_id: str) -> DexpiAnalysisResult:
        """Analyze components in the P&ID"""
        if session_id not in self.sessions_data:
            raise ValueError("Session not found")
        
        data = self.sessions_data[session_id]
        components = data["components"]
        
        # Generate summary
        component_types = {}
        for comp in components:
            comp_type = comp.type
            component_types[comp_type] = component_types.get(comp_type, 0) + 1
        
        summary = f"Found {len(components)} components:\n"
        for comp_type, count in component_types.items():
            summary += f"• {comp_type}: {count}\n"
        
        return DexpiAnalysisResult(
            session_id=session_id,
            analysis_type="components",
            components=components,
            summary=summary,
            timestamp=datetime.now()
        )

    async def analyze_flows(self, session_id: str) -> DexpiAnalysisResult:
        """Analyze flows in the P&ID"""
        if session_id not in self.sessions_data:
            raise ValueError("Session not found")
        
        data = self.sessions_data[session_id]
        flows = data["flows"]
        
        summary = f"Found {len(flows)} connections/flows in the process diagram."
        
        return DexpiAnalysisResult(
            session_id=session_id,
            analysis_type="flows",
            flows=flows,
            summary=summary,
            timestamp=datetime.now()
        )

    async def get_graph_data(self, session_id: str) -> DexpiAnalysisResult:
        """Get graph representation of the P&ID"""
        if session_id not in self.graphs:
            raise ValueError("Graph not found for session")
        
        graph = self.graphs[session_id]
        
        # Convert NetworkX graph to our GraphData format
        nodes = []
        for node_id, node_data in graph.nodes(data=True):
            node = GraphNode(
                id=node_id,
                label=node_data.get('label', node_id),
                type=node_data.get('type', 'unknown'),
                properties=node_data.get('properties', {})
            )
            nodes.append(node)
        
        edges = []
        for source, target, edge_data in graph.edges(data=True):
            edge = GraphEdge(
                id=edge_data.get('id', f"{source}-{target}"),
                source=source,
                target=target,
                properties=edge_data.get('properties', {})
            )
            edges.append(edge)
        
        graph_data = GraphData(
            nodes=nodes,
            edges=edges,
            metadata={
                "node_count": len(nodes),
                "edge_count": len(edges),
                "density": nx.density(graph),
                "connected_components": nx.number_connected_components(graph)
            }
        )
        
        return DexpiAnalysisResult(
            session_id=session_id,
            analysis_type="graph",
            graph=graph_data,
            summary=f"Graph with {len(nodes)} nodes and {len(edges)} edges",
            timestamp=datetime.now()
        )
