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
      expect(nodes.length).toBe(20); // 4 input + 8 math + 4 pattern + 3 color + 1 output
    });

    it('should include nodes from all categories', () => {
      const nodes = getAllNodeDefs();
      const categories = new Set(nodes.map(n => n.category));
      expect(categories.has('input')).toBe(true);
      expect(categories.has('math')).toBe(true);
      expect(categories.has('pattern')).toBe(true);
      expect(categories.has('color')).toBe(true);
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
      expect(nodes.length).toBe(8);
      expect(nodes.every(n => n.category === 'math')).toBe(true);
    });

    it('should return all pattern nodes', () => {
      const nodes = getNodesByCategory('pattern');
      expect(nodes.length).toBe(4);
    });

    it('should return all color nodes', () => {
      const nodes = getNodesByCategory('color');
      expect(nodes.length).toBe(3);
    });

    it('should return output node', () => {
      const nodes = getNodesByCategory('output');
      expect(nodes.length).toBe(1);
    });

    it('should return empty array for unknown category', () => {
      const nodes = getNodesByCategory('nonexistent');
      expect(nodes.length).toBe(0);
    });
  });

  describe('getCategories', () => {
    it('should return all unique categories', () => {
      const categories = getCategories();
      expect(categories.length).toBe(5);
      expect(categories).toContain('input');
      expect(categories).toContain('math');
      expect(categories).toContain('pattern');
      expect(categories).toContain('color');
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
