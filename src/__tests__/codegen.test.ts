import { UVNode, TimeNode, MouseNode, ResolutionNode } from '../components/nodes/InputNodes';
import { AddNode, MultiplyNode, SinNode, CosNode, MixNode, SmoothstepNode, StepNode, FractNode } from '../components/nodes/MathNodes';
import { NoiseNode, CircleNode, CheckerNode, GradientNode } from '../components/nodes/PatternNodes';
import { RGBNode, HSVToRGBNode, BlendNode } from '../components/nodes/ColorNodes';
import { OutputNode } from '../components/nodes/OutputNode';

describe('Input Nodes', () => {
  describe('UVNode', () => {
    it('should have correct metadata', () => {
      expect(UVNode.type).toBe('input_uv');
      expect(UVNode.label).toBe('UV');
      expect(UVNode.category).toBe('input');
      expect(UVNode.inputs).toHaveLength(0);
      expect(UVNode.outputs).toHaveLength(3);
    });

    it('should generate correct code', () => {
      const code = UVNode.generateCode({}, {});
      expect(code.uv).toBe('v_uv');
      expect(code.x).toBe('v_uv.x');
      expect(code.y).toBe('v_uv.y');
    });

    it('should have vec2 and float outputs', () => {
      expect(UVNode.outputs[0]).toEqual({ name: 'uv', type: 'vec2' });
      expect(UVNode.outputs[1]).toEqual({ name: 'x', type: 'float' });
      expect(UVNode.outputs[2]).toEqual({ name: 'y', type: 'float' });
    });
  });

  describe('TimeNode', () => {
    it('should have correct metadata', () => {
      expect(TimeNode.type).toBe('input_time');
      expect(TimeNode.label).toBe('Time');
      expect(TimeNode.category).toBe('input');
      expect(TimeNode.inputs).toHaveLength(0);
      expect(TimeNode.outputs).toHaveLength(3);
      expect(TimeNode.params).toHaveLength(1);
    });

    it('should generate correct code with default speed', () => {
      const code = TimeNode.generateCode({}, {});
      expect(code.time).toBe('u_time');
      expect(code.sin).toBe('sin(u_time)');
      expect(code.cos).toBe('cos(u_time)');
    });

    it('should generate correct code with custom speed', () => {
      const code = TimeNode.generateCode({}, { speed: 2.0 });
      expect(code.time).toBe('(u_time * 2.0000)');
      expect(code.sin).toBe('sin((u_time * 2.0000))');
      expect(code.cos).toBe('cos((u_time * 2.0000))');
    });

    it('should have speed parameter', () => {
      expect(TimeNode.params[0].name).toBe('speed');
      expect(TimeNode.params[0].type).toBe('float');
      expect(TimeNode.params[0].default).toBe(1.0);
    });
  });

  describe('MouseNode', () => {
    it('should have correct metadata', () => {
      expect(MouseNode.type).toBe('input_mouse');
      expect(MouseNode.label).toBe('Mouse');
      expect(MouseNode.category).toBe('input');
      expect(MouseNode.inputs).toHaveLength(0);
      expect(MouseNode.outputs).toHaveLength(3);
    });

    it('should generate correct code', () => {
      const code = MouseNode.generateCode({}, {});
      expect(code.position).toBe('u_mouse');
      expect(code.x).toBe('u_mouse.x');
      expect(code.y).toBe('u_mouse.y');
    });

    it('should have vec2 and float outputs', () => {
      expect(MouseNode.outputs[0]).toEqual({ name: 'position', type: 'vec2' });
      expect(MouseNode.outputs[1]).toEqual({ name: 'x', type: 'float' });
      expect(MouseNode.outputs[2]).toEqual({ name: 'y', type: 'float' });
    });
  });

  describe('ResolutionNode', () => {
    it('should have correct metadata', () => {
      expect(ResolutionNode.type).toBe('input_resolution');
      expect(ResolutionNode.label).toBe('Resolution');
      expect(ResolutionNode.category).toBe('input');
      expect(ResolutionNode.inputs).toHaveLength(0);
      expect(ResolutionNode.outputs).toHaveLength(4);
    });

    it('should generate correct code', () => {
      const code = ResolutionNode.generateCode({}, {});
      expect(code.size).toBe('u_resolution');
      expect(code.width).toBe('u_resolution.x');
      expect(code.height).toBe('u_resolution.y');
      expect(code.aspect).toBe('(u_resolution.x / u_resolution.y)');
    });

    it('should have vec2 and float outputs', () => {
      expect(ResolutionNode.outputs[0]).toEqual({ name: 'size', type: 'vec2' });
      expect(ResolutionNode.outputs[1]).toEqual({ name: 'width', type: 'float' });
      expect(ResolutionNode.outputs[2]).toEqual({ name: 'height', type: 'float' });
      expect(ResolutionNode.outputs[3]).toEqual({ name: 'aspect', type: 'float' });
    });
  });
});

