// Pattern node definitions: Noise, Circle, Checker, Gradient

import type { NodeDef } from '@/lib/types';

// Noise Node - simplex noise
export const NoiseNode: NodeDef = {
  type: 'pattern_noise',
  label: 'Noise',
  category: 'pattern',
  inputs: [
    { name: 'uv', type: 'vec2' },
  ],
  outputs: [
    { name: 'value', type: 'float' },
  ],
  params: [
    { name: 'scale', type: 'float', default: 5.0, min: 0.1, max: 100.0 },
    { name: 'octaves', type: 'float', default: 1.0, min: 1.0, max: 8.0 },
  ],
  helpers: ['snoise'],
  generateCode: (inputs, params) => {
    const scale = (params.scale as number) ?? 5.0;
    const octaves = Math.floor((params.octaves as number) ?? 1);
    const uv = inputs.uv ?? 'v_uv';
    
    if (octaves <= 1) {
      return {
        value: `snoise(${uv} * ${scale.toFixed(4)})`,
      };
    }
    
    // Fractal brownian motion for multiple octaves
    return {
      value: `fbm(${uv} * ${scale.toFixed(4)}, ${octaves})`,
    };
  },
};

// Circle Node - circular distance field
export const CircleNode: NodeDef = {
  type: 'pattern_circle',
  label: 'Circle',
  category: 'pattern',
  inputs: [
    { name: 'uv', type: 'vec2' },
  ],
  outputs: [
    { name: 'value', type: 'float' },
    { name: 'distance', type: 'float' },
  ],
  params: [
    { name: 'radius', type: 'float', default: 0.3, min: 0.0, max: 1.0 },
    { name: 'center', type: 'vec2', default: [0.5, 0.5] },
    { name: 'softness', type: 'float', default: 0.01, min: 0.0, max: 0.5 },
  ],
  generateCode: (inputs, params) => {
    const uv = inputs.uv ?? 'v_uv';
    const radius = (params.radius as number) ?? 0.3;
    const center = (params.center as number[]) ?? [0.5, 0.5];
    const softness = (params.softness as number) ?? 0.01;
    
    const centerVec = `vec2(${center[0].toFixed(4)}, ${center[1].toFixed(4)})`;
    const distExpr = `length(${uv} - ${centerVec})`;
    
    return {
      distance: distExpr,
      value: `smoothstep(${radius.toFixed(4)} + ${softness.toFixed(4)}, ${radius.toFixed(4)} - ${softness.toFixed(4)}, ${distExpr})`,
    };
  },
};

// Checker Node - checkerboard pattern
export const CheckerNode: NodeDef = {
  type: 'pattern_checker',
  label: 'Checker',
  category: 'pattern',
  inputs: [
    { name: 'uv', type: 'vec2' },
  ],
  outputs: [
    { name: 'value', type: 'float' },
  ],
  params: [
    { name: 'scale', type: 'float', default: 8.0, min: 1.0, max: 64.0 },
  ],
  generateCode: (inputs, params) => {
    const uv = inputs.uv ?? 'v_uv';
    const scale = (params.scale as number) ?? 8.0;
    
    return {
      value: `mod(floor(${uv}.x * ${scale.toFixed(4)}) + floor(${uv}.y * ${scale.toFixed(4)}), 2.0)`,
    };
  },
};

// Gradient Node - linear gradient
export const GradientNode: NodeDef = {
  type: 'pattern_gradient',
  label: 'Gradient',
  category: 'pattern',
  inputs: [
    { name: 'uv', type: 'vec2' },
  ],
  outputs: [
    { name: 'value', type: 'float' },
  ],
  params: [
    { name: 'direction', type: 'select', default: 'horizontal', options: [
      { label: 'Horizontal', value: 'horizontal' },
      { label: 'Vertical', value: 'vertical' },
      { label: 'Diagonal', value: 'diagonal' },
      { label: 'Radial', value: 'radial' },
    ]},
  ],
  generateCode: (inputs, params) => {
    const uv = inputs.uv ?? 'v_uv';
    const direction = (params.direction as string) ?? 'horizontal';
    
    switch (direction) {
      case 'vertical':
        return { value: `${uv}.y` };
      case 'diagonal':
        return { value: `(${uv}.x + ${uv}.y) * 0.5` };
      case 'radial':
        return { value: `length(${uv} - vec2(0.5))` };
      case 'horizontal':
      default:
        return { value: `${uv}.x` };
    }
  },
};

// Export all pattern nodes
export const PatternNodes: NodeDef[] = [
  NoiseNode,
  CircleNode,
  CheckerNode,
  GradientNode,
];
