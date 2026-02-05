import { UVNode, TimeNode, MouseNode, ResolutionNode } from '../components/nodes/InputNodes';

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
