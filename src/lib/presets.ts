/**
 * Preset shader library for Prism
 */
import type { Project, NodeInstance, Edge } from './types';
import { PROJECT_VERSION } from './project';

export type PresetCategory = 'patterns' | 'effects' | 'generators' | 'audio';

export interface Preset {
  id: string;
  name: string;
  description: string;
  category: PresetCategory;
  project: Project;
}

// Helper to create unique IDs
let idCounter = 0;
function uid(): string {
  return `preset_${++idCounter}`;
}

function resetIds(): void {
  idCounter = 0;
}

/**
 * Plasma Wave - classic demoscene effect
 */
const plasmaWave: Preset = {
  id: 'plasma-wave',
  name: 'Plasma Wave',
  description: 'Classic plasma effect with animated color waves',
  category: 'patterns',
  project: {
    version: PROJECT_VERSION,
    name: 'Plasma Wave',
    nodes: [
      { id: 'uv', type: 'UV', position: { x: 50, y: 100 }, params: {} },
      { id: 'time', type: 'Time', position: { x: 50, y: 250 }, params: {} },
      { id: 'sin1', type: 'Sin', position: { x: 250, y: 50 }, params: {} },
      { id: 'sin2', type: 'Sin', position: { x: 250, y: 150 }, params: {} },
      { id: 'add1', type: 'Add', position: { x: 450, y: 100 }, params: {} },
      { id: 'hsv', type: 'HSVtoRGB', position: { x: 650, y: 100 }, params: {} },
      { id: 'output', type: 'Output', position: { x: 850, y: 100 }, params: {} },
    ],
    edges: [
      { id: 'e1', source: 'uv', sourceHandle: 'uv', target: 'sin1', targetHandle: 'a' },
      { id: 'e2', source: 'time', sourceHandle: 'time', target: 'sin2', targetHandle: 'a' },
      { id: 'e3', source: 'sin1', sourceHandle: 'result', target: 'add1', targetHandle: 'a' },
      { id: 'e4', source: 'sin2', sourceHandle: 'result', target: 'add1', targetHandle: 'b' },
      { id: 'e5', source: 'add1', sourceHandle: 'result', target: 'hsv', targetHandle: 'h' },
      { id: 'e6', source: 'hsv', sourceHandle: 'rgb', target: 'output', targetHandle: 'color' },
    ],
  },
};

/**
 * Checkerboard - simple pattern
 */
const checkerboard: Preset = {
  id: 'checkerboard',
  name: 'Checkerboard',
  description: 'Simple animated checkerboard pattern',
  category: 'patterns',
  project: {
    version: PROJECT_VERSION,
    name: 'Checkerboard',
    nodes: [
      { id: 'uv', type: 'UV', position: { x: 50, y: 100 }, params: {} },
      { id: 'checker', type: 'Checker', position: { x: 250, y: 100 }, params: { scale: 8 } },
      { id: 'rgb', type: 'RGB', position: { x: 450, y: 100 }, params: {} },
      { id: 'output', type: 'Output', position: { x: 650, y: 100 }, params: {} },
    ],
    edges: [
      { id: 'e1', source: 'uv', sourceHandle: 'uv', target: 'checker', targetHandle: 'uv' },
      { id: 'e2', source: 'checker', sourceHandle: 'value', target: 'rgb', targetHandle: 'r' },
      { id: 'e3', source: 'checker', sourceHandle: 'value', target: 'rgb', targetHandle: 'g' },
      { id: 'e4', source: 'checker', sourceHandle: 'value', target: 'rgb', targetHandle: 'b' },
      { id: 'e5', source: 'rgb', sourceHandle: 'rgb', target: 'output', targetHandle: 'color' },
    ],
  },
};

/**
 * Noise Field - organic noise pattern
 */
