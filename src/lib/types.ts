// Prism type definitions

export type PortType = 'float' | 'vec2' | 'vec3' | 'vec4';

export interface PortDef {
  name: string;
  type: PortType;
  default?: number | number[];
}

export interface ParamDef {
  name: string;
  type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'color' | 'select';
  default: number | number[] | string;
  min?: number;
  max?: number;
  options?: { label: string; value: string }[];
}

export interface NodeDef {
  type: string;
  label: string;
  category: 'input' | 'math' | 'pattern' | 'color' | 'output';
  inputs: PortDef[];
  outputs: PortDef[];
  params: ParamDef[];
  generateCode: (inputs: Record<string, string>, params: Record<string, unknown>) => Record<string, string>;
  helpers?: string[];
}

export interface NodeInstance {
  id: string;
  type: string;
  position: { x: number; y: number };
  params: Record<string, unknown>;
}

export interface Edge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface Project {
  version: string;
  name: string;
  nodes: NodeInstance[];
  edges: Edge[];
}

// Type guards
export function isPortType(value: unknown): value is PortType {
  return value === 'float' || value === 'vec2' || value === 'vec3' || value === 'vec4';
}

export function isPortDef(value: unknown): value is PortDef {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.name === 'string' && isPortType(obj.type);
}

export function isParamDef(value: unknown): value is ParamDef {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  const validTypes = ['float', 'vec2', 'vec3', 'vec4', 'color', 'select'];
  return typeof obj.name === 'string' && validTypes.includes(obj.type as string);
}

export function isNodeInstance(value: unknown): value is NodeInstance {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.position === 'object' &&
    obj.position !== null &&
    typeof (obj.position as { x?: unknown }).x === 'number' &&
    typeof (obj.position as { y?: unknown }).y === 'number'
  );
}

export function isEdge(value: unknown): value is Edge {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.source === 'string' &&
    typeof obj.sourceHandle === 'string' &&
    typeof obj.target === 'string' &&
    typeof obj.targetHandle === 'string'
  );
}

export function isProject(value: unknown): value is Project {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.version === 'string' &&
    typeof obj.name === 'string' &&
    Array.isArray(obj.nodes) &&
    Array.isArray(obj.edges)
  );
}

// Default value helpers
export function getPortDefaultValue(type: PortType): number | number[] {
  switch (type) {
    case 'float': return 0;
    case 'vec2': return [0, 0];
    case 'vec3': return [0, 0, 0];
    case 'vec4': return [0, 0, 0, 1];
  }
}

export function getPortComponentCount(type: PortType): number {
  switch (type) {
    case 'float': return 1;
    case 'vec2': return 2;
    case 'vec3': return 3;
    case 'vec4': return 4;
  }
}

// Project validation
export function validateProject(project: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isProject(project)) {
    return { valid: false, errors: ['Invalid project structure'] };
  }

  if (project.version !== '1.0') {
    errors.push(`Unknown version: ${project.version}`);
  }

  for (let i = 0; i < project.nodes.length; i++) {
    if (!isNodeInstance(project.nodes[i])) {
      errors.push(`Invalid node at index ${i}`);
    }
  }

  for (let i = 0; i < project.edges.length; i++) {
    if (!isEdge(project.edges[i])) {
      errors.push(`Invalid edge at index ${i}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
