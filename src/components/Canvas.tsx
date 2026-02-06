'use client';

/**
 * Canvas - React Flow wrapper for the node editor
 */
import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  NodeTypes,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { usePrismStore, selectNodes, selectEdges } from '@/lib/store';
import { getNodeDef } from '@/components/nodes';
import { canConnect } from '@/lib/codegen';
import { BaseNode, BaseNodeData } from '@/components/nodes/BaseNode';
import type { NodeInstance, Edge as PrismEdge } from '@/lib/types';

// Custom node types
const nodeTypes: NodeTypes = {
  prism: BaseNode,
};

// Convert Prism nodes to React Flow nodes
function toFlowNodes(nodes: NodeInstance[]): Node<BaseNodeData>[] {
  return nodes.map((node) => {
    const def = getNodeDef(node.type);
    return {
      id: node.id,
      type: 'prism',
      position: node.position,
      data: {
        def: def!,
        params: node.params,
      },
      selected: false,
    };
  });
}

// Convert Prism edges to React Flow edges
function toFlowEdges(edges: PrismEdge[]): Edge[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    sourceHandle: edge.sourceHandle,
    target: edge.target,
    targetHandle: edge.targetHandle,
    type: 'default',
    style: { stroke: '#4299e1', strokeWidth: 2 },
  }));
}

/**
 * Main canvas component
 */
function CanvasInner() {
  const prismNodes = usePrismStore(selectNodes);
  const prismEdges = usePrismStore(selectEdges);
  const { updateNodePosition, addEdge, removeEdge, removeNode, selectNode } = usePrismStore();

  // Convert to React Flow format
  const nodes = useMemo(() => toFlowNodes(prismNodes), [prismNodes]);
  const edges = useMemo(() => toFlowEdges(prismEdges), [prismEdges]);

  // Handle node position changes
  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && change.id) {
          updateNodePosition(change.id, change.position);
        }
        if (change.type === 'remove' && change.id) {
          removeNode(change.id);
        }
        if (change.type === 'select' && change.id) {
          selectNode(change.selected ? change.id : null);
        }
      });
    },
    [updateNodePosition, removeNode, selectNode]
  );

  // Handle edge changes
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      changes.forEach((change) => {
        if (change.type === 'remove' && change.id) {
          removeEdge(change.id);
        }
      });
    },
    [removeEdge]
  );

  // Handle new connections
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (
        connection.source &&
        connection.target &&
        connection.sourceHandle &&
        connection.targetHandle
      ) {
        addEdge({
          source: connection.source,
          sourceHandle: connection.sourceHandle,
          target: connection.target,
          targetHandle: connection.targetHandle,
        });
      }
    },
    [addEdge]
  );

  // Validate connections
  const isValidConnection = useCallback(
    (connection: Connection): boolean => {
      if (!connection.source || !connection.target) return false;
      if (!connection.sourceHandle || !connection.targetHandle) return false;

      // Get source and target nodes
      const sourceNode = prismNodes.find((n) => n.id === connection.source);
      const targetNode = prismNodes.find((n) => n.id === connection.target);
      if (!sourceNode || !targetNode) return false;

      // Get node definitions
      const sourceDef = getNodeDef(sourceNode.type);
      const targetDef = getNodeDef(targetNode.type);
      if (!sourceDef || !targetDef) return false;

      // Get port types
      const sourcePort = sourceDef.outputs.find((o) => o.name === connection.sourceHandle);
      const targetPort = targetDef.inputs.find((i) => i.name === connection.targetHandle);
      if (!sourcePort || !targetPort) return false;

      // Check type compatibility
      return canConnect(sourcePort.type, targetPort.type);
    },
    [prismNodes]
  );

  return (
    <div className="w-full h-full bg-gray-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          style: { stroke: '#4299e1', strokeWidth: 2 },
          type: 'default',
        }}
      >
        <Background color="#374151" gap={15} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

/**
 * Canvas wrapped with ReactFlowProvider
 */
export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