const noiseField: Preset = {
  id: 'noise-field',
  name: 'Noise Field',
  description: 'Animated simplex noise with color gradient',
  category: 'patterns',
  project: {
    version: PROJECT_VERSION,
    name: 'Noise Field',
    nodes: [
      { id: 'uv', type: 'UV', position: { x: 50, y: 100 }, params: {} },
      { id: 'time', type: 'Time', position: { x: 50, y: 250 }, params: {} },
      { id: 'noise', type: 'Noise', position: { x: 250, y: 100 }, params: { scale: 4, octaves: 3 } },
      { id: 'gradient', type: 'Gradient', position: { x: 450, y: 100 }, params: {} },
      { id: 'output', type: 'Output', position: { x: 650, y: 100 }, params: {} },
    ],
    edges: [
      { id: 'e1', source: 'uv', sourceHandle: 'uv', target: 'noise', targetHandle: 'uv' },
      { id: 'e2', source: 'time', sourceHandle: 'time', target: 'noise', targetHandle: 'z' },
      { id: 'e3', source: 'noise', sourceHandle: 'value', target: 'gradient', targetHandle: 't' },
      { id: 'e4', source: 'gradient', sourceHandle: 'color', target: 'output', targetHandle: 'color' },
    ],
  },
};

/**
 * Radial Pulse - pulsing circles
 */
const radialPulse: Preset = {
  id: 'radial-pulse',
  name: 'Radial Pulse',
  description: 'Pulsing circular waves from center',
  category: 'effects',
  project: {
    version: PROJECT_VERSION,
    name: 'Radial Pulse',
    nodes: [
      { id: 'uv', type: 'UV', position: { x: 50, y: 100 }, params: {} },
      { id: 'time', type: 'Time', position: { x: 50, y: 250 }, params: {} },
      { id: 'circle', type: 'Circle', position: { x: 250, y: 100 }, params: { radius: 0.3, softness: 0.1 } },
      { id: 'sin', type: 'Sin', position: { x: 250, y: 250 }, params: {} },
      { id: 'add', type: 'Add', position: { x: 450, y: 150 }, params: {} },
      { id: 'fract', type: 'Fract', position: { x: 650, y: 150 }, params: {} },
      { id: 'hsv', type: 'HSVtoRGB', position: { x: 850, y: 150 }, params: {} },
      { id: 'output', type: 'Output', position: { x: 1050, y: 150 }, params: {} },
    ],
    edges: [
      { id: 'e1', source: 'uv', sourceHandle: 'uv', target: 'circle', targetHandle: 'uv' },
      { id: 'e2', source: 'time', sourceHandle: 'time', target: 'sin', targetHandle: 'a' },
      { id: 'e3', source: 'circle', sourceHandle: 'value', target: 'add', targetHandle: 'a' },
      { id: 'e4', source: 'sin', sourceHandle: 'result', target: 'add', targetHandle: 'b' },
      { id: 'e5', source: 'add', sourceHandle: 'result', target: 'fract', targetHandle: 'a' },
      { id: 'e6', source: 'fract', sourceHandle: 'result', target: 'hsv', targetHandle: 'h' },
      { id: 'e7', source: 'hsv', sourceHandle: 'rgb', target: 'output', targetHandle: 'color' },
    ],
  },
};

/**
 * Wave Distortion - ripple effect
 */
const waveDistortion: Preset = {
  id: 'wave-distortion',
  name: 'Wave Distortion',
  description: 'Animated wave distortion effect',
  category: 'effects',
  project: {
    version: PROJECT_VERSION,
    name: 'Wave Distortion',
    nodes: [
      { id: 'uv', type: 'UV', position: { x: 50, y: 100 }, params: {} },
      { id: 'time', type: 'Time', position: { x: 50, y: 250 }, params: {} },
      { id: 'wave', type: 'Wave', position: { x: 250, y: 100 }, params: { amplitude: 0.1, frequency: 10 } },
      { id: 'noise', type: 'Noise', position: { x: 450, y: 100 }, params: { scale: 2 } },
      { id: 'gradient', type: 'Gradient', position: { x: 650, y: 100 }, params: {} },
      { id: 'output', type: 'Output', position: { x: 850, y: 100 }, params: {} },
    ],
    edges: [
      { id: 'e1', source: 'uv', sourceHandle: 'uv', target: 'wave', targetHandle: 'uv' },
      { id: 'e2', source: 'time', sourceHandle: 'time', target: 'wave', targetHandle: 'time' },
      { id: 'e3', source: 'wave', sourceHandle: 'result', target: 'noise', targetHandle: 'uv' },
      { id: 'e4', source: 'noise', sourceHandle: 'value', target: 'gradient', targetHandle: 't' },
      { id: 'e5', source: 'gradient', sourceHandle: 'color', target: 'output', targetHandle: 'color' },
    ],
  },
};

