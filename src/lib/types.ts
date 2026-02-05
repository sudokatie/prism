// Prism type definitions
// TODO: Implement in Task 2

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
