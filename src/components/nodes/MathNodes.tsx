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

// Abs Node - absolute value
export const AbsNode: NodeDef = {
  type: 'math_abs',
  label: 'Abs',
  category: 'math',
  inputs: [
    { name: 'x', type: 'float', default: 0 },
  ],
  outputs: [
    { name: 'result', type: 'float' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `abs(${inputs.x ?? '0.0'})`,
  }),
};

// Min Node - minimum of two values
export const MinNode: NodeDef = {
  type: 'math_min',
  label: 'Min',
  category: 'math',
  inputs: [
    { name: 'a', type: 'float', default: 0 },
    { name: 'b', type: 'float', default: 1 },
  ],
  outputs: [
    { name: 'result', type: 'float' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `min(${inputs.a ?? '0.0'}, ${inputs.b ?? '1.0'})`,
  }),
};

// Max Node - maximum of two values
export const MaxNode: NodeDef = {
  type: 'math_max',
  label: 'Max',
  category: 'math',
  inputs: [
    { name: 'a', type: 'float', default: 0 },
    { name: 'b', type: 'float', default: 1 },
  ],
  outputs: [
    { name: 'result', type: 'float' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `max(${inputs.a ?? '0.0'}, ${inputs.b ?? '1.0'})`,
  }),
};

// Clamp Node - clamp value to range
export const ClampNode: NodeDef = {
  type: 'math_clamp',
  label: 'Clamp',
  category: 'math',
  inputs: [
    { name: 'x', type: 'float', default: 0.5 },
    { name: 'min', type: 'float', default: 0 },
    { name: 'max', type: 'float', default: 1 },
  ],
  outputs: [
    { name: 'result', type: 'float' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `clamp(${inputs.x ?? '0.5'}, ${inputs.min ?? '0.0'}, ${inputs.max ?? '1.0'})`,
  }),
};

// Remap Node - remap value from one range to another
export const RemapNode: NodeDef = {
  type: 'math_remap',
  label: 'Remap',
  category: 'math',
  inputs: [
    { name: 'x', type: 'float', default: 0.5 },
    { name: 'inMin', type: 'float', default: 0 },
    { name: 'inMax', type: 'float', default: 1 },
    { name: 'outMin', type: 'float', default: 0 },
    { name: 'outMax', type: 'float', default: 1 },
  ],
  outputs: [
    { name: 'result', type: 'float' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `(${inputs.outMin ?? '0.0'} + (${inputs.x ?? '0.5'} - ${inputs.inMin ?? '0.0'}) * (${inputs.outMax ?? '1.0'} - ${inputs.outMin ?? '0.0'}) / (${inputs.inMax ?? '1.0'} - ${inputs.inMin ?? '0.0'}))`,
  }),
};

// Floor Node - floor of input
export const FloorNode: NodeDef = {
  type: 'math_floor',
  label: 'Floor',
  category: 'math',
  inputs: [
    { name: 'x', type: 'float', default: 0 },
  ],
  outputs: [
    { name: 'result', type: 'float' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `floor(${inputs.x ?? '0.0'})`,
  }),
};

// Ceil Node - ceiling of input
export const CeilNode: NodeDef = {
  type: 'math_ceil',
  label: 'Ceil',
  category: 'math',
  inputs: [
    { name: 'x', type: 'float', default: 0 },
  ],
  outputs: [
    { name: 'result', type: 'float' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `ceil(${inputs.x ?? '0.0'})`,
  }),
};

// Mod Node - modulo operation
export const ModNode: NodeDef = {
  type: 'math_mod',
  label: 'Mod',
  category: 'math',
  inputs: [
    { name: 'x', type: 'float', default: 0 },
    { name: 'y', type: 'float', default: 1 },
  ],
  outputs: [
    { name: 'result', type: 'float' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `mod(${inputs.x ?? '0.0'}, ${inputs.y ?? '1.0'})`,
  }),
};

// Pow Node - power function
export const PowNode: NodeDef = {
  type: 'math_pow',
  label: 'Pow',
  category: 'math',
  inputs: [
    { name: 'x', type: 'float', default: 2 },
    { name: 'y', type: 'float', default: 2 },
  ],
  outputs: [
    { name: 'result', type: 'float' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `pow(${inputs.x ?? '2.0'}, ${inputs.y ?? '2.0'})`,
  }),
};

// Sqrt Node - square root
export const SqrtNode: NodeDef = {
  type: 'math_sqrt',
  label: 'Sqrt',
  category: 'math',
  inputs: [
    { name: 'x', type: 'float', default: 1 },
  ],
  outputs: [
    { name: 'result', type: 'float' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `sqrt(${inputs.x ?? '1.0'})`,
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
  AbsNode,
  MinNode,
  MaxNode,
  ClampNode,
  RemapNode,
  FloorNode,
  CeilNode,
  ModNode,
  PowNode,
  SqrtNode,
];