/**
 * Pixelate - retro pixel effect
 */
const pixelate: Preset = {
  id: 'pixelate',
  name: 'Pixelate',
  description: 'Retro pixelated noise effect',
  category: 'effects',
  project: {
    version: PROJECT_VERSION,
    name: 'Pixelate',
    nodes: [
      { id: 'uv', type: 'UV', position: { x: 50, y: 100 }, params: {} },
      { id: 'time', type: 'Time', position: { x: 50, y: 250 }, params: {} },
      { id: 'pixelate', type: 'Pixelate', position: { x: 250, y: 100 }, params: { pixels: 32 } },
      { id: 'noise', type: 'Noise', position: { x: 450, y: 100 }, params: { scale: 5 } },
      { id: 'hsv', type: 'HSVtoRGB', position: { x: 650, y: 100 }, params: {} },
      { id: 'output', type: 'Output', position: { x: 850, y: 100 }, params: {} },
    ],
    edges: [
      { id: 'e1', source: 'uv', sourceHandle: 'uv', target: 'pixelate', targetHandle: 'uv' },
      { id: 'e2', source: 'pixelate', sourceHandle: 'result', target: 'noise', targetHandle: 'uv' },
      { id: 'e3', source: 'time', sourceHandle: 'time', target: 'noise', targetHandle: 'z' },
      { id: 'e4', source: 'noise', sourceHandle: 'value', target: 'hsv', targetHandle: 'h' },
      { id: 'e5', source: 'hsv', sourceHandle: 'rgb', target: 'output', targetHandle: 'color' },
    ],
  },
};

/**
 * Chromatic Shift - RGB split effect
 */
const chromaticShift: Preset = {
  id: 'chromatic-shift',
  name: 'Chromatic Shift',
  description: 'RGB channel separation with noise',
  category: 'effects',
  project: {
    version: PROJECT_VERSION,
    name: 'Chromatic Shift',
    nodes: [
      { id: 'uv', type: 'UV', position: { x: 50, y: 100 }, params: {} },
      { id: 'time', type: 'Time', position: { x: 50, y: 250 }, params: {} },
      { id: 'chromatic', type: 'ChromaticAberration', position: { x: 250, y: 100 }, params: { amount: 0.02, angle: 0 } },
      { id: 'noise', type: 'Noise', position: { x: 450, y: 100 }, params: { scale: 3 } },
      { id: 'gradient', type: 'Gradient', position: { x: 650, y: 100 }, params: {} },
      { id: 'output', type: 'Output', position: { x: 850, y: 100 }, params: {} },
    ],
    edges: [
      { id: 'e1', source: 'uv', sourceHandle: 'uv', target: 'chromatic', targetHandle: 'uv' },
      { id: 'e2', source: 'chromatic', sourceHandle: 'result', target: 'noise', targetHandle: 'uv' },
      { id: 'e3', source: 'time', sourceHandle: 'time', target: 'noise', targetHandle: 'z' },
      { id: 'e4', source: 'noise', sourceHandle: 'value', target: 'gradient', targetHandle: 't' },
      { id: 'e5', source: 'gradient', sourceHandle: 'color', target: 'output', targetHandle: 'color' },
    ],
  },
};

/**
 * Fractal Noise - multi-octave noise
 */