describe('Math Nodes', () => {
  describe('AddNode', () => {
    it('should have correct metadata', () => {
      expect(AddNode.type).toBe('math_add');
      expect(AddNode.category).toBe('math');
      expect(AddNode.inputs).toHaveLength(2);
      expect(AddNode.outputs).toHaveLength(1);
    });

    it('should generate correct code', () => {
      const code = AddNode.generateCode({ a: 'x', b: 'y' }, {});
      expect(code.result).toBe('(x + y)');
    });

    it('should use defaults for missing inputs', () => {
      const code = AddNode.generateCode({}, {});
      expect(code.result).toBe('(0.0 + 0.0)');
    });
  });

  describe('MultiplyNode', () => {
    it('should generate correct code', () => {
      const code = MultiplyNode.generateCode({ a: '2.0', b: '3.0' }, {});
      expect(code.result).toBe('(2.0 * 3.0)');
    });
  });

  describe('SinNode', () => {
    it('should generate correct code', () => {
      const code = SinNode.generateCode({ x: 'angle' }, {});
      expect(code.result).toBe('sin(angle)');
    });
  });

  describe('CosNode', () => {
    it('should generate correct code', () => {
      const code = CosNode.generateCode({ x: 'angle' }, {});
      expect(code.result).toBe('cos(angle)');
    });
  });

  describe('MixNode', () => {
    it('should generate correct code', () => {
      const code = MixNode.generateCode({ a: 'color1', b: 'color2', t: '0.5' }, {});
      expect(code.result).toBe('mix(color1, color2, 0.5)');
    });
  });

  describe('SmoothstepNode', () => {
    it('should generate correct code', () => {
      const code = SmoothstepNode.generateCode({ edge0: '0.0', edge1: '1.0', x: 'val' }, {});
      expect(code.result).toBe('smoothstep(0.0, 1.0, val)');
    });
  });

  describe('StepNode', () => {
    it('should generate correct code', () => {
      const code = StepNode.generateCode({ edge: '0.5', x: 'val' }, {});
      expect(code.result).toBe('step(0.5, val)');
    });
  });

  describe('FractNode', () => {
    it('should generate correct code', () => {
      const code = FractNode.generateCode({ x: 'val' }, {});
      expect(code.result).toBe('fract(val)');
    });
  });
});

