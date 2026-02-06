// Prism GLSL code generator

import type { NodeInstance, Edge, PortType, NodeDef } from './types';
import { getPortDefaultValue } from './types';
import { getNodeDef } from '@/components/nodes';

export interface CodeGenResult {
  success: boolean;
  code?: string;
  error?: string;
  errorNodeId?: string;
  helpers?: string[];
}

/**
 * Topological sort using Kahn's algorithm.
 * Returns nodes in dependency order (dependencies first).
 */
export function topologicalSort(nodes: NodeInstance[], edges: Edge[]): NodeInstance[] | null {
  // Build adjacency list and in-degree map
  const nodeMap = new Map<string, NodeInstance>();
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();
  
  nodes.forEach(node => {
    nodeMap.set(node.id, node);
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  });
  
  // Edge goes from source (dependency) to target (dependent)
  edges.forEach(edge => {
    const targets = adjacency.get(edge.source);
    if (targets) {
      targets.push(edge.target);
    }
    const degree = inDegree.get(edge.target);
    if (degree !== undefined) {
      inDegree.set(edge.target, degree + 1);
    }
  });
  
  // Start with nodes that have no dependencies
  const queue: string[] = [];
  inDegree.forEach((degree, id) => {
    if (degree === 0) queue.push(id);
  });
  
  const sorted: NodeInstance[] = [];
  
  while (queue.length > 0) {
    const id = queue.shift()!;
    const node = nodeMap.get(id);
    if (node) sorted.push(node);
    
    const targets = adjacency.get(id) || [];
    targets.forEach(targetId => {
      const degree = inDegree.get(targetId)!;
      inDegree.set(targetId, degree - 1);
      if (degree - 1 === 0) {
        queue.push(targetId);
      }
    });
  }
  
  // Check for cycle
  if (sorted.length !== nodes.length) {
    return null; // Cycle detected
  }
  
  return sorted;
}

/**
 * Infer output types for all node outputs based on connections.
 */
export function inferTypes(nodes: NodeInstance[], edges: Edge[]): Map<string, PortType> {
  const types = new Map<string, PortType>();
  
  // Get node definitions and set output types
  nodes.forEach(node => {
    const def = getNodeDef(node.type);
    if (def) {
      def.outputs.forEach(output => {
        types.set(`${node.id}.${output.name}`, output.type);
      });
    }
  });
  
  return types;
}

/**
 * Check if a connection between two port types is valid.
 */
export function canConnect(sourceType: PortType, targetType: PortType): boolean {
  // Same type always connects
  if (sourceType === targetType) return true;
  
  // Float can connect to any vector type (will be expanded)
  if (sourceType === 'float') return true;
  
  // vec3 can connect to vec4 (will add alpha)
  if (sourceType === 'vec3' && targetType === 'vec4') return true;
  
  // vec4 can connect to vec3 (will drop alpha)
  if (sourceType === 'vec4' && targetType === 'vec3') return true;
  
  return false;
}

/**
 * Get GLSL conversion code from one type to another.
 */
export function getConversion(from: PortType, to: PortType, value: string): string {
  if (from === to) return value;
  
  // Float to vector: expand
  if (from === 'float') {
    switch (to) {
      case 'vec2': return `vec2(${value})`;
      case 'vec3': return `vec3(${value})`;
      case 'vec4': return `vec4(vec3(${value}), 1.0)`;
    }
  }
  
  // vec3 to vec4: add alpha
  if (from === 'vec3' && to === 'vec4') {
    return `vec4(${value}, 1.0)`;
  }
  
  // vec4 to vec3: drop alpha
  if (from === 'vec4' && to === 'vec3') {
    return `${value}.rgb`;
  }
  
  // Fallback
  return value;
}

/**
 * Format a value as GLSL literal.
 */
function formatValue(value: unknown, type: PortType): string {
  if (typeof value === 'number') {
    const str = value.toString();
    return str.includes('.') ? str : `${str}.0`;
  }
  
  if (Array.isArray(value)) {
    const formatted = value.map(v => {
      const str = v.toString();
      return str.includes('.') ? str : `${str}.0`;
    });
    switch (type) {
      case 'vec2': return `vec2(${formatted.slice(0, 2).join(', ')})`;
      case 'vec3': return `vec3(${formatted.slice(0, 3).join(', ')})`;
      case 'vec4': return `vec4(${formatted.slice(0, 4).join(', ')})`;
    }
  }
  
  return '0.0';
}