const fractalNoise: Preset = {
  id: 'fractal-noise',
  name: 'Fractal Noise',
  description: 'Multi-octave fractal brownian motion',
  category: 'generators',
  project: {
    version: PROJECT_VERSION,
    name: 'Fractal Noise',
    nodes: [
      { id: 'uv', type: 'UV', position: { x: 50, y: 100 }, params: {} },
      { id: 'time', type: 'Time', position: { x: 50, y: 250 }, params: {} },
      { id: 'noise', type: 'Noise', position: { x: 250, y: 100 }, params: { scale: 2, octaves: 6 } },
      { id: 'mul', type: 'Multiply', position: { x: 450, y: 100 }, params: {} },
      { id: 'rgb', type: 'RGB', position: { x: 650, y: 100 }, params: {} },
      { id: 'output', type: 'Output', position: { x: 850, y: 100 }, params: {} },
    ],
    edges: [
      { id: 'e1', source: 'uv', sourceHandle: 'uv', target: 'noise', targetHandle: 'uv' },
      { id: 'e2', source: 'time', sourceHandle: 'time', target: 'noise', targetHandle: 'z' },
      { id: 'e3', source: 'noise', sourceHandle: 'value', target: 'mul', targetHandle: 'a' },
      { id: 'e4', source: 'mul', sourceHandle: 'result', target: 'rgb', targetHandle: 'r' },
      { id: 'e5', source: 'mul', sourceHandle: 'result', target: 'rgb', targetHandle: 'g' },
      { id: 'e6', source: 'mul', sourceHandle: 'result', target: 'rgb', targetHandle: 'b' },
      { id: 'e7', source: 'rgb', sourceHandle: 'rgb', target: 'output', targetHandle: 'color' },
    ],
  },
};

/**
 * Voronoi Cells - cellular pattern
 */
const voronoiCells: Preset = {
  id: 'voronoi-cells',
  name: 'Voronoi Cells',
  description: 'Animated cellular pattern with color',
  category: 'generators',
  project: {
    version: PROJECT_VERSION,
    name: 'Voronoi Cells',
    nodes: [
      { id: 'uv', type: 'UV', position: { x: 50, y: 100 }, params: {} },
      { id: 'time', type: 'Time', position: { x: 50, y: 250 }, params: {} },
      { id: 'mul', type: 'Multiply', position: { x: 250, y: 100 }, params: {} },
      { id: 'noise1', type: 'Noise', position: { x: 450, y: 50 }, params: { scale: 8, octaves: 1 } },
      { id: 'noise2', type: 'Noise', position: { x: 450, y: 200 }, params: { scale: 6, octaves: 2 } },
      { id: 'step', type: 'Step', position: { x: 650, y: 100 }, params: { edge: 0.5 } },
      { id: 'hsv', type: 'HSVtoRGB', position: { x: 850, y: 100 }, params: {} },
      { id: 'output', type: 'Output', position: { x: 1050, y: 100 }, params: {} },
    ],
    edges: [
      { id: 'e1', source: 'uv', sourceHandle: 'uv', target: 'mul', targetHandle: 'a' },
      { id: 'e2', source: 'mul', sourceHandle: 'result', target: 'noise1', targetHandle: 'uv' },
      { id: 'e3', source: 'time', sourceHandle: 'time', target: 'noise1', targetHandle: 'z' },
      { id: 'e4', source: 'mul', sourceHandle: 'result', target: 'noise2', targetHandle: 'uv' },
      { id: 'e5', source: 'noise1', sourceHandle: 'value', target: 'step', targetHandle: 'x' },
      { id: 'e6', source: 'noise2', sourceHandle: 'value', target: 'step', targetHandle: 'edge' },
      { id: 'e7', source: 'step', sourceHandle: 'result', target: 'hsv', targetHandle: 'h' },
      { id: 'e8', source: 'noise1', sourceHandle: 'value', target: 'hsv', targetHandle: 's' },
      { id: 'e9', source: 'hsv', sourceHandle: 'rgb', target: 'output', targetHandle: 'color' },
    ],
  },
};

/**
 * Gradient Flow - smooth color transitions
 */
