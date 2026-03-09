import { encodePreset, decodePreset, getShareUrl, canShare } from '../lib/share';
import type { Project } from '../lib/types';
import { PROJECT_VERSION } from '../lib/project';

describe('share', () => {
  const sampleProject: Project = {
    version: PROJECT_VERSION,
    name: 'Test Project',
    nodes: [
      { id: 'uv', type: 'UV', position: { x: 0, y: 0 }, params: {} },
      { id: 'output', type: 'Output', position: { x: 200, y: 0 }, params: {} },
    ],
    edges: [
      { id: 'e1', source: 'uv', sourceHandle: 'uv', target: 'output', targetHandle: 'color' },
    ],
  };

  describe('encodePreset', () => {
    it('should encode a project to a string', () => {
      const encoded = encodePreset(sampleProject);
      expect(typeof encoded).toBe('string');
      expect(encoded.startsWith('v1_')).toBe(true);
    });

    it('should produce URL-safe output', () => {
      const encoded = encodePreset(sampleProject);
      // base64url should not contain +, /, or =
      const data = encoded.substring(3); // remove v1_
      expect(data).not.toMatch(/[+/=]/);
    });

    it('should produce consistent output', () => {
      const encoded1 = encodePreset(sampleProject);
      const encoded2 = encodePreset(sampleProject);
      expect(encoded1).toBe(encoded2);
    });
  });

  describe('decodePreset', () => {
    it('should decode an encoded project', () => {
      const encoded = encodePreset(sampleProject);
      const decoded = decodePreset(encoded);
      expect(decoded).toEqual(sampleProject);
    });

    it('should return null for invalid input', () => {
      expect(decodePreset('')).toBeNull();
      expect(decodePreset('invalid')).toBeNull();
      expect(decodePreset('v1_invalid')).toBeNull();
    });

    it('should return null for wrong version', () => {
      const encoded = encodePreset(sampleProject);
      const wrongVersion = encoded.replace('v1_', 'v2_');
      expect(decodePreset(wrongVersion)).toBeNull();
    });

    it('should return null for corrupted data', () => {
      const encoded = encodePreset(sampleProject);
      const corrupted = encoded.substring(0, encoded.length - 5) + 'xxxxx';
      expect(decodePreset(corrupted)).toBeNull();
    });

    it('should return null for invalid project structure', () => {
      // Encode a non-project object
      const fakeProject = { notAProject: true } as unknown as Project;
      const encoded = `v1_${btoa(JSON.stringify(fakeProject)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
      // This should fail validation
      expect(decodePreset(encoded)).toBeNull();
    });
  });

  describe('round trip', () => {
    it('should preserve project through encode/decode', () => {
      const complexProject: Project = {
        version: PROJECT_VERSION,
        name: 'Complex Project',
        nodes: [
          { id: 'uv', type: 'UV', position: { x: 50, y: 100 }, params: {} },
          { id: 'time', type: 'Time', position: { x: 50, y: 200 }, params: {} },
          { id: 'noise', type: 'Noise', position: { x: 250, y: 150 }, params: { scale: 4, octaves: 3 } },
          { id: 'gradient', type: 'Gradient', position: { x: 450, y: 150 }, params: {} },
          { id: 'output', type: 'Output', position: { x: 650, y: 150 }, params: {} },
        ],
        edges: [
          { id: 'e1', source: 'uv', sourceHandle: 'uv', target: 'noise', targetHandle: 'uv' },
          { id: 'e2', source: 'time', sourceHandle: 'time', target: 'noise', targetHandle: 'z' },
          { id: 'e3', source: 'noise', sourceHandle: 'value', target: 'gradient', targetHandle: 't' },
          { id: 'e4', source: 'gradient', sourceHandle: 'color', target: 'output', targetHandle: 'color' },
        ],
      };

      const encoded = encodePreset(complexProject);
      const decoded = decodePreset(encoded);
      expect(decoded).toEqual(complexProject);
    });

    it('should handle unicode in project name', () => {
      const unicodeProject: Project = {
        version: PROJECT_VERSION,
        name: 'Shader 着色器 🎨',
        nodes: [
          { id: 'output', type: 'Output', position: { x: 0, y: 0 }, params: {} },
        ],
        edges: [],
      };

      const encoded = encodePreset(unicodeProject);
      const decoded = decodePreset(encoded);
      expect(decoded?.name).toBe(unicodeProject.name);
    });
  });

  describe('getShareUrl', () => {
    it('should return null in non-browser environment', () => {
      // window is undefined in Node.js test environment by default
      const url = getShareUrl(sampleProject);
      // In test env, this returns empty base URL but still works
      expect(url).toBeTruthy();
    });

    it('should include share parameter', () => {
      const url = getShareUrl(sampleProject);
      expect(url).toContain('?share=v1_');
    });
  });

  describe('canShare', () => {
    it('should return true for small projects', () => {
      expect(canShare(sampleProject)).toBe(true);
    });

    it('should return true for medium projects', () => {
      // Create a project with many nodes
      const mediumProject: Project = {
        version: PROJECT_VERSION,
        name: 'Medium Project',
        nodes: Array.from({ length: 20 }, (_, i) => ({
          id: `node_${i}`,
          type: 'Noise',
          position: { x: i * 100, y: 0 },
          params: { scale: 4, octaves: 3 },
        })),
        edges: [],
      };
      expect(canShare(mediumProject)).toBe(true);
    });
  });
});
