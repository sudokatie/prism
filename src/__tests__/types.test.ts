import {
  isPortType,
  isPortDef,
  isParamDef,
  isNodeInstance,
  isEdge,
  isProject,
  getPortDefaultValue,
  getPortComponentCount,
  validateProject,
} from '../lib/types';

describe('Type guards', () => {
  describe('isPortType', () => {
    it('returns true for valid port types', () => {
      expect(isPortType('float')).toBe(true);
      expect(isPortType('vec2')).toBe(true);
      expect(isPortType('vec3')).toBe(true);
      expect(isPortType('vec4')).toBe(true);
    });

    it('returns false for invalid types', () => {
      expect(isPortType('string')).toBe(false);
      expect(isPortType(123)).toBe(false);
      expect(isPortType(null)).toBe(false);
    });
  });

  describe('isPortDef', () => {
    it('returns true for valid port def', () => {
      expect(isPortDef({ name: 'uv', type: 'vec2' })).toBe(true);
      expect(isPortDef({ name: 'x', type: 'float', default: 0.5 })).toBe(true);
    });

    it('returns false for invalid port def', () => {
      expect(isPortDef({ name: 'test' })).toBe(false);
      expect(isPortDef({ type: 'float' })).toBe(false);
      expect(isPortDef(null)).toBe(false);
    });
  });

  describe('isParamDef', () => {
    it('returns true for valid param def', () => {
      expect(isParamDef({ name: 'scale', type: 'float', default: 1.0 })).toBe(true);
      expect(isParamDef({ name: 'color', type: 'color', default: [1, 1, 1] })).toBe(true);
      expect(isParamDef({ name: 'mode', type: 'select', default: 'multiply' })).toBe(true);
    });

    it('returns false for invalid param def', () => {
      expect(isParamDef({ name: 'test', type: 'invalid' })).toBe(false);
      expect(isParamDef(null)).toBe(false);
    });
  });

  describe('isNodeInstance', () => {
    it('returns true for valid node instance', () => {
      const node = {
        id: 'node-1',
        type: 'uv',
        position: { x: 100, y: 200 },
        params: {},
      };
      expect(isNodeInstance(node)).toBe(true);
    });

    it('returns false for invalid node instance', () => {
      expect(isNodeInstance({ id: 'test' })).toBe(false);
      expect(isNodeInstance({ id: 'test', type: 'uv' })).toBe(false);
      expect(isNodeInstance(null)).toBe(false);
    });
  });

  describe('isEdge', () => {
    it('returns true for valid edge', () => {
      const edge = {
        id: 'edge-1',
        source: 'node-1',
        sourceHandle: 'output',
        target: 'node-2',
        targetHandle: 'input',
      };
      expect(isEdge(edge)).toBe(true);
    });

    it('returns false for invalid edge', () => {
      expect(isEdge({ id: 'test', source: 'node-1' })).toBe(false);
      expect(isEdge(null)).toBe(false);
    });
  });

  describe('isProject', () => {
    it('returns true for valid project', () => {
      const project = {
        version: '1.0',
        name: 'Test',
        nodes: [],
        edges: [],
      };
      expect(isProject(project)).toBe(true);
    });

    it('returns false for invalid project', () => {
      expect(isProject({ version: '1.0' })).toBe(false);
      expect(isProject(null)).toBe(false);
    });
  });
});

describe('Default values', () => {
  describe('getPortDefaultValue', () => {
    it('returns correct default for float', () => {
      expect(getPortDefaultValue('float')).toBe(0);
    });

    it('returns correct default for vec2', () => {
      expect(getPortDefaultValue('vec2')).toEqual([0, 0]);
    });

    it('returns correct default for vec3', () => {
      expect(getPortDefaultValue('vec3')).toEqual([0, 0, 0]);
    });

    it('returns correct default for vec4', () => {
      expect(getPortDefaultValue('vec4')).toEqual([0, 0, 0, 1]);
    });
  });

  describe('getPortComponentCount', () => {
    it('returns correct count for each type', () => {
      expect(getPortComponentCount('float')).toBe(1);
      expect(getPortComponentCount('vec2')).toBe(2);
      expect(getPortComponentCount('vec3')).toBe(3);
      expect(getPortComponentCount('vec4')).toBe(4);
    });
  });
});

describe('validateProject', () => {
  it('validates correct project', () => {
    const project = {
      version: '1.0',
      name: 'Test',
      nodes: [{ id: 'n1', type: 'uv', position: { x: 0, y: 0 }, params: {} }],
      edges: [{ id: 'e1', source: 'n1', sourceHandle: 'out', target: 'n2', targetHandle: 'in' }],
    };
    const result = validateProject(project);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects invalid project structure', () => {
    const result = validateProject({ invalid: true });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid project structure');
  });

  it('reports invalid nodes', () => {
    const project = {
      version: '1.0',
      name: 'Test',
      nodes: [{ invalid: true }],
      edges: [],
    };
    const result = validateProject(project);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid node at index 0');
  });

  it('reports invalid edges', () => {
    const project = {
      version: '1.0',
      name: 'Test',
      nodes: [],
      edges: [{ invalid: true }],
    };
    const result = validateProject(project);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid edge at index 0');
  });

  it('reports unknown version', () => {
    const project = {
      version: '2.0',
      name: 'Test',
      nodes: [],
      edges: [],
    };
    const result = validateProject(project);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Unknown version: 2.0');
  });
});