const gradientFlow: Preset = {
  id: 'gradient-flow',
  name: 'Gradient Flow',
  description: 'Smooth animated color gradient',
  category: 'generators',
  project: {
    version: PROJECT_VERSION,
    name: 'Gradient Flow',
    nodes: [
      { id: 'uv', type: 'UV', position: { x: 50, y: 100 }, params: {} },
      { id: 'time', type: 'Time', position: { x: 50, y: 250 }, params: {} },
      { id: 'sin', type: 'Sin', position: { x: 250, y: 100 }, params: {} },
      { id: 'cos', type: 'Cos', position: { x: 250, y: 200 }, params: {} },
      { id: 'add', type: 'Add', position: { x: 450, y: 150 }, params: {} },
      { id: 'smoothstep', type: 'Smoothstep', position: { x: 650, y: 150 }, params: { edge0: 0, edge1: 1 } },
      { id: 'hsv', type: 'HSVtoRGB', position: { x: 850, y: 150 }, params: {} },
      { id: 'output', type: 'Output', position: { x: 1050, y: 150 }, params: {} },
    ],
    edges: [
      { id: 'e1', source: 'uv', sourceHandle: 'uv', target: 'sin', targetHandle: 'a' },
      { id: 'e2', source: 'time', sourceHandle: 'time', target: 'cos', targetHandle: 'a' },
      { id: 'e3', source: 'sin', sourceHandle: 'result', target: 'add', targetHandle: 'a' },
      { id: 'e4', source: 'cos', sourceHandle: 'result', target: 'add', targetHandle: 'b' },
      { id: 'e5', source: 'add', sourceHandle: 'result', target: 'smoothstep', targetHandle: 'x' },
      { id: 'e6', source: 'smoothstep', sourceHandle: 'result', target: 'hsv', targetHandle: 'h' },
      { id: 'e7', source: 'hsv', sourceHandle: 'rgb', target: 'output', targetHandle: 'color' },
    ],
  },
};

/**
 * Twist - spiral distortion
 */
const twist: Preset = {
  id: 'twist',
  name: 'Twist',
  description: 'Spiral twist distortion with noise',
  category: 'effects',
  project: {
    version: PROJECT_VERSION,
    name: 'Twist',
    nodes: [
      { id: 'uv', type: 'UV', position: { x: 50, y: 100 }, params: {} },
      { id: 'time', type: 'Time', position: { x: 50, y: 250 }, params: {} },
      { id: 'twist', type: 'Twist', position: { x: 250, y: 100 }, params: { amount: 2 } },
      { id: 'noise', type: 'Noise', position: { x: 450, y: 100 }, params: { scale: 3 } },
      { id: 'gradient', type: 'Gradient', position: { x: 650, y: 100 }, params: {} },
      { id: 'output', type: 'Output', position: { x: 850, y: 100 }, params: {} },
    ],
    edges: [
      { id: 'e1', source: 'uv', sourceHandle: 'uv', target: 'twist', targetHandle: 'uv' },
      { id: 'e2', source: 'time', sourceHandle: 'time', target: 'twist', targetHandle: 'time' },
      { id: 'e3', source: 'twist', sourceHandle: 'result', target: 'noise', targetHandle: 'uv' },
      { id: 'e4', source: 'noise', sourceHandle: 'value', target: 'gradient', targetHandle: 't' },
      { id: 'e5', source: 'gradient', sourceHandle: 'color', target: 'output', targetHandle: 'color' },
    ],
  },
};

/**
 * Vignette Glow - glowing vignette effect
 */
const vignetteGlow: Preset = {
  id: 'vignette-glow',
  name: 'Vignette Glow',
  description: 'Pulsing vignette with color glow',
  category: 'effects',
  project: {
    version: PROJECT_VERSION,
    name: 'Vignette Glow',
    nodes: [
      { id: 'uv', type: 'UV', position: { x: 50, y: 100 }, params: {} },
      { id: 'time', type: 'Time', position: { x: 50, y: 250 }, params: {} },
      { id: 'vignette', type: 'Vignette', position: { x: 250, y: 100 }, params: { amount: 0.6, softness: 0.5 } },
      { id: 'sin', type: 'Sin', position: { x: 250, y: 250 }, params: {} },
      { id: 'add', type: 'Add', position: { x: 450, y: 150 }, params: {} },
      { id: 'hsv', type: 'HSVtoRGB', position: { x: 650, y: 150 }, params: {} },
      { id: 'output', type: 'Output', position: { x: 850, y: 150 }, params: {} },
    ],
    edges: [
      { id: 'e1', source: 'uv', sourceHandle: 'uv', target: 'vignette', targetHandle: 'uv' },
      { id: 'e2', source: 'time', sourceHandle: 'time', target: 'sin', targetHandle: 'a' },
      { id: 'e3', source: 'vignette', sourceHandle: 'value', target: 'add', targetHandle: 'a' },
      { id: 'e4', source: 'sin', sourceHandle: 'result', target: 'add', targetHandle: 'b' },
      { id: 'e5', source: 'add', sourceHandle: 'result', target: 'hsv', targetHandle: 'h' },
      { id: 'e6', source: 'vignette', sourceHandle: 'value', target: 'hsv', targetHandle: 'v' },
      { id: 'e7', source: 'hsv', sourceHandle: 'rgb', target: 'output', targetHandle: 'color' },
    ],
  },
};

