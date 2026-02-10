// Color node definitions: RGB, HSV to RGB, Blend

import type { NodeDef } from '@/lib/types';

// RGB Node - constant color output with color picker parameter
export const RGBNode: NodeDef = {
  type: 'color_rgb',
  label: 'RGB',
  category: 'color',
  inputs: [],
  outputs: [
    { name: 'color', type: 'vec3' },
  ],
  params: [
    { name: 'color', type: 'color', default: [1, 1, 1] },
  ],
  generateCode: (_inputs, params) => {
    const color = (params.color as number[]) ?? [1, 1, 1];
    return {
      color: `vec3(${color[0].toFixed(4)}, ${color[1].toFixed(4)}, ${color[2].toFixed(4)})`,
    };
  },
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

// Levels Node - adjust black point, white point, gamma
export const LevelsNode: NodeDef = {
  type: 'color_levels',
  label: 'Levels',
  category: 'color',
  inputs: [
    { name: 'color', type: 'vec3' },
  ],
  outputs: [
    { name: 'color', type: 'vec3' },
  ],
  params: [
    { name: 'inBlack', type: 'float', default: 0, min: 0, max: 1 },
    { name: 'inWhite', type: 'float', default: 1, min: 0, max: 1 },
    { name: 'gamma', type: 'float', default: 1, min: 0.1, max: 3 },
    { name: 'outBlack', type: 'float', default: 0, min: 0, max: 1 },
    { name: 'outWhite', type: 'float', default: 1, min: 0, max: 1 },
  ],
  generateCode: (inputs, params) => {
    const c = inputs.color ?? 'vec3(0.0)';
    const inBlack = params.inBlack ?? 0;
    const inWhite = params.inWhite ?? 1;
    const gamma = params.gamma ?? 1;
    const outBlack = params.outBlack ?? 0;
    const outWhite = params.outWhite ?? 1;
    // Levels formula: out = outBlack + (outWhite - outBlack) * pow(clamp((in - inBlack) / (inWhite - inBlack), 0, 1), gamma)
    return {
      color: `(vec3(${outBlack}) + (vec3(${outWhite}) - vec3(${outBlack})) * pow(clamp((${c} - vec3(${inBlack})) / (vec3(${inWhite}) - vec3(${inBlack})), 0.0, 1.0), vec3(${gamma})))`,
    };
  },
};

// Brightness/Contrast Node
export const BrightnessContrastNode: NodeDef = {
  type: 'color_brightness_contrast',
  label: 'Brightness/Contrast',
  category: 'color',
  inputs: [
    { name: 'color', type: 'vec3' },
  ],
  outputs: [
    { name: 'color', type: 'vec3' },
  ],
  params: [
    { name: 'brightness', type: 'float', default: 0, min: -1, max: 1 },
    { name: 'contrast', type: 'float', default: 1, min: 0, max: 3 },
  ],
  generateCode: (inputs, params) => {
    const c = inputs.color ?? 'vec3(0.5)';
    const brightness = params.brightness ?? 0;
    const contrast = params.contrast ?? 1;
    // Contrast around 0.5, then brightness offset
    return {
      color: `clamp((${c} - 0.5) * ${contrast} + 0.5 + ${brightness}, 0.0, 1.0)`,
    };
  },
};

// Color Balance Node - shift RGB per tonal range
export const ColorBalanceNode: NodeDef = {
  type: 'color_balance',
  label: 'Color Balance',
  category: 'color',
  inputs: [
    { name: 'color', type: 'vec3' },
  ],
  outputs: [
    { name: 'color', type: 'vec3' },
  ],
  params: [
    { name: 'shadowsR', type: 'float', default: 0, min: -1, max: 1 },
    { name: 'shadowsG', type: 'float', default: 0, min: -1, max: 1 },
    { name: 'shadowsB', type: 'float', default: 0, min: -1, max: 1 },
    { name: 'midtonesR', type: 'float', default: 0, min: -1, max: 1 },
    { name: 'midtonesG', type: 'float', default: 0, min: -1, max: 1 },
    { name: 'midtonesB', type: 'float', default: 0, min: -1, max: 1 },
    { name: 'highlightsR', type: 'float', default: 0, min: -1, max: 1 },
    { name: 'highlightsG', type: 'float', default: 0, min: -1, max: 1 },
    { name: 'highlightsB', type: 'float', default: 0, min: -1, max: 1 },
  ],
  generateCode: (inputs, params) => {
    const c = inputs.color ?? 'vec3(0.5)';
    const sr = params.shadowsR ?? 0;
    const sg = params.shadowsG ?? 0;
    const sb = params.shadowsB ?? 0;
    const mr = params.midtonesR ?? 0;
    const mg = params.midtonesG ?? 0;
    const mb = params.midtonesB ?? 0;
    const hr = params.highlightsR ?? 0;
    const hg = params.highlightsG ?? 0;
    const hb = params.highlightsB ?? 0;
    return {
      color: `colorBalance(${c}, vec3(${sr}, ${sg}, ${sb}), vec3(${mr}, ${mg}, ${mb}), vec3(${hr}, ${hg}, ${hb}))`,
    };
  },
  helpers: ['colorBalance'],
};

// Vibrance Node - intelligent saturation
export const VibranceNode: NodeDef = {
  type: 'color_vibrance',
  label: 'Vibrance',
  category: 'color',
  inputs: [
    { name: 'color', type: 'vec3' },
  ],
  outputs: [
    { name: 'color', type: 'vec3' },
  ],
  params: [
    { name: 'vibrance', type: 'float', default: 0, min: -1, max: 1 },
    { name: 'saturation', type: 'float', default: 1, min: 0, max: 2 },
  ],
  generateCode: (inputs, params) => {
    const c = inputs.color ?? 'vec3(0.5)';
    const vibrance = params.vibrance ?? 0;
    const saturation = params.saturation ?? 1;
    // Vibrance affects less-saturated colors more
    return {
      color: `vibrance(${c}, ${vibrance}, ${saturation})`,
    };
  },
  helpers: ['vibrance'],
};

// Posterize Node - reduce color levels
export const PosterizeNode: NodeDef = {
  type: 'color_posterize',
  label: 'Posterize',
  category: 'color',
  inputs: [
    { name: 'color', type: 'vec3' },
  ],
  outputs: [
    { name: 'color', type: 'vec3' },
  ],
  params: [
    { name: 'levels', type: 'float', default: 8, min: 2, max: 32 },
  ],
  generateCode: (inputs, params) => {
    const c = inputs.color ?? 'vec3(0.5)';
    const levels = params.levels ?? 8;
    return {
      color: `floor(${c} * ${levels}) / ${levels}`,
    };
  },
};

// Export all color nodes
export const ColorNodes: NodeDef[] = [
  RGBNode,
  HSVToRGBNode,
  BlendNode,
  LevelsNode,
  BrightnessContrastNode,
  ColorBalanceNode,
  VibranceNode,
  PosterizeNode,
];
