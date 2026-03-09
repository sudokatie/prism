/**
 * Tests for preset library
 */
import {
  getAllPresets,
  getPresetsByCategory,
  getPresetById,
  getCategories,
  clonePresetProject,
  searchPresets,
  PRESETS,
} from '../lib/presets';
import { validateProject } from '../lib/project';

describe('getAllPresets', () => {
  it('should return all presets', () => {
    const presets = getAllPresets();
    expect(presets.length).toBeGreaterThan(0);
    expect(presets).toBe(PRESETS);
  });

  it('should return at least 10 presets', () => {
    const presets = getAllPresets();
    expect(presets.length).toBeGreaterThanOrEqual(10);
  });
});

describe('getPresetsByCategory', () => {
  it('should return presets for patterns category', () => {
    const presets = getPresetsByCategory('patterns');
    expect(presets.length).toBeGreaterThan(0);
    presets.forEach(p => expect(p.category).toBe('patterns'));
  });

  it('should return presets for effects category', () => {
    const presets = getPresetsByCategory('effects');
    expect(presets.length).toBeGreaterThan(0);
    presets.forEach(p => expect(p.category).toBe('effects'));
  });

  it('should return presets for generators category', () => {
    const presets = getPresetsByCategory('generators');
    expect(presets.length).toBeGreaterThan(0);
    presets.forEach(p => expect(p.category).toBe('generators'));
  });
});

describe('getPresetById', () => {
  it('should find existing preset', () => {
    const preset = getPresetById('plasma-wave');
    expect(preset).toBeDefined();
    expect(preset?.name).toBe('Plasma Wave');
  });

  it('should return undefined for non-existent preset', () => {
    const preset = getPresetById('non-existent-id');
    expect(preset).toBeUndefined();
  });
});

describe('getCategories', () => {
  it('should return all categories with counts', () => {
    const categories = getCategories();
    expect(categories).toHaveLength(4);

    const names = categories.map(c => c.category);
    expect(names).toContain('patterns');
    expect(names).toContain('effects');
    expect(names).toContain('generators');
    expect(names).toContain('audio');
  });

  it('should have accurate counts', () => {
    const categories = getCategories();
    const totalCount = categories.reduce((sum, c) => sum + c.count, 0);
    expect(totalCount).toBe(getAllPresets().length);
  });
});

describe('preset structure', () => {
  it('all presets should have required fields', () => {
    getAllPresets().forEach(preset => {
      expect(preset.id).toBeTruthy();
      expect(typeof preset.id).toBe('string');
      expect(preset.name).toBeTruthy();
      expect(typeof preset.name).toBe('string');
      expect(preset.description).toBeTruthy();
      expect(typeof preset.description).toBe('string');
      expect(['patterns', 'effects', 'generators', 'audio']).toContain(preset.category);
      expect(preset.project).toBeDefined();
    });
  });

  it('all presets should have valid project structure', () => {
    getAllPresets().forEach(preset => {
      expect(validateProject(preset.project)).toBe(true);
    });
  });

  it('all presets should have nodes', () => {
    getAllPresets().forEach(preset => {
      expect(preset.project.nodes.length).toBeGreaterThan(0);
    });
  });

  it('all presets should have edges', () => {
    getAllPresets().forEach(preset => {
      expect(preset.project.edges.length).toBeGreaterThan(0);
    });
  });

  it('all presets should have unique IDs', () => {
    const ids = getAllPresets().map(p => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('clonePresetProject', () => {
  it('should return a valid project', () => {
    const preset = getPresetById('checkerboard')!;
    const project = clonePresetProject(preset);
    expect(validateProject(project)).toBe(true);
  });

  it('should preserve project name', () => {
    const preset = getPresetById('plasma-wave')!;
    const project = clonePresetProject(preset);
    expect(project.name).toBe(preset.name);
  });

  it('should have same number of nodes', () => {
    const preset = getPresetById('noise-field')!;
    const project = clonePresetProject(preset);
    expect(project.nodes.length).toBe(preset.project.nodes.length);
  });

  it('should have same number of edges', () => {
    const preset = getPresetById('radial-pulse')!;
    const project = clonePresetProject(preset);
    expect(project.edges.length).toBe(preset.project.edges.length);
  });

  it('should generate fresh node IDs', () => {
    const preset = getPresetById('checkerboard')!;
    const project = clonePresetProject(preset);

    // New IDs should be different from original
    const originalIds = new Set(preset.project.nodes.map(n => n.id));
    const newIds = project.nodes.map(n => n.id);

    newIds.forEach(id => {
      expect(originalIds.has(id)).toBe(false);
    });
  });

  it('should update edge references to new IDs', () => {
    const preset = getPresetById('plasma-wave')!;
    const project = clonePresetProject(preset);

    const nodeIds = new Set(project.nodes.map(n => n.id));

    // All edge sources and targets should reference valid node IDs
    project.edges.forEach(edge => {
      expect(nodeIds.has(edge.source)).toBe(true);
      expect(nodeIds.has(edge.target)).toBe(true);
    });
  });

  it('should preserve node types', () => {
    const preset = getPresetById('wave-distortion')!;
    const project = clonePresetProject(preset);

    const originalTypes = preset.project.nodes.map(n => n.type).sort();
    const newTypes = project.nodes.map(n => n.type).sort();

    expect(newTypes).toEqual(originalTypes);
  });

  it('should deep clone params', () => {
    const preset = getPresetById('pixelate')!;
    const project = clonePresetProject(preset);

    // Modifying cloned params should not affect original
    const node = project.nodes.find(n => n.type === 'Pixelate');
    if (node) {
      node.params.pixels = 999;
      const originalNode = preset.project.nodes.find(n => n.type === 'Pixelate');
      expect(originalNode?.params.pixels).not.toBe(999);
    }
  });
});

describe('searchPresets', () => {
  it('should find presets by name', () => {
    const results = searchPresets('plasma');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(p => p.name.toLowerCase().includes('plasma'))).toBe(true);
  });

  it('should find presets by description', () => {
    const results = searchPresets('animated');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should be case insensitive', () => {
    const lower = searchPresets('wave');
    const upper = searchPresets('WAVE');
    const mixed = searchPresets('WaVe');

    expect(lower).toEqual(upper);
    expect(lower).toEqual(mixed);
  });

  it('should return empty array for no matches', () => {
    const results = searchPresets('xyznonexistent123');
    expect(results).toEqual([]);
  });

  it('should return all presets for empty query', () => {
    const results = searchPresets('');
    expect(results.length).toBe(getAllPresets().length);
  });
});
