// Math node definitions: Add, Multiply, Sin, Cos, Mix, Smoothstep, Step, Fract

import type { NodeDef } from '@/lib/types';

// Add Node - adds two values
export const AddNode: NodeDef = {
  type: 'math_add',
  label: 'Add',
  category: 'math',
  inputs: [
    { name: 'a', type: 'float', default: 0 },
    { name: 'b', type: 'float', default: 0 },
  ],
  outputs: [
    { name: 'result', type: 'float' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `(${inputs.a ?? '0.0'} + ${inputs.b ?? '0.0'})`,
  }),
};

// Multiply Node - multiplies two values
export const MultiplyNode: NodeDef = {
  type: 'math_multiply',
  label: 'Multiply',
  category: 'math',
  inputs: [
    { name: 'a', type: 'float', default: 1 },
    { name: 'b', type: 'float', default: 1 },
  ],
  outputs: [
    { name: 'result', type: 'float' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `(${inputs.a ?? '1.0'} * ${inputs.b ?? '1.0'})`,
  }),
};

// Sin Node - sine of input
export const SinNode: NodeDef = {
  type: 'math_sin',
  label: 'Sin',
  category: 'math',
  inputs: [
    { name: 'x', type: 'float', default: 0 },
  ],
  outputs: [
    { name: 'result', type: 'float' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `sin(${inputs.x ?? '0.0'})`,
  }),
};

// Cos Node - cosine of input
export const CosNode: NodeDef = {
  type: 'math_cos',
  label: 'Cos',
  category: 'math',
  inputs: [
    { name: 'x', type: 'float', default: 0 },
  ],
  outputs: [
    { name: 'result', type: 'float' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `cos(${inputs.x ?? '0.0'})`,
  }),
};

// Mix Node - linear interpolation
export const MixNode: NodeDef = {
  type: 'math_mix',
  label: 'Mix',
  category: 'math',
  inputs: [
    { name: 'a', type: 'float', default: 0 },
    { name: 'b', type: 'float', default: 1 },
    { name: 't', type: 'float', default: 0.5 },
  ],
  outputs: [
    { name: 'result', type: 'float' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `mix(${inputs.a ?? '0.0'}, ${inputs.b ?? '1.0'}, ${inputs.t ?? '0.5'})`,
  }),
};

// Smoothstep Node - smooth Hermite interpolation
export const SmoothstepNode: NodeDef = {
  type: 'math_smoothstep',
  label: 'Smoothstep',
  category: 'math',
  inputs: [
    { name: 'edge0', type: 'float', default: 0 },
    { name: 'edge1', type: 'float', default: 1 },
    { name: 'x', type: 'float', default: 0.5 },
  ],
  outputs: [
    { name: 'result', type: 'float' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `smoothstep(${inputs.edge0 ?? '0.0'}, ${inputs.edge1 ?? '1.0'}, ${inputs.x ?? '0.5'})`,
  }),
};

// Step Node - step function
export const StepNode: NodeDef = {
  type: 'math_step',
  label: 'Step',
  category: 'math',
  inputs: [
    { name: 'edge', type: 'float', default: 0.5 },
    { name: 'x', type: 'float', default: 0 },
  ],
  outputs: [
    { name: 'result', type: 'float' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `step(${inputs.edge ?? '0.5'}, ${inputs.x ?? '0.0'})`,
  }),
};

// Fract Node - fractional part
export const FractNode: NodeDef = {
  type: 'math_fract',
  label: 'Fract',
  category: 'math',
  inputs: [
    { name: 'x', type: 'float', default: 0 },
  ],
  outputs: [
    { name: 'result', type: 'float' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `fract(${inputs.x ?? '0.0'})`,
  }),
};

// Export all math nodes
export const MathNodes: NodeDef[] = [
  AddNode,
  MultiplyNode,
  SinNode,
  CosNode,
  MixNode,
  SmoothstepNode,
  StepNode,
  FractNode,
];