/**
 * Generate complete GLSL fragment shader from node graph.
 */
export function generateGLSL(nodes: NodeInstance[], edges: Edge[]): CodeGenResult {
  // Find output node
  const outputNode = nodes.find(n => n.type === 'output');
  if (!outputNode) {
    return { success: false, error: 'No output node found' };
  }
  
  // Topological sort
  const sorted = topologicalSort(nodes, edges);
  if (!sorted) {
    return { success: false, error: 'Cycle detected in node graph' };
  }
  
  // Build edge lookup: target -> { inputName -> { sourceNode, outputName } }
  const inputConnections = new Map<string, Map<string, { sourceId: string; outputName: string }>>();
  edges.forEach(edge => {
    let nodeInputs = inputConnections.get(edge.target);
    if (!nodeInputs) {
      nodeInputs = new Map();
      inputConnections.set(edge.target, nodeInputs);
    }
    nodeInputs.set(edge.targetHandle, { sourceId: edge.source, outputName: edge.sourceHandle });
  });
  
  // Infer types
  const types = inferTypes(nodes, edges);
  
  // Store output variable names for each node output
  const outputVars = new Map<string, string>();
  
  // Collect helpers needed
  const helpersNeeded = new Set<string>();
  
  // Generate code for each node
  const lines: string[] = [];
  let varCounter = 0;
  
  for (const node of sorted) {
    const def = getNodeDef(node.type);
    if (!def) {
      return { success: false, error: `Unknown node type: ${node.type}`, errorNodeId: node.id };
    }
    
    // Collect helpers
    if (def.helpers) {
      def.helpers.forEach(h => helpersNeeded.add(h));
    }
    
    // Build input values
    const inputs: Record<string, string> = {};
    const nodeInputs = inputConnections.get(node.id);
    
    for (const inputDef of def.inputs) {
      const connection = nodeInputs?.get(inputDef.name);
      
      if (connection) {
        // Use connected output
        const sourceVar = outputVars.get(`${connection.sourceId}.${connection.outputName}`);
        if (sourceVar) {
          // Check if type conversion needed
          const sourceType = types.get(`${connection.sourceId}.${connection.outputName}`);
          if (sourceType && sourceType !== inputDef.type) {
            inputs[inputDef.name] = getConversion(sourceType, inputDef.type, sourceVar);
          } else {
            inputs[inputDef.name] = sourceVar;
          }
        } else {
          // Fallback to default
          inputs[inputDef.name] = formatValue(
            inputDef.default ?? getPortDefaultValue(inputDef.type),
            inputDef.type
          );
        }
      } else {
        // Use default value
        inputs[inputDef.name] = formatValue(
          inputDef.default ?? getPortDefaultValue(inputDef.type),
          inputDef.type
        );
      }
    }
    
    // Build params
    const params: Record<string, unknown> = { ...node.params };
    for (const paramDef of def.params) {
      if (params[paramDef.name] === undefined) {
        params[paramDef.name] = paramDef.default;
      }
    }
    
    // Generate code for this node
    const outputs = def.generateCode(inputs, params);
    
    // Store output variable names
    for (const outputDef of def.outputs) {
      const code = outputs[outputDef.name];
      if (code) {
        if (node.type === 'output') {
          // Output node writes directly to fragColor
          lines.push(`  fragColor = ${code};`);
        } else {
          // Create variable for output
          const varName = `v${varCounter++}`;
          const glslType = outputDef.type;
          lines.push(`  ${glslType} ${varName} = ${code};`);
          outputVars.set(`${node.id}.${outputDef.name}`, varName);
        }
      }
    }
  }
  
  // Build complete shader
  const helpers = Array.from(helpersNeeded);
  
  const shader = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

out vec4 fragColor;

${helpers.join('\n\n')}

void main() {
${lines.join('\n')}
}`;
  
  return {
    success: true,
    code: shader,
    helpers,
  };
}
