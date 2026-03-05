// Prism GLSL code generator

import type { NodeInstance, Edge, PortType } from './types';
import { getPortDefaultValue } from './types';
import { getNodeDef } from '@/components/nodes';
import { getHelper } from './noise';

export interface CodeGenResult {
  success: boolean;
  code?: string;
  error?: string;
  errorNodeId?: string;
  helpers?: string[];
  /** Whether the shader requires audio uniforms */
  requiresAudio?: boolean;
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
export function inferTypes(nodes: NodeInstance[], _edges: Edge[]): Map<string, PortType> {
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
  
  // Check if any nodes require audio
  const requiresAudio = nodes.some(n => {
    const def = getNodeDef(n.type);
    return def?.requiresAudio === true;
  });
  
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
    
    // Handle output node specially - it uses __fragColor key
    if (node.type === 'output' && outputs.__fragColor) {
      lines.push(`  fragColor = ${outputs.__fragColor};`);
    } else {
      // Store output variable names for non-output nodes
      for (const outputDef of def.outputs) {
        const code = outputs[outputDef.name];
        if (code) {
          const varName = `v${varCounter++}`;
          const glslType = outputDef.type;
          lines.push(`  ${glslType} ${varName} = ${code};`);
          outputVars.set(`${node.id}.${outputDef.name}`, varName);
        }
      }
    }
  }
  
  // Build complete shader
  const helperNames = Array.from(helpersNeeded);
  const resolvedHelpers = helperNames
    .map(name => getHelper(name))
    .filter((h): h is string => h !== undefined);
  
  // Audio uniform declarations (only included if audio nodes are used)
  const audioUniforms = requiresAudio ? `
// Audio uniforms
uniform float u_audio_volume;
uniform float u_audio_peak;
uniform float u_audio_rms;
uniform float u_audio_bass;
uniform float u_audio_mid;
uniform float u_audio_treble;
uniform float u_audio_fft[8];
uniform float u_audio_beat;
uniform float u_audio_beat_raw;
uniform float u_audio_bpm;
` : '';

