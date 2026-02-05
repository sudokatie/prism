// Output node - final shader output

import type { NodeDef } from '@/lib/types';

// Output Node - writes final color to fragColor
export const OutputNode: NodeDef = {
  type: 'output',
  label: 'Output',
  category: 'output',
  inputs: [
    { name: 'color', type: 'vec3' },
    { name: 'alpha', type: 'float', default: 1 },
  ],
  outputs: [], // Terminal node, no outputs
  params: [],
  generateCode: (inputs) => {
    const color = inputs.color ?? 'vec3(0.0)';
    const alpha = inputs.alpha ?? '1.0';
    // Returns special __fragColor key that codegen handles
    return {
      __fragColor: `vec4(${color}, ${alpha})`,
    };
  },
};

// Export
export const OutputNodes: NodeDef[] = [
  OutputNode,
];