describe('Pattern Nodes', () => {
  describe('NoiseNode', () => {
    it('should have correct metadata', () => {
      expect(NoiseNode.type).toBe('pattern_noise');
      expect(NoiseNode.category).toBe('pattern');
      expect(NoiseNode.helpers).toContain('snoise');
    });

    it('should generate code with default params', () => {
      const code = NoiseNode.generateCode({ uv: 'coords' }, {});
      expect(code.value).toContain('snoise');
      expect(code.value).toContain('coords');
    });

    it('should generate fbm for multiple octaves', () => {
      const code = NoiseNode.generateCode({ uv: 'coords' }, { octaves: 3 });
      expect(code.value).toContain('fbm');
    });
  });

  describe('CircleNode', () => {
    it('should have correct metadata', () => {
      expect(CircleNode.type).toBe('pattern_circle');
      expect(CircleNode.category).toBe('pattern');
      expect(CircleNode.outputs).toHaveLength(2);
    });

    it('should generate correct code', () => {
      const code = CircleNode.generateCode({ uv: 'coords' }, { radius: 0.5, center: [0.5, 0.5] });
      expect(code.distance).toContain('length');
      expect(code.value).toContain('smoothstep');
    });
  });

  describe('CheckerNode', () => {
    it('should generate correct code', () => {
      const code = CheckerNode.generateCode({ uv: 'coords' }, { scale: 10 });
      expect(code.value).toContain('mod');
      expect(code.value).toContain('floor');
      expect(code.value).toContain('10.0000');
    });
  });

  describe('GradientNode', () => {
    it('should generate horizontal gradient', () => {
      const code = GradientNode.generateCode({ uv: 'coords' }, { direction: 'horizontal' });
      expect(code.value).toBe('coords.x');
    });

    it('should generate vertical gradient', () => {
      const code = GradientNode.generateCode({ uv: 'coords' }, { direction: 'vertical' });
      expect(code.value).toBe('coords.y');
    });

    it('should generate radial gradient', () => {
      const code = GradientNode.generateCode({ uv: 'coords' }, { direction: 'radial' });
      expect(code.value).toContain('length');
    });
  });
});

describe('Color Nodes', () => {
  describe('RGBNode', () => {
    it('should have correct metadata', () => {
      expect(RGBNode.type).toBe('color_rgb');
      expect(RGBNode.category).toBe('color');
      expect(RGBNode.inputs).toHaveLength(3);
      expect(RGBNode.outputs).toHaveLength(1);
    });

    it('should generate correct code', () => {
      const code = RGBNode.generateCode({ r: '0.5', g: '0.7', b: '0.9' }, {});
      expect(code.color).toBe('vec3(0.5, 0.7, 0.9)');
    });
  });

  describe('HSVToRGBNode', () => {
    it('should have helper function', () => {
      expect(HSVToRGBNode.helpers).toContain('hsv2rgb');
    });

    it('should generate correct code', () => {
      const code = HSVToRGBNode.generateCode({ h: '0.5', s: '1.0', v: '1.0' }, {});
      expect(code.color).toContain('hsv2rgb');
      expect(code.color).toContain('vec3(0.5, 1.0, 1.0)');
    });
  });

  describe('BlendNode', () => {
    it('should generate mix blend', () => {
      const code = BlendNode.generateCode({ color1: 'c1', color2: 'c2', factor: '0.5' }, { mode: 'mix' });
      expect(code.color).toBe('mix(c1, c2, 0.5)');
    });

    it('should generate add blend', () => {
      const code = BlendNode.generateCode({ color1: 'c1', color2: 'c2', factor: '0.5' }, { mode: 'add' });
      expect(code.color).toContain('+');
    });

    it('should generate multiply blend', () => {
      const code = BlendNode.generateCode({ color1: 'c1', color2: 'c2', factor: '0.5' }, { mode: 'multiply' });
      expect(code.color).toContain('*');
    });
  });
});


describe("Output Node", () => {
  describe("OutputNode", () => {
    it("should have correct metadata", () => {
      expect(OutputNode.type).toBe("output");
      expect(OutputNode.label).toBe("Output");
      expect(OutputNode.category).toBe("output");
      expect(OutputNode.inputs).toHaveLength(2);
      expect(OutputNode.outputs).toHaveLength(0);
    });

    it("should generate correct code with color input", () => {
      const code = OutputNode.generateCode({ color: "finalColor", alpha: "1.0" }, {});
      expect(code.__fragColor).toBe("vec4(finalColor, 1.0)");
    });

    it("should use defaults for missing inputs", () => {
      const code = OutputNode.generateCode({}, {});
      expect(code.__fragColor).toBe("vec4(vec3(0.0), 1.0)");
    });

    it("should handle custom alpha", () => {
      const code = OutputNode.generateCode({ color: "c", alpha: "0.5" }, {});
      expect(code.__fragColor).toBe("vec4(c, 0.5)");
    });
  });
});

// Code Generator Tests
import { topologicalSort, inferTypes, canConnect, getConversion, generateGLSL } from '../lib/codegen';
import type { NodeInstance, Edge } from '../lib/types';

