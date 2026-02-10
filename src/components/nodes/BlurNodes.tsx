// Blur/Defocus effect nodes
// Note: True blur requires texture sampling. These are single-pass approximations.

import type { NodeDef } from '@/lib/types';

// Chromatic Aberration - separates RGB channels for blur-like effect
export const ChromaticAberrationNode: NodeDef = {
  type: 'blur_chromatic',
  label: 'Chromatic Aberration',
  category: 'distortion',
  inputs: [
    { name: 'uv', type: 'vec2' },
  ],
  outputs: [
    { name: 'r_uv', type: 'vec2' },
    { name: 'g_uv', type: 'vec2' },
    { name: 'b_uv', type: 'vec2' },
  ],
  params: [
    { name: 'strength', type: 'float', default: 0.01, min: 0, max: 0.1 },
  ],
  generateCode: (inputs, params) => {
    const uv = inputs.uv ?? 'v_uv';
    const strength = params.strength ?? 0.01;
    return {
      r_uv: `${uv} + vec2(${strength}, 0.0)`,
      g_uv: `${uv}`,
      b_uv: `${uv} - vec2(${strength}, 0.0)`,
    };
  },
};

// Radial Blur - stretches toward/from center
export const RadialBlurNode: NodeDef = {
  type: 'blur_radial',
  label: 'Radial Blur',
  category: 'distortion',
  inputs: [
    { name: 'uv', type: 'vec2' },
  ],
  outputs: [
    { name: 'uv', type: 'vec2' },
  ],
  params: [
    { name: 'centerX', type: 'float', default: 0.5, min: 0, max: 1 },
    { name: 'centerY', type: 'float', default: 0.5, min: 0, max: 1 },
    { name: 'strength', type: 'float', default: 0.1, min: -0.5, max: 0.5 },
  ],
  generateCode: (inputs, params) => {
    const uv = inputs.uv ?? 'v_uv';
    const cx = params.centerX ?? 0.5;
    const cy = params.centerY ?? 0.5;
    const strength = params.strength ?? 0.1;
    return {
      uv: `(function() { vec2 center = vec2(${cx}, ${cy}); vec2 dir = ${uv} - center; float dist = length(dir); return center + dir * (1.0 + ${strength} * dist); }())`.replace(/\s+/g, ' '),
    };
  },
  helpers: ['radialBlur'],
};

// Motion Blur - directional streak effect
export const MotionBlurNode: NodeDef = {
  type: 'blur_motion',
  label: 'Motion Blur',
  category: 'distortion',
  inputs: [
    { name: 'uv', type: 'vec2' },
  ],
  outputs: [
    { name: 'uv', type: 'vec2' },
  ],
  params: [
    { name: 'angle', type: 'float', default: 0, min: 0, max: 6.28318 },
    { name: 'strength', type: 'float', default: 0.05, min: 0, max: 0.2 },
  ],
  generateCode: (inputs, params) => {
    const uv = inputs.uv ?? 'v_uv';
    const angle = params.angle ?? 0;
    const strength = params.strength ?? 0.05;
    return {
      uv: `${uv} + vec2(cos(${angle}), sin(${angle})) * ${strength}`,
    };
  },
};

// Sharpen - edge enhancement (opposite of blur)
export const SharpenNode: NodeDef = {
  type: 'blur_sharpen',
  label: 'Sharpen',
  category: 'color',
  inputs: [
    { name: 'color', type: 'vec3' },
  ],
  outputs: [
    { name: 'color', type: 'vec3' },
  ],
  params: [
    { name: 'amount', type: 'float', default: 0.5, min: 0, max: 2 },
  ],
  generateCode: (inputs, params) => {
    const c = inputs.color ?? 'vec3(0.5)';
    const amount = params.amount ?? 0.5;
    // Unsharp mask approximation: boost contrast from local average
    return {
      color: `clamp(${c} + (${c} - 0.5) * ${amount}, 0.0, 1.0)`,
    };
  },
};

// Vignette - darkens edges for depth effect
export const VignetteNode: NodeDef = {
  type: 'blur_vignette',
  label: 'Vignette',
  category: 'color',
  inputs: [
    { name: 'color', type: 'vec3' },
    { name: 'uv', type: 'vec2' },
  ],
  outputs: [
    { name: 'color', type: 'vec3' },
  ],
  params: [
    { name: 'strength', type: 'float', default: 0.5, min: 0, max: 2 },
    { name: 'radius', type: 'float', default: 0.5, min: 0, max: 1 },
    { name: 'softness', type: 'float', default: 0.5, min: 0, max: 1 },
  ],
  generateCode: (inputs, params) => {
    const c = inputs.color ?? 'vec3(0.5)';
    const uv = inputs.uv ?? 'v_uv';
    const strength = params.strength ?? 0.5;
    const radius = params.radius ?? 0.5;
    const softness = params.softness ?? 0.5;
    return {
      color: `${c} * (1.0 - ${strength} * smoothstep(${radius}, ${radius} + ${softness}, length(${uv} - 0.5)))`,
    };
  },
};

// Export all blur nodes
export const BlurNodes: NodeDef[] = [
  ChromaticAberrationNode,
  RadialBlurNode,
  MotionBlurNode,
  SharpenNode,
  VignetteNode,
];