/**
 * Bass Pulse - pulses based on bass frequencies
 */
const bassPulse: Preset = {
  id: 'bass-pulse',
  name: 'Bass Pulse',
  description: 'Pulsing circles driven by bass frequencies',
  category: 'audio',
  project: {
    version: PROJECT_VERSION,
    name: 'Bass Pulse',
    nodes: [
      { id: 'uv', type: 'UV', position: { x: 50, y: 100 }, params: {} },
      { id: 'audio', type: 'AudioInput', position: { x: 50, y: 250 }, params: { smoothing: 0.8, gain: 1.0 } },
      { id: 'circle', type: 'Circle', position: { x: 250, y: 100 }, params: { radius: 0.3, softness: 0.2 } },
      { id: 'mul', type: 'Multiply', position: { x: 450, y: 150 }, params: {} },
      { id: 'hsv', type: 'HSVtoRGB', position: { x: 650, y: 150 }, params: {} },
      { id: 'output', type: 'Output', position: { x: 850, y: 150 }, params: {} },
    ],
    edges: [
      { id: 'e1', source: 'uv', sourceHandle: 'uv', target: 'circle', targetHandle: 'uv' },
      { id: 'e2', source: 'audio', sourceHandle: 'bass', target: 'circle', targetHandle: 'radius' },
      { id: 'e3', source: 'circle', sourceHandle: 'value', target: 'mul', targetHandle: 'a' },
      { id: 'e4', source: 'audio', sourceHandle: 'volume', target: 'mul', targetHandle: 'b' },
      { id: 'e5', source: 'mul', sourceHandle: 'result', target: 'hsv', targetHandle: 'h' },
      { id: 'e6', source: 'audio', sourceHandle: 'bass', target: 'hsv', targetHandle: 'v' },
      { id: 'e7', source: 'hsv', sourceHandle: 'rgb', target: 'output', targetHandle: 'color' },
    ],
  },
};

/**
 * Spectrum Bars - visualizes FFT bands as color gradient
 */
const spectrumBars: Preset = {
  id: 'spectrum-bars',
  name: 'Spectrum Bars',
  description: 'Frequency spectrum visualization with color mapping',
  category: 'audio',
  project: {
    version: PROJECT_VERSION,
    name: 'Spectrum Bars',
    nodes: [
      { id: 'uv', type: 'UV', position: { x: 50, y: 100 }, params: {} },
      { id: 'fft', type: 'FFTBands', position: { x: 50, y: 250 }, params: {} },
      { id: 'add1', type: 'Add', position: { x: 250, y: 100 }, params: {} },
      { id: 'add2', type: 'Add', position: { x: 250, y: 200 }, params: {} },
      { id: 'add3', type: 'Add', position: { x: 450, y: 150 }, params: {} },
      { id: 'gradient', type: 'Gradient', position: { x: 650, y: 150 }, params: {} },
      { id: 'output', type: 'Output', position: { x: 850, y: 150 }, params: {} },
    ],
    edges: [
      { id: 'e1', source: 'fft', sourceHandle: 'band0', target: 'add1', targetHandle: 'a' },
      { id: 'e2', source: 'fft', sourceHandle: 'band1', target: 'add1', targetHandle: 'b' },
      { id: 'e3', source: 'fft', sourceHandle: 'band2', target: 'add2', targetHandle: 'a' },
      { id: 'e4', source: 'fft', sourceHandle: 'band3', target: 'add2', targetHandle: 'b' },
      { id: 'e5', source: 'add1', sourceHandle: 'result', target: 'add3', targetHandle: 'a' },
      { id: 'e6', source: 'add2', sourceHandle: 'result', target: 'add3', targetHandle: 'b' },
      { id: 'e7', source: 'add3', sourceHandle: 'result', target: 'gradient', targetHandle: 't' },
      { id: 'e8', source: 'gradient', sourceHandle: 'color', target: 'output', targetHandle: 'color' },
    ],
  },
};

