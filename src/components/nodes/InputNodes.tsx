// Input node definitions: UV, Time, Mouse, Resolution

import type { NodeDef } from '@/lib/types';

// UV Node - outputs normalized screen coordinates (0-1)
export const UVNode: NodeDef = {
  type: 'input_uv',
  label: 'UV',
  category: 'input',
  inputs: [],
  outputs: [
    { name: 'uv', type: 'vec2' },
    { name: 'x', type: 'float' },
    { name: 'y', type: 'float' },
  ],
  params: [],
  generateCode: () => ({
    uv: 'v_uv',
    x: 'v_uv.x',
    y: 'v_uv.y',
  }),
};

// Time Node - outputs elapsed time in seconds
export const TimeNode: NodeDef = {
  type: 'input_time',
  label: 'Time',
  category: 'input',
  inputs: [],
  outputs: [
    { name: 'time', type: 'float' },
    { name: 'sin', type: 'float' },
    { name: 'cos', type: 'float' },
  ],
  params: [
    { name: 'speed', type: 'float', default: 1.0, min: 0.0, max: 10.0 },
  ],
  generateCode: (_inputs, params) => {
    const speed = params.speed ?? 1.0;
    const timeExpr = speed === 1.0 ? 'u_time' : `(u_time * ${speed.toFixed(4)})`;
    return {
      time: timeExpr,
      sin: `sin(${timeExpr})`,
      cos: `cos(${timeExpr})`,
    };
  },
};

// Mouse Node - outputs normalized mouse position (0-1)
export const MouseNode: NodeDef = {
  type: 'input_mouse',
  label: 'Mouse',
  category: 'input',
  inputs: [],
  outputs: [
    { name: 'position', type: 'vec2' },
    { name: 'x', type: 'float' },
    { name: 'y', type: 'float' },
  ],
  params: [],
  generateCode: () => ({
    position: 'u_mouse',
    x: 'u_mouse.x',
    y: 'u_mouse.y',
  }),
};

// Resolution Node - outputs canvas size in pixels
export const ResolutionNode: NodeDef = {
  type: 'input_resolution',
  label: 'Resolution',
  category: 'input',
  inputs: [],
  outputs: [
    { name: 'size', type: 'vec2' },
    { name: 'width', type: 'float' },
    { name: 'height', type: 'float' },
    { name: 'aspect', type: 'float' },
  ],
  params: [],
  generateCode: () => ({
    size: 'u_resolution',
    width: 'u_resolution.x',
    height: 'u_resolution.y',
    aspect: '(u_resolution.x / u_resolution.y)',
  }),
};

// Export all input nodes
export const InputNodes: NodeDef[] = [
  UVNode,
  TimeNode,
  MouseNode,
  ResolutionNode,
];
