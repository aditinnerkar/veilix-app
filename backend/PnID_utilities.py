# Simple DEXPI utilities - using dexpipy when available
import os
import xml.etree.ElementTree as ET
import networkx as nx
from typing import Any


def load_dexpi_model(xml_path: str) -> Any:
    """Load DEXPI XML file"""
    try:
        # Try with pydexpi ProteusSerializer first (preferred)
        from pydexpi.loaders.proteus_serializer import ProteusSerializer
        print("Using ProteusSerializer to load DEXPI model...")
        serializer = ProteusSerializer()
        try:
            dir_path, filename = os.path.split(os.path.abspath(xml_path))
            model = serializer.load(dir_path=dir_path or ".", filename=filename)
            return model
        except TypeError:
            # Try alternative loading method
            model = serializer.load(xml_path)
            return model
    except ImportError:
        print("pydexpi not available, falling back to XML parsing...")
        # Fallback to standard XML parsing
        tree = ET.parse(xml_path)
        return tree.getroot()
    except Exception as e:
        print(f"pydexpi load failed: {e}, trying XML fallback...")
        # Fallback to standard XML parsing
        tree = ET.parse(xml_path)
        return tree.getroot()


def to_networkx_graph(model: Any):
    """Convert DEXPI model to NetworkX graph"""
    try:
        # Try with pydexpi MLGraphLoader first
        from pydexpi.loaders.ml_graph_loader import MLGraphLoader
        print("Creating NetworkX graph with pydexpi...")
        loader = MLGraphLoader()
        if hasattr(loader, "dexpi_to_graph"):
            return loader.dexpi_to_graph(model)
        elif hasattr(loader, "parse_dexpi_to_graph"):
            return loader.parse_dexpi_to_graph(model)
        else:
            # Fallback to manual conversion
            print("Using fallback XML-to-NetworkX conversion...")
            return _xml_to_networkx_fallback(model)
            
    except ImportError:
        # Fallback to manual XML-to-NetworkX conversion
        print("pydexpi not available, using built-in XML parser...")
        return _xml_to_networkx_fallback(model)
    except Exception as e:
        # Also fallback on any other error
        print(f"pydexpi graph conversion failed: {e}, using fallback...")
        return _xml_to_networkx_fallback(model)


def _xml_to_networkx_fallback(xml_root):
    """Convert XML to NetworkX graph using built-in parsing"""
    G = nx.Graph()
    
    # Extract nodes (equipment, instruments, etc.)
    node_count = 0
    for elem in xml_root.iter():
        # Skip root and common structural elements
        if elem.tag.lower() in ['root', 'document', 'xml', 'schema', 'dexpi']:
            continue
            
        # Look for elements that might represent components
        if len(elem.attrib) > 0 or elem.text:
            node_id = elem.get('ID', elem.get('id', f"node_{node_count}"))
            
            # Node attributes
            attrs = {
                'type': elem.tag,
                'class': elem.get('ComponentClass', elem.get('class', elem.tag)),
                'name': elem.get('TagName', elem.get('Name', elem.get('name', node_id))),
                'xml_tag': elem.tag
            }
            
            # Add all XML attributes
            attrs.update(elem.attrib)
            
            G.add_node(node_id, **attrs)
            node_count += 1
            
            if node_count > 100:  # Limit nodes to prevent huge graphs
                break
    
    # Create some edges based on XML hierarchy or specific connection elements
    edge_count = 0
    for elem in xml_root.iter():
        # Look for connection-like elements
        if 'connect' in elem.tag.lower() or 'pipe' in elem.tag.lower() or 'line' in elem.tag.lower():
            from_ref = elem.get('FromComponent', elem.get('From', elem.get('StartComponent')))
            to_ref = elem.get('ToComponent', elem.get('To', elem.get('EndComponent')))
            
            if from_ref and to_ref and G.has_node(from_ref) and G.has_node(to_ref):
                G.add_edge(from_ref, to_ref, type='connection', xml_source=elem.tag)
                edge_count += 1
    
    # If no explicit connections found, create some based on hierarchy
    if edge_count == 0 and len(G.nodes()) > 1:
        nodes = list(G.nodes())
        for i in range(min(len(nodes)-1, 20)):  # Connect first few nodes
            G.add_edge(nodes[i], nodes[i+1], type='hierarchy')
    
    print(f"Created graph with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges")
    return G


def export_graphml(graph: Any, out_path: str) -> None:
    """Export graph to GraphML format - custom implementation"""
    
    # Write GraphML manually to avoid enum issues
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n')
        f.write('  <key id="node_id" for="node" attr.name="id" attr.type="string"/>\n')
        f.write('  <key id="node_name" for="node" attr.name="name" attr.type="string"/>\n')
        f.write('  <key id="node_type" for="node" attr.name="type" attr.type="string"/>\n')
        f.write('  <key id="edge_type" for="edge" attr.name="type" attr.type="string"/>\n')
        f.write('  <graph id="G" edgedefault="directed">\n')
        
        # Write nodes
        for node_id, attrs in graph.nodes(data=True):
            f.write(f'    <node id="{node_id}">\n')
            f.write(f'      <data key="node_id">{node_id}</data>\n')
            
            # Add some key attributes
            name = attrs.get('name', attrs.get('id', str(node_id)))
            f.write(f'      <data key="node_name">{str(name)}</data>\n')
            
            node_type = attrs.get('type', attrs.get('class', 'unknown'))
            f.write(f'      <data key="node_type">{str(node_type)}</data>\n')
            
            f.write('    </node>\n')
        
        # Write edges
        for src, dst, attrs in graph.edges(data=True):
            f.write(f'    <edge source="{src}" target="{dst}">\n')
            edge_type = attrs.get('type', 'CONNECTED_TO')
            f.write(f'      <data key="edge_type">{str(edge_type)}</data>\n')
            f.write('    </edge>\n')
        
        f.write('  </graph>\n')
        f.write('</graphml>\n')