/**
 * Beat Flash - flashes on beat detection
 */
const beatFlash: Preset = {
  id: 'beat-flash',
  name: 'Beat Flash',
  description: 'Stroboscopic flash synced to beat detection',
  category: 'audio',
  project: {
    version: PROJECT_VERSION,
    name: 'Beat Flash',
    nodes: [
      { id: 'beat', type: 'BeatDetector', position: { x: 50, y: 100 }, params: { decay: 0.9 } },
      { id: 'time', type: 'Time', position: { x: 50, y: 250 }, params: {} },
      { id: 'mul', type: 'Multiply', position: { x: 250, y: 100 }, params: {} },
      { id: 'hsv', type: 'HSVtoRGB', position: { x: 450, y: 100 }, params: {} },
      { id: 'output', type: 'Output', position: { x: 650, y: 100 }, params: {} },
    ],
    edges: [
      { id: 'e1', source: 'beat', sourceHandle: 'beat', target: 'mul', targetHandle: 'a' },
      { id: 'e2', source: 'time', sourceHandle: 'time', target: 'hsv', targetHandle: 'h' },
      { id: 'e3', source: 'mul', sourceHandle: 'result', target: 'hsv', targetHandle: 'v' },
      { id: 'e4', source: 'hsv', sourceHandle: 'rgb', target: 'output', targetHandle: 'color' },
    ],
  },
};

/**
 * Audio Wave - modulates wave pattern based on volume
 */
const audioWave: Preset = {
  id: 'audio-wave',
  name: 'Audio Wave',
  description: 'Wave distortion driven by audio volume',
  category: 'audio',
  project: {
    version: PROJECT_VERSION,
    name: 'Audio Wave',
    nodes: [
      { id: 'uv', type: 'UV', position: { x: 50, y: 100 }, params: {} },
      { id: 'volume', type: 'Volume', position: { x: 50, y: 250 }, params: {} },
      { id: 'time', type: 'Time', position: { x: 50, y: 400 }, params: {} },
      { id: 'wave', type: 'Wave', position: { x: 250, y: 100 }, params: { amplitude: 0.1, frequency: 8 } },
      { id: 'noise', type: 'Noise', position: { x: 450, y: 100 }, params: { scale: 3 } },
      { id: 'mul', type: 'Multiply', position: { x: 650, y: 150 }, params: {} },
      { id: 'gradient', type: 'Gradient', position: { x: 850, y: 150 }, params: {} },
      { id: 'output', type: 'Output', position: { x: 1050, y: 150 }, params: {} },
    ],
    edges: [
      { id: 'e1', source: 'uv', sourceHandle: 'uv', target: 'wave', targetHandle: 'uv' },
      { id: 'e2', source: 'volume', sourceHandle: 'level', target: 'wave', targetHandle: 'amplitude' },
      { id: 'e3', source: 'time', sourceHandle: 'time', target: 'wave', targetHandle: 'time' },
      { id: 'e4', source: 'wave', sourceHandle: 'result', target: 'noise', targetHandle: 'uv' },
      { id: 'e5', source: 'noise', sourceHandle: 'value', target: 'mul', targetHandle: 'a' },
      { id: 'e6', source: 'volume', sourceHandle: 'peak', target: 'mul', targetHandle: 'b' },
      { id: 'e7', source: 'mul', sourceHandle: 'result', target: 'gradient', targetHandle: 't' },
      { id: 'e8', source: 'gradient', sourceHandle: 'color', target: 'output', targetHandle: 'color' },
    ],
  },
};

