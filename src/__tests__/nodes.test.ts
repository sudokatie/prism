import { 
  getAllNodeDefs, 
  getNodeDef, 
  getNodesByCategory, 
  getCategories,
  hasNodeDef 
} from '../components/nodes';

describe('Node Registry', () => {
  describe('getAllNodeDefs', () => {
    it('should return all nodes', () => {
      const nodes = getAllNodeDefs();
      expect(nodes.length).toBeGreaterThan(0);
      // 4 input + 18 math + 4 pattern + 10 color + 9 distortion + 4 audio + 1 output = 50
      expect(nodes.length).toBe(50);
    });

    it('should include nodes from all categories', () => {
      const nodes = getAllNodeDefs();
      const categories = new Set(nodes.map(n => n.category));
      expect(categories.has('input')).toBe(true);
      expect(categories.has('math')).toBe(true);
      expect(categories.has('pattern')).toBe(true);
      expect(categories.has('color')).toBe(true);
      expect(categories.has('distortion')).toBe(true);
      expect(categories.has('output')).toBe(true);
    });
  });

  describe('getNodeDef', () => {
    it('should return node by type', () => {
      const node = getNodeDef('input_uv');
      expect(node).toBeDefined();
      expect(node?.label).toBe('UV');
    });

    it('should return undefined for unknown type', () => {
      const node = getNodeDef('unknown_type');
      expect(node).toBeUndefined();
    });
  });

  describe('getNodesByCategory', () => {
    it('should return all input nodes', () => {
      const nodes = getNodesByCategory('input');
      expect(nodes.length).toBe(4);
      expect(nodes.every(n => n.category === 'input')).toBe(true);
    });

    it('should return all math nodes', () => {
      const nodes = getNodesByCategory('math');
      expect(nodes.length).toBe(18); // 8 original + 10 utility (abs, min, max, clamp, remap, floor, ceil, mod, pow, sqrt)
      expect(nodes.every(n => n.category === 'math')).toBe(true);
    });

    it('should return all pattern nodes', () => {
      const nodes = getNodesByCategory('pattern');
      expect(nodes.length).toBe(4);
    });

    it('should return all color nodes', () => {
      const nodes = getNodesByCategory('color');
      // 3 original (rgb, hsv2rgb, blend) + 5 grading (levels, brightness/contrast, color balance, vibrance, posterize) + 2 effects (sharpen, vignette) = 10
      expect(nodes.length).toBe(10);
    });

    it('should return all distortion nodes', () => {
      const nodes = getNodesByCategory('distortion');
      // 6 original + 3 blur (chromatic, radial, motion) = 9
      expect(nodes.length).toBe(9);
    });

    it('should return output node', () => {
      const nodes = getNodesByCategory('output');
      expect(nodes.length).toBe(1);
    });

    it('should return all audio nodes', () => {
      const nodes = getNodesByCategory('audio');
      expect(nodes.length).toBe(4); // AudioInput, FFTBands, BeatDetector, Volume
      expect(nodes.every(n => n.category === 'audio')).toBe(true);
      expect(nodes.every(n => n.requiresAudio === true)).toBe(true);
    });

    it('should return empty array for unknown category', () => {
      const nodes = getNodesByCategory('nonexistent');
      expect(nodes.length).toBe(0);
    });
  });

  describe('getCategories', () => {
    it('should return all unique categories', () => {
      const categories = getCategories();
      expect(categories.length).toBe(7);
      expect(categories).toContain('input');
      expect(categories).toContain('math');
      expect(categories).toContain('pattern');
      expect(categories).toContain('color');
      expect(categories).toContain('distortion');
      expect(categories).toContain('audio');
      expect(categories).toContain('output');
    });
  });

  describe('hasNodeDef', () => {
    it('should return true for existing node', () => {
      expect(hasNodeDef('input_uv')).toBe(true);
      expect(hasNodeDef('math_add')).toBe(true);
      expect(hasNodeDef('output')).toBe(true);
    });

    it('should return false for non-existing node', () => {
      expect(hasNodeDef('nonexistent')).toBe(false);
    });
  });
});
