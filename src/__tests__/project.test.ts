/**
 * Tests for project utilities
 */
import {
  saveProject,
  loadProject,
  validateProject,
  createEmptyProject,
  cloneProject,
  PROJECT_VERSION,
} from '../lib/project';
import type { Project } from '../lib/types';

// Sample valid project
const validProject: Project = {
  version: '1.0',
  name: 'Test Shader',
  nodes: [
    {
      id: 'node-1',
      type: 'input_uv',
      position: { x: 100, y: 200 },
      params: {},
    },
    {
      id: 'node-2',
      type: 'output',
      position: { x: 400, y: 200 },
      params: {},
    },
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'node-1',
      sourceHandle: 'uv',
      target: 'node-2',
      targetHandle: 'color',
    },
  ],
};

describe('saveProject', () => {
  it('should serialize project to JSON string', () => {
    const json = saveProject(validProject);
    expect(typeof json).toBe('string');
    expect(json).toContain('"name": "Test Shader"');
    expect(json).toContain('"version": "1.0"');
  });

  it('should produce valid JSON', () => {
    const json = saveProject(validProject);
    expect(() => JSON.parse(json)).not.toThrow();
  });
});

describe('loadProject', () => {
  it('should parse valid JSON to Project', () => {
    const json = saveProject(validProject);
    const loaded = loadProject(json);
    expect(loaded).not.toBeNull();
    expect(loaded?.name).toBe('Test Shader');
    expect(loaded?.nodes).toHaveLength(2);
    expect(loaded?.edges).toHaveLength(1);
  });

  it('should return null for invalid JSON', () => {
    const result = loadProject('not valid json {{{');
    expect(result).toBeNull();
  });

  it('should return null for missing required fields', () => {
    const result = loadProject('{"name": "Missing Fields"}');
    expect(result).toBeNull();
  });

  it('should round-trip correctly', () => {
    const json = saveProject(validProject);
    const loaded = loadProject(json);
    expect(loaded).toEqual(validProject);
  });
});

describe('validateProject', () => {
  it('should accept valid project', () => {
    expect(validateProject(validProject)).toBe(true);
  });

  it('should reject null', () => {
    expect(validateProject(null)).toBe(false);
  });

  it('should reject missing version', () => {
    const invalid = { ...validProject, version: undefined };
    expect(validateProject(invalid)).toBe(false);
  });

  it('should reject missing name', () => {
    const invalid = { ...validProject, name: undefined };
    expect(validateProject(invalid)).toBe(false);
  });

  it('should reject missing nodes array', () => {
    const invalid = { ...validProject, nodes: undefined };
    expect(validateProject(invalid)).toBe(false);
  });

  it('should reject missing edges array', () => {
    const invalid = { ...validProject, edges: undefined };
    expect(validateProject(invalid)).toBe(false);
  });

  it('should reject invalid node structure', () => {
    const invalid = {
      ...validProject,
      nodes: [{ id: 'bad-node' }], // missing type and position
    };
    expect(validateProject(invalid)).toBe(false);
  });

  it('should reject invalid edge structure', () => {
    const invalid = {
      ...validProject,
      edges: [{ id: 'bad-edge' }], // missing source/target/handles
    };
    expect(validateProject(invalid)).toBe(false);
  });
});

describe('createEmptyProject', () => {
  it('should create project with default name', () => {
    const project = createEmptyProject();
    expect(project.name).toBe('Untitled');
    expect(project.version).toBe(PROJECT_VERSION);
    expect(project.nodes).toEqual([]);
    expect(project.edges).toEqual([]);
  });

  it('should create project with custom name', () => {
    const project = createEmptyProject('My Shader');
    expect(project.name).toBe('My Shader');
  });
});

describe('cloneProject', () => {
  it('should create deep copy', () => {
    const clone = cloneProject(validProject);
    expect(clone).toEqual(validProject);
    expect(clone).not.toBe(validProject);
    expect(clone.nodes).not.toBe(validProject.nodes);
    expect(clone.edges).not.toBe(validProject.edges);
  });

  it('should not affect original when clone is modified', () => {
    const clone = cloneProject(validProject);
    clone.name = 'Modified';
    clone.nodes.push({
      id: 'new-node',
      type: 'test',
      position: { x: 0, y: 0 },
      params: {},
    });
    expect(validProject.name).toBe('Test Shader');
    expect(validProject.nodes).toHaveLength(2);
  });
});
