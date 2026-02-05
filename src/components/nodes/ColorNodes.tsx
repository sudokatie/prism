// Color node definitions: RGB, HSV to RGB, Blend

import type { NodeDef } from '@/lib/types';

// RGB Node - creates a color from RGB components
export const RGBNode: NodeDef = {
  type: 'color_rgb',
  label: 'RGB',
  category: 'color',
  inputs: [
    { name: 'r', type: 'float', default: 1 },
    { name: 'g', type: 'float', default: 1 },
    { name: 'b', type: 'float', default: 1 },
  ],
  outputs: [
    { name: 'color', type: 'vec3' },
  ],
  params: [],
  generateCode: (inputs) => ({
    color: `vec3(${inputs.r ?? '1.0'}, ${inputs.g ?? '1.0'}, ${inputs.b ?? '1.0'})`,
  }),
};

// HSV to RGB Node - converts HSV to RGB
export const HSVToRGBNode: NodeDef = {
  type: 'color_hsv_to_rgb',
  label: 'HSV to RGB',
  category: 'color',
  inputs: [
    { name: 'h', type: 'float', default: 0 },
    { name: 's', type: 'float', default: 1 },
    { name: 'v', type: 'float', default: 1 },
  ],
  outputs: [
    { name: 'color', type: 'vec3' },
  ],
  params: [],
  helpers: ['hsv2rgb'],
  generateCode: (inputs) => ({
    color: `hsv2rgb(vec3(${inputs.h ?? '0.0'}, ${inputs.s ?? '1.0'}, ${inputs.v ?? '1.0'}))`,
  }),
};

// Blend Node - blends two colors
export const BlendNode: NodeDef = {
  type: 'color_blend',
  label: 'Blend',
  category: 'color',
  inputs: [
    { name: 'color1', type: 'vec3' },
    { name: 'color2', type: 'vec3' },
    { name: 'factor', type: 'float', default: 0.5 },
  ],
  outputs: [
    { name: 'color', type: 'vec3' },
  ],
  params: [
    { name: 'mode', type: 'select', default: 'mix', options: [
      { label: 'Mix', value: 'mix' },
      { label: 'Add', value: 'add' },
      { label: 'Multiply', value: 'multiply' },
      { label: 'Screen', value: 'screen' },
      { label: 'Overlay', value: 'overlay' },
    ]},
  ],
  generateCode: (inputs, params) => {
    const c1 = inputs.color1 ?? 'vec3(0.0)';
    const c2 = inputs.color2 ?? 'vec3(1.0)';
    const factor = inputs.factor ?? '0.5';
    const mode = params.mode ?? 'mix';
    
    switch (mode) {
      case 'add':
        return { color: `(${c1} + ${c2} * ${factor})` };
      case 'multiply':
        return { color: `mix(${c1}, ${c1} * ${c2}, ${factor})` };
      case 'screen':
        return { color: `mix(${c1}, vec3(1.0) - (vec3(1.0) - ${c1}) * (vec3(1.0) - ${c2}), ${factor})` };
      case 'overlay':
        return { color: `mix(${c1}, ${c1} * (${c1} + 2.0 * ${c2} * (vec3(1.0) - ${c1})), ${factor})` };
      case 'mix':
      default:
        return { color: `mix(${c1}, ${c2}, ${factor})` };
    }
  },
};

// Export all color nodes
export const ColorNodes: NodeDef[] = [
  RGBNode,
  HSVToRGBNode,
  BlendNode,
];