  const shader = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
${audioUniforms}
out vec4 fragColor;

${resolvedHelpers.join('\n\n')}

void main() {
  vec2 v_uv = gl_FragCoord.xy / u_resolution;

${lines.join('\n')}
}`;
  
  return {
    success: true,
    code: shader,
    helpers: helperNames,
    requiresAudio,
  };
}

/**
 * Convert GLSL type to HLSL type.
 */
function glslToHlslType(type: PortType): string {
  switch (type) {
    case 'float': return 'float';
    case 'vec2': return 'float2';
    case 'vec3': return 'float3';
    case 'vec4': return 'float4';
    default: return 'float';
  }
}

/**
 * Convert GLSL code snippet to HLSL.
 */
function glslToHlsl(code: string): string {
  return code
    .replace(/vec4/g, 'float4')
    .replace(/vec3/g, 'float3')
    .replace(/vec2/g, 'float2')
    .replace(/mat4/g, 'float4x4')
    .replace(/mat3/g, 'float3x3')
    .replace(/mat2/g, 'float2x2')
    .replace(/fract\(/g, 'frac(')
    .replace(/mix\(/g, 'lerp(')
    .replace(/mod\(/g, 'fmod(')
    .replace(/texture\(/g, 'tex2D(');
}

/**
 * Convert a GLSL helper function to HLSL.
 */
function convertHelperToHlsl(helper: string): string {
  return glslToHlsl(helper);
}

/**
 * Generate HLSL pixel shader from node graph.
 */
export function generateHLSL(nodes: NodeInstance[], edges: Edge[]): CodeGenResult {
  // First generate GLSL, then convert
  const glslResult = generateGLSL(nodes, edges);
  if (!glslResult.success || !glslResult.code) {
    return glslResult;
  }
  
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
  
  // Build edge lookup
  const inputConnections = new Map<string, Map<string, { sourceId: string; outputName: string }>>();
  edges.forEach(edge => {
    let nodeInputs = inputConnections.get(edge.target);
    if (!nodeInputs) {
      nodeInputs = new Map();
      inputConnections.set(edge.target, nodeInputs);
    }
    nodeInputs.set(edge.targetHandle, { sourceId: edge.source, outputName: edge.sourceHandle });
  });
  
  const types = inferTypes(nodes, edges);
  const outputVars = new Map<string, string>();
  const helpersNeeded = new Set<string>();
  const lines: string[] = [];
  let varCounter = 0;
  
  for (const node of sorted) {
    const def = getNodeDef(node.type);
    if (!def) {
      return { success: false, error: `Unknown node type: ${node.type}`, errorNodeId: node.id };
    }
    
    if (def.helpers) {
      def.helpers.forEach(h => helpersNeeded.add(h));
    }
    
    const inputs: Record<string, string> = {};
    const nodeInputs = inputConnections.get(node.id);
    
    for (const inputDef of def.inputs) {
      const connection = nodeInputs?.get(inputDef.name);
      
      if (connection) {
        const sourceVar = outputVars.get(`${connection.sourceId}.${connection.outputName}`);
        if (sourceVar) {
          const sourceType = types.get(`${connection.sourceId}.${connection.outputName}`);
          if (sourceType && sourceType !== inputDef.type) {
            const conversion = getConversion(sourceType, inputDef.type, sourceVar);
            inputs[inputDef.name] = glslToHlsl(conversion);
          } else {
            inputs[inputDef.name] = sourceVar;
          }
        } else {
          const defaultVal = formatValue(
            inputDef.default ?? getPortDefaultValue(inputDef.type),
            inputDef.type
          );
          inputs[inputDef.name] = glslToHlsl(defaultVal);
        }
      } else {
        const defaultVal = formatValue(
          inputDef.default ?? getPortDefaultValue(inputDef.type),
          inputDef.type
        );
        inputs[inputDef.name] = glslToHlsl(defaultVal);
      }
    }
    
    const params: Record<string, unknown> = { ...node.params };
    for (const paramDef of def.params) {
      if (params[paramDef.name] === undefined) {
        params[paramDef.name] = paramDef.default;
      }
    }
    
    const outputs = def.generateCode(inputs, params);
    
    if (node.type === 'output' && outputs.__fragColor) {
      lines.push(`  return ${glslToHlsl(outputs.__fragColor)};`);
    } else {
      for (const outputDef of def.outputs) {
        const code = outputs[outputDef.name];
        if (code) {
          const varName = `v${varCounter++}`;
          const hlslType = glslToHlslType(outputDef.type);
          lines.push(`  ${hlslType} ${varName} = ${glslToHlsl(code)};`);
          outputVars.set(`${node.id}.${outputDef.name}`, varName);
        }
      }
    }
  }
  
  const helperNames = Array.from(helpersNeeded);
  const resolvedHelpers = helperNames
    .map(name => getHelper(name))
    .filter((h): h is string => h !== undefined)
    .map(convertHelperToHlsl);
  
  const shader = `// HLSL Pixel Shader generated by Prism

cbuffer Constants : register(b0) {
  float u_time;
  float2 u_resolution;
  float2 u_mouse;
};

struct PSInput {
  float4 position : SV_POSITION;
  float2 uv : TEXCOORD0;
};

${resolvedHelpers.join('\n\n')}

float4 main(PSInput input) : SV_TARGET {
  float2 v_uv = input.uv;

${lines.join('\n')}
}`;
  
  return {
    success: true,
    code: shader,
    helpers: helperNames,
  };
}

/**
 * Convert GLSL type to Metal type.
 */
function glslToMetalType(type: PortType): string {
  switch (type) {
    case 'float': return 'float';
    case 'vec2': return 'float2';
    case 'vec3': return 'float3';
    case 'vec4': return 'float4';
    default: return 'float';
  }
}

/**
 * Convert GLSL code snippet to Metal.
 */
function glslToMetal(code: string): string {
  return code
    .replace(/vec4/g, 'float4')
    .replace(/vec3/g, 'float3')
    .replace(/vec2/g, 'float2')
    .replace(/mat4/g, 'float4x4')
    .replace(/mat3/g, 'float3x3')
    .replace(/mat2/g, 'float2x2')
    .replace(/fract\(/g, 'fract(')  // Metal uses fract
    .replace(/mix\(/g, 'mix(')       // Metal uses mix
    .replace(/mod\(/g, 'fmod(')
    .replace(/texture\(/g, 'tex.sample(sampler, ');
}

/**
 * Convert a GLSL helper function to Metal.
 */
function convertHelperToMetal(helper: string): string {
  return glslToMetal(helper);
}

/**
 * Generate Metal fragment shader from node graph.
 */
export function generateMetal(nodes: NodeInstance[], edges: Edge[]): CodeGenResult {
  const outputNode = nodes.find(n => n.type === 'output');
  if (!outputNode) {
    return { success: false, error: 'No output node found' };
  }
  
  const sorted = topologicalSort(nodes, edges);
  if (!sorted) {
    return { success: false, error: 'Cycle detected in node graph' };
  }
  
  const inputConnections = new Map<string, Map<string, { sourceId: string; outputName: string }>>();
  edges.forEach(edge => {
    let nodeInputs = inputConnections.get(edge.target);
    if (!nodeInputs) {
      nodeInputs = new Map();
      inputConnections.set(edge.target, nodeInputs);
    }
    nodeInputs.set(edge.targetHandle, { sourceId: edge.source, outputName: edge.sourceHandle });
  });
  
  const types = inferTypes(nodes, edges);
  const outputVars = new Map<string, string>();
  const helpersNeeded = new Set<string>();
  const lines: string[] = [];
  let varCounter = 0;
  
  for (const node of sorted) {
    const def = getNodeDef(node.type);
    if (!def) {
      return { success: false, error: `Unknown node type: ${node.type}`, errorNodeId: node.id };
    }
    
    if (def.helpers) {
      def.helpers.forEach(h => helpersNeeded.add(h));
    }
    
    const inputs: Record<string, string> = {};
    const nodeInputs = inputConnections.get(node.id);
    
    for (const inputDef of def.inputs) {
      const connection = nodeInputs?.get(inputDef.name);
      
      if (connection) {
        const sourceVar = outputVars.get(`${connection.sourceId}.${connection.outputName}`);
        if (sourceVar) {
          const sourceType = types.get(`${connection.sourceId}.${connection.outputName}`);
          if (sourceType && sourceType !== inputDef.type) {
            const conversion = getConversion(sourceType, inputDef.type, sourceVar);
            inputs[inputDef.name] = glslToMetal(conversion);
          } else {
            inputs[inputDef.name] = sourceVar;
          }
        } else {
          const defaultVal = formatValue(
            inputDef.default ?? getPortDefaultValue(inputDef.type),
            inputDef.type
          );
          inputs[inputDef.name] = glslToMetal(defaultVal);
        }
      } else {
        const defaultVal = formatValue(
          inputDef.default ?? getPortDefaultValue(inputDef.type),
          inputDef.type
        );
        inputs[inputDef.name] = glslToMetal(defaultVal);
      }
    }
    
    const params: Record<string, unknown> = { ...node.params };
    for (const paramDef of def.params) {
      if (params[paramDef.name] === undefined) {
        params[paramDef.name] = paramDef.default;
      }
    }
    
    const outputs = def.generateCode(inputs, params);
    
    if (node.type === 'output' && outputs.__fragColor) {
      lines.push(`  return ${glslToMetal(outputs.__fragColor)};`);
    } else {
      for (const outputDef of def.outputs) {
        const code = outputs[outputDef.name];
        if (code) {
          const varName = `v${varCounter++}`;
          const metalType = glslToMetalType(outputDef.type);
          lines.push(`  ${metalType} ${varName} = ${glslToMetal(code)};`);
          outputVars.set(`${node.id}.${outputDef.name}`, varName);
        }
      }
    }
  }
  
  const helperNames = Array.from(helpersNeeded);
  const resolvedHelpers = helperNames
    .map(name => getHelper(name))
    .filter((h): h is string => h !== undefined)
    .map(convertHelperToMetal);
  
  const shader = `// Metal Fragment Shader generated by Prism
#include <metal_stdlib>
using namespace metal;

struct Uniforms {
  float u_time;
  float2 u_resolution;
  float2 u_mouse;
};

struct VertexOut {
  float4 position [[position]];
  float2 uv;
};

${resolvedHelpers.join('\n\n')}

fragment float4 fragmentMain(VertexOut in [[stage_in]],
                             constant Uniforms& uniforms [[buffer(0)]]) {
  float u_time = uniforms.u_time;
  float2 u_resolution = uniforms.u_resolution;
  float2 u_mouse = uniforms.u_mouse;
  float2 v_uv = in.uv;

${lines.join('\n')}
}`;
  
  return {
    success: true,
    code: shader,
    helpers: helperNames,
  };
}

/**
 * Generate Shadertoy-compatible GLSL from node graph.
 * 
 * Shadertoy uses different uniform names and main function signature:
 * - iResolution (vec3), iTime (float), iMouse (vec4), iFrame (int)
 * - mainImage(out vec4 fragColor, in vec2 fragCoord)
 */
export function generateShadertoy(nodes: NodeInstance[], edges: Edge[]): CodeGenResult {
  const outputNode = nodes.find(n => n.type === 'output');
  if (!outputNode) {
    return { success: false, error: 'No output node found' };
  }
  
  const sorted = topologicalSort(nodes, edges);
  if (!sorted) {
    return { success: false, error: 'Cycle detected in node graph' };
  }
  
  const inputConnections = new Map<string, Map<string, { sourceId: string; outputName: string }>>();
  edges.forEach(edge => {
    let nodeInputs = inputConnections.get(edge.target);
    if (!nodeInputs) {
      nodeInputs = new Map();
      inputConnections.set(edge.target, nodeInputs);
    }
    nodeInputs.set(edge.targetHandle, { sourceId: edge.source, outputName: edge.sourceHandle });
  });
  
  const types = inferTypes(nodes, edges);
  const outputVars = new Map<string, string>();
  const helpersNeeded = new Set<string>();
  const lines: string[] = [];
  let varCounter = 0;
  
  for (const node of sorted) {
    const def = getNodeDef(node.type);
    if (!def) {
      return { success: false, error: `Unknown node type: ${node.type}`, errorNodeId: node.id };
    }
    
    if (def.helpers) {
      def.helpers.forEach(h => helpersNeeded.add(h));
    }
    
    const inputs: Record<string, string> = {};
    const nodeInputs = inputConnections.get(node.id);
    
    for (const inputDef of def.inputs) {
      const connection = nodeInputs?.get(inputDef.name);
      
      if (connection) {
        const sourceVar = outputVars.get(`${connection.sourceId}.${connection.outputName}`);
        if (sourceVar) {
          const sourceType = types.get(`${connection.sourceId}.${connection.outputName}`);
          if (sourceType && sourceType !== inputDef.type) {
            inputs[inputDef.name] = getConversion(sourceType, inputDef.type, sourceVar);
          } else {
            inputs[inputDef.name] = sourceVar;
          }
        } else {
          inputs[inputDef.name] = formatValue(
            inputDef.default ?? getPortDefaultValue(inputDef.type),
            inputDef.type
          );
        }
      } else {
        inputs[inputDef.name] = formatValue(
          inputDef.default ?? getPortDefaultValue(inputDef.type),
          inputDef.type
        );
      }
    }
    
    const params: Record<string, unknown> = { ...node.params };
    for (const paramDef of def.params) {
      if (params[paramDef.name] === undefined) {
        params[paramDef.name] = paramDef.default;
      }
    }
    
    const outputs = def.generateCode(inputs, params);
    
    if (node.type === 'output' && outputs.__fragColor) {
      lines.push(`    fragColor = ${outputs.__fragColor};`);
    } else {
      for (const outputDef of def.outputs) {
        const code = outputs[outputDef.name];
        if (code) {
          const varName = `v${varCounter++}`;
          const glslType = outputDef.type;
          lines.push(`    ${glslType} ${varName} = ${code};`);
          outputVars.set(`${node.id}.${outputDef.name}`, varName);
        }
      }
    }
  }
  
  const helperNames = Array.from(helpersNeeded);
  const resolvedHelpers = helperNames
    .map(name => getHelper(name))
    .filter((h): h is string => h !== undefined);
  
  // Convert our uniform names to Shadertoy equivalents in the generated code
  const convertedLines = lines.map(line => 
    line
      .replace(/u_resolution/g, 'iResolution.xy')
      .replace(/u_time/g, 'iTime')
      .replace(/u_mouse/g, 'iMouse.xy / iResolution.xy')
  );
  
  // Also convert helpers
  const convertedHelpers = resolvedHelpers.map(helper =>
    helper
      .replace(/u_resolution/g, 'iResolution.xy')
      .replace(/u_time/g, 'iTime')
      .replace(/u_mouse/g, 'iMouse.xy / iResolution.xy')
  );
  
  // Shadertoy uses mainImage with fragCoord parameter instead of gl_FragCoord
  const shader = `// Shadertoy shader generated by Prism
// Paste this into https://www.shadertoy.com/new

${convertedHelpers.join('\n\n')}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 v_uv = fragCoord / iResolution.xy;

${convertedLines.join('\n')}
}`; 
  
  return {
    success: true,
    code: shader,
    helpers: helperNames,
  };
}