/**
 * Frequency Rainbow - maps FFT bands to rainbow colors
 */
const frequencyRainbow: Preset = {
  id: 'frequency-rainbow',
  name: 'Frequency Rainbow',
  description: 'Rainbow visualization driven by frequency bands',
  category: 'audio',
  project: {
    version: PROJECT_VERSION,
    name: 'Frequency Rainbow',
    nodes: [
      { id: 'uv', type: 'UV', position: { x: 50, y: 100 }, params: {} },
      { id: 'audio', type: 'AudioInput', position: { x: 50, y: 300 }, params: { smoothing: 0.7, gain: 1.2 } },
      { id: 'time', type: 'Time', position: { x: 50, y: 450 }, params: {} },
      { id: 'sin', type: 'Sin', position: { x: 250, y: 100 }, params: {} },
      { id: 'add', type: 'Add', position: { x: 450, y: 100 }, params: {} },
      { id: 'hsv', type: 'HSVtoRGB', position: { x: 650, y: 150 }, params: {} },
      { id: 'output', type: 'Output', position: { x: 850, y: 150 }, params: {} },
    ],
    edges: [
      { id: 'e1', source: 'uv', sourceHandle: 'uv', target: 'sin', targetHandle: 'a' },
      { id: 'e2', source: 'sin', sourceHandle: 'result', target: 'add', targetHandle: 'a' },
      { id: 'e3', source: 'time', sourceHandle: 'time', target: 'add', targetHandle: 'b' },
      { id: 'e4', source: 'add', sourceHandle: 'result', target: 'hsv', targetHandle: 'h' },
      { id: 'e5', source: 'audio', sourceHandle: 'treble', target: 'hsv', targetHandle: 's' },
      { id: 'e6', source: 'audio', sourceHandle: 'volume', target: 'hsv', targetHandle: 'v' },
      { id: 'e7', source: 'hsv', sourceHandle: 'rgb', target: 'output', targetHandle: 'color' },
    ],
  },
};

/**
 * All built-in presets
 */
export const PRESETS: Preset[] = [
  plasmaWave,
  checkerboard,
  noiseField,
  radialPulse,
  waveDistortion,
  pixelate,
  chromaticShift,
  fractalNoise,
  voronoiCells,
  gradientFlow,
  twist,
  vignetteGlow,
  bassPulse,
  spectrumBars,
  beatFlash,
  audioWave,
  frequencyRainbow,
];

/**
 * Get all presets
 */
export function getAllPresets(): Preset[] {
  return PRESETS;
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: PresetCategory): Preset[] {
  return PRESETS.filter(p => p.category === category);
}

/**
 * Get preset by ID
 */
export function getPresetById(id: string): Preset | undefined {
  return PRESETS.find(p => p.id === id);
}

/**
 * Get all categories with counts
 */
export function getCategories(): { category: PresetCategory; count: number }[] {
  const categories: PresetCategory[] = ['patterns', 'effects', 'generators', 'audio'];
  return categories.map(category => ({
    category,
    count: getPresetsByCategory(category).length,
  }));
}

/**
 * Clone preset project with fresh IDs
 */
export function clonePresetProject(preset: Preset): Project {
  resetIds();
  const idMap = new Map<string, string>();

  // Clone nodes with new IDs
  const nodes: NodeInstance[] = preset.project.nodes.map(node => {
    const newId = uid();
    idMap.set(node.id, newId);
    return {
      ...node,
      id: newId,
      params: { ...node.params },
      position: { ...node.position },
    };
  });

  // Clone edges with updated references
  const edges: Edge[] = preset.project.edges.map(edge => ({
    ...edge,
    id: uid(),
    source: idMap.get(edge.source) || edge.source,
    target: idMap.get(edge.target) || edge.target,
  }));

  return {
    version: PROJECT_VERSION,
    name: preset.name,
    nodes,
    edges,
  };
}

/**
 * Search presets by name or description
 */
export function searchPresets(query: string): Preset[] {
  const q = query.toLowerCase();
  return PRESETS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q)
  );
}
