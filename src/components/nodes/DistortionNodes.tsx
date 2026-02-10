// Distortion node definitions: Wave, Ripple, Displacement, Twist, Pixelate

import type { NodeDef } from '@/lib/types';

// Wave Node - applies wave distortion to UV coordinates
export const WaveNode: NodeDef = {
  type: 'distortion_wave',
  label: 'Wave',
  category: 'distortion',
  inputs: [
    { name: 'uv', type: 'vec2' },
    { name: 'amplitude', type: 'float', default: 0.1 },
    { name: 'frequency', type: 'float', default: 10 },
    { name: 'speed', type: 'float', default: 1 },
  ],
  outputs: [
    { name: 'result', type: 'vec2' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `vec2(${inputs.uv ?? 'v_uv'}.x + ${inputs.amplitude ?? '0.1'} * sin(${inputs.uv ?? 'v_uv'}.y * ${inputs.frequency ?? '10.0'} + u_time * ${inputs.speed ?? '1.0'}), ${inputs.uv ?? 'v_uv'}.y)`,
  }),
};

// Ripple Node - circular ripple distortion from center
export const RippleNode: NodeDef = {
  type: 'distortion_ripple',
  label: 'Ripple',
  category: 'distortion',
  inputs: [
    { name: 'uv', type: 'vec2' },
    { name: 'amplitude', type: 'float', default: 0.02 },
    { name: 'frequency', type: 'float', default: 20 },
    { name: 'speed', type: 'float', default: 3 },
  ],
  outputs: [
    { name: 'result', type: 'vec2' },
  ],
  params: [
    { name: 'centerX', type: 'float', default: 0.5, min: 0, max: 1 },
    { name: 'centerY', type: 'float', default: 0.5, min: 0, max: 1 },
  ],
  generateCode: (inputs, params) => {
    const cx = (params.centerX as number) ?? 0.5;
    const cy = (params.centerY as number) ?? 0.5;
    return {
      result: `(function() { vec2 center = vec2(${cx.toFixed(4)}, ${cy.toFixed(4)}); vec2 delta = ${inputs.uv ?? 'v_uv'} - center; float dist = length(delta); float wave = sin(dist * ${inputs.frequency ?? '20.0'} - u_time * ${inputs.speed ?? '3.0'}) * ${inputs.amplitude ?? '0.02'}; return ${inputs.uv ?? 'v_uv'} + normalize(delta + 0.001) * wave; }())`,
    };
  },
};

// Displacement Node - displaces UV based on texture/value
export const DisplacementNode: NodeDef = {
  type: 'distortion_displacement',
  label: 'Displacement',
  category: 'distortion',
  inputs: [
    { name: 'uv', type: 'vec2' },
    { name: 'offsetX', type: 'float', default: 0 },
    { name: 'offsetY', type: 'float', default: 0 },
    { name: 'strength', type: 'float', default: 0.1 },
  ],
  outputs: [
    { name: 'result', type: 'vec2' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `(${inputs.uv ?? 'v_uv'} + vec2(${inputs.offsetX ?? '0.0'}, ${inputs.offsetY ?? '0.0'}) * ${inputs.strength ?? '0.1'})`,
  }),
};

// Twist Node - twist distortion around center
export const TwistNode: NodeDef = {
  type: 'distortion_twist',
  label: 'Twist',
  category: 'distortion',
  inputs: [
    { name: 'uv', type: 'vec2' },
    { name: 'angle', type: 'float', default: 1 },
    { name: 'radius', type: 'float', default: 0.5 },
  ],
  outputs: [
    { name: 'result', type: 'vec2' },
  ],
  params: [
    { name: 'centerX', type: 'float', default: 0.5, min: 0, max: 1 },
    { name: 'centerY', type: 'float', default: 0.5, min: 0, max: 1 },
  ],
  generateCode: (inputs, params) => {
    const cx = (params.centerX as number) ?? 0.5;
    const cy = (params.centerY as number) ?? 0.5;
    return {
      result: `(function() { vec2 center = vec2(${cx.toFixed(4)}, ${cy.toFixed(4)}); vec2 delta = ${inputs.uv ?? 'v_uv'} - center; float dist = length(delta); float twist = ${inputs.angle ?? '1.0'} * smoothstep(${inputs.radius ?? '0.5'}, 0.0, dist); float c = cos(twist); float s = sin(twist); return center + vec2(delta.x * c - delta.y * s, delta.x * s + delta.y * c); }())`,
    };
  },
};

// Pixelate Node - pixelate UV coordinates
export const PixelateNode: NodeDef = {
  type: 'distortion_pixelate',
  label: 'Pixelate',
  category: 'distortion',
  inputs: [
    { name: 'uv', type: 'vec2' },
    { name: 'pixels', type: 'float', default: 32 },
  ],
  outputs: [
    { name: 'result', type: 'vec2' },
  ],
  params: [],
  generateCode: (inputs) => ({
    result: `floor(${inputs.uv ?? 'v_uv'} * ${inputs.pixels ?? '32.0'}) / ${inputs.pixels ?? '32.0'}`,
  }),
};

// Swirl Node - swirl distortion
export const SwirlNode: NodeDef = {
  type: 'distortion_swirl',
  label: 'Swirl',
  category: 'distortion',
  inputs: [
    { name: 'uv', type: 'vec2' },
    { name: 'strength', type: 'float', default: 2 },
    { name: 'radius', type: 'float', default: 0.4 },
  ],
  outputs: [
    { name: 'result', type: 'vec2' },
  ],
  params: [
    { name: 'centerX', type: 'float', default: 0.5, min: 0, max: 1 },
    { name: 'centerY', type: 'float', default: 0.5, min: 0, max: 1 },
  ],
  generateCode: (inputs, params) => {
    const cx = (params.centerX as number) ?? 0.5;
    const cy = (params.centerY as number) ?? 0.5;
    return {
      result: `(function() { vec2 center = vec2(${cx.toFixed(4)}, ${cy.toFixed(4)}); vec2 delta = ${inputs.uv ?? 'v_uv'} - center; float dist = length(delta); float angle = atan(delta.y, delta.x); float swirl = ${inputs.strength ?? '2.0'} * (1.0 - smoothstep(0.0, ${inputs.radius ?? '0.4'}, dist)); angle += swirl; return center + vec2(cos(angle), sin(angle)) * dist; }())`,
    };
  },
};

// Export all distortion nodes
export const DistortionNodes: NodeDef[] = [
  WaveNode,
  RippleNode,
  DisplacementNode,
  TwistNode,
  PixelateNode,
  SwirlNode,
];