describe('Code Generator', () => {
  describe('topologicalSort', () => {
    it('should return nodes in dependency order', () => {
      const nodes: NodeInstance[] = [
        { id: 'a', type: 'input_uv', position: { x: 0, y: 0 }, params: {} },
        { id: 'b', type: 'math_sin', position: { x: 100, y: 0 }, params: {} },
        { id: 'c', type: 'output', position: { x: 200, y: 0 }, params: {} },
      ];
      const edges: Edge[] = [
        { id: 'e1', source: 'a', sourceHandle: 'x', target: 'b', targetHandle: 'x' },
        { id: 'e2', source: 'b', sourceHandle: 'result', target: 'c', targetHandle: 'color' },
      ];
      
      const sorted = topologicalSort(nodes, edges);
      expect(sorted).not.toBeNull();
      expect(sorted!.length).toBe(3);
      
      // a should come before b, b should come before c
      const aIdx = sorted!.findIndex(n => n.id === 'a');
      const bIdx = sorted!.findIndex(n => n.id === 'b');
      const cIdx = sorted!.findIndex(n => n.id === 'c');
      expect(aIdx).toBeLessThan(bIdx);
      expect(bIdx).toBeLessThan(cIdx);
    });

    it('should detect cycles', () => {
      const nodes: NodeInstance[] = [
        { id: 'a', type: 'math_add', position: { x: 0, y: 0 }, params: {} },
        { id: 'b', type: 'math_add', position: { x: 100, y: 0 }, params: {} },
      ];
      const edges: Edge[] = [
        { id: 'e1', source: 'a', sourceHandle: 'result', target: 'b', targetHandle: 'a' },
        { id: 'e2', source: 'b', sourceHandle: 'result', target: 'a', targetHandle: 'a' },
      ];
      
      const sorted = topologicalSort(nodes, edges);
      expect(sorted).toBeNull();
    });

    it('should handle nodes with no connections', () => {
      const nodes: NodeInstance[] = [
        { id: 'a', type: 'input_uv', position: { x: 0, y: 0 }, params: {} },
        { id: 'b', type: 'input_time', position: { x: 0, y: 100 }, params: {} },
      ];
      const edges: Edge[] = [];
      
      const sorted = topologicalSort(nodes, edges);
      expect(sorted).not.toBeNull();
      expect(sorted!.length).toBe(2);
    });
  });

  describe('canConnect', () => {
    it('should allow same type connections', () => {
      expect(canConnect('float', 'float')).toBe(true);
      expect(canConnect('vec2', 'vec2')).toBe(true);
      expect(canConnect('vec3', 'vec3')).toBe(true);
      expect(canConnect('vec4', 'vec4')).toBe(true);
    });

    it('should allow float to any vector', () => {
      expect(canConnect('float', 'vec2')).toBe(true);
      expect(canConnect('float', 'vec3')).toBe(true);
      expect(canConnect('float', 'vec4')).toBe(true);
    });

    it('should allow vec3 to vec4', () => {
      expect(canConnect('vec3', 'vec4')).toBe(true);
    });

    it('should allow vec4 to vec3', () => {
      expect(canConnect('vec4', 'vec3')).toBe(true);
    });

    it('should not allow vec2 to vec3', () => {
      expect(canConnect('vec2', 'vec3')).toBe(false);
    });
  });

  describe('getConversion', () => {
    it('should return unchanged for same type', () => {
      expect(getConversion('float', 'float', 'x')).toBe('x');
      expect(getConversion('vec3', 'vec3', 'v')).toBe('v');
    });

    it('should expand float to vector', () => {
      expect(getConversion('float', 'vec2', 'x')).toBe('vec2(x)');
      expect(getConversion('float', 'vec3', 'x')).toBe('vec3(x)');
      expect(getConversion('float', 'vec4', 'x')).toBe('vec4(vec3(x), 1.0)');
    });

    it('should add alpha for vec3 to vec4', () => {
      expect(getConversion('vec3', 'vec4', 'c')).toBe('vec4(c, 1.0)');
    });

    it('should drop alpha for vec4 to vec3', () => {
      expect(getConversion('vec4', 'vec3', 'c')).toBe('c.rgb');
    });
  });

  describe('inferTypes', () => {
    it('should return output types for all nodes', () => {
      const nodes: NodeInstance[] = [
        { id: 'a', type: 'input_uv', position: { x: 0, y: 0 }, params: {} },
        { id: 'b', type: 'math_sin', position: { x: 100, y: 0 }, params: {} },
      ];
      const edges: Edge[] = [];
      
      const types = inferTypes(nodes, edges);
      expect(types.get('a.uv')).toBe('vec2');
      expect(types.get('a.x')).toBe('float');
      expect(types.get('b.result')).toBe('float');
    });
  });

  describe('generateGLSL', () => {
    it('should fail without output node', () => {
      const nodes: NodeInstance[] = [
        { id: 'a', type: 'input_uv', position: { x: 0, y: 0 }, params: {} },
      ];
      
      const result = generateGLSL(nodes, []);
      expect(result.success).toBe(false);
      expect(result.error).toContain('output');
    });

    it('should generate simple shader with just output', () => {
      const nodes: NodeInstance[] = [
        { id: 'out', type: 'output', position: { x: 0, y: 0 }, params: {} },
      ];
      
      const result = generateGLSL(nodes, []);
      expect(result.success).toBe(true);
      expect(result.code).toContain('#version 300 es');
      expect(result.code).toContain('fragColor');
    });

    it('should generate shader with connected nodes', () => {
      const nodes: NodeInstance[] = [
        { id: 'uv', type: 'input_uv', position: { x: 0, y: 0 }, params: {} },
        { id: 'rgb', type: 'color_rgb', position: { x: 100, y: 0 }, params: { r: 1.0, g: 0.5, b: 0.0 } },
        { id: 'out', type: 'output', position: { x: 200, y: 0 }, params: {} },
      ];
      const edges: Edge[] = [
        { id: 'e1', source: 'rgb', sourceHandle: 'rgb', target: 'out', targetHandle: 'color' },
      ];
      
      const result = generateGLSL(nodes, edges);
      expect(result.success).toBe(true);
      expect(result.code).toContain('fragColor');
    });

    it('should fail on cycle', () => {
      const nodes: NodeInstance[] = [
        { id: 'a', type: 'math_add', position: { x: 0, y: 0 }, params: {} },
        { id: 'b', type: 'math_add', position: { x: 100, y: 0 }, params: {} },
        { id: 'out', type: 'output', position: { x: 200, y: 0 }, params: {} },
      ];
      const edges: Edge[] = [
        { id: 'e1', source: 'a', sourceHandle: 'result', target: 'b', targetHandle: 'a' },
        { id: 'e2', source: 'b', sourceHandle: 'result', target: 'a', targetHandle: 'a' },
      ];
      
      const result = generateGLSL(nodes, edges);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cycle');
    });

    it('should use default values for unconnected inputs', () => {
      const nodes: NodeInstance[] = [
        { id: 'add', type: 'math_add', position: { x: 0, y: 0 }, params: {} },
        { id: 'out', type: 'output', position: { x: 100, y: 0 }, params: {} },
      ];
      const edges: Edge[] = [];
      
      const result = generateGLSL(nodes, edges);
      expect(result.success).toBe(true);
      // Should use default float value (0.0)
      expect(result.code).toContain('0.0');
    });

    it('should include helpers when needed', () => {
      const nodes: NodeInstance[] = [
        { id: 'uv', type: 'input_uv', position: { x: 0, y: 0 }, params: {} },
        { id: 'noise', type: 'pattern_noise', position: { x: 100, y: 0 }, params: { scale: 1.0 } },
        { id: 'out', type: 'output', position: { x: 200, y: 0 }, params: {} },
      ];
      const edges: Edge[] = [
        { id: 'e1', source: 'uv', sourceHandle: 'uv', target: 'noise', targetHandle: 'uv' },
      ];
      
      const result = generateGLSL(nodes, edges);
      expect(result.success).toBe(true);
      expect(result.helpers).toBeDefined();
    });
  });
});
