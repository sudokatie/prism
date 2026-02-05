import { usePrismStore, selectSelectedNode, getNodeById, getNodeEdges, hasEdge, isInputConnected } from '../lib/store';
import type { Project } from '../lib/types';

describe('PrismStore', () => {
  beforeEach(() => {
    // Reset store before each test
    usePrismStore.getState().newProject();
  });

  describe('addNode', () => {
    it('should add a node and return its id', () => {
      const id = usePrismStore.getState().addNode('test', { x: 100, y: 200 });
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should create node with correct properties', () => {
      const id = usePrismStore.getState().addNode('math_add', { x: 50, y: 75 });
      const nodes = usePrismStore.getState().nodes;
      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe(id);
      expect(nodes[0].type).toBe('math_add');
      expect(nodes[0].position).toEqual({ x: 50, y: 75 });
      expect(nodes[0].params).toEqual({});
    });

    it('should set isModified to true', () => {
      expect(usePrismStore.getState().isModified).toBe(false);
      usePrismStore.getState().addNode('test', { x: 0, y: 0 });
      expect(usePrismStore.getState().isModified).toBe(true);
    });
  });

  describe('removeNode', () => {
    it('should remove the node', () => {
      const id = usePrismStore.getState().addNode('test', { x: 0, y: 0 });
      expect(usePrismStore.getState().nodes).toHaveLength(1);
      usePrismStore.getState().removeNode(id);
      expect(usePrismStore.getState().nodes).toHaveLength(0);
    });

    it('should remove connected edges', () => {
      const id1 = usePrismStore.getState().addNode('source', { x: 0, y: 0 });
      const id2 = usePrismStore.getState().addNode('target', { x: 100, y: 0 });
      usePrismStore.getState().addEdge({ source: id1, sourceHandle: 'out', target: id2, targetHandle: 'in' });
      expect(usePrismStore.getState().edges).toHaveLength(1);
      usePrismStore.getState().removeNode(id1);
      expect(usePrismStore.getState().edges).toHaveLength(0);
    });

    it('should clear selection if selected node is removed', () => {
      const id = usePrismStore.getState().addNode('test', { x: 0, y: 0 });
      usePrismStore.getState().selectNode(id);
      expect(usePrismStore.getState().selectedNodeId).toBe(id);
      usePrismStore.getState().removeNode(id);
      expect(usePrismStore.getState().selectedNodeId).toBeNull();
    });
  });

  describe('updateNodePosition', () => {
    it('should update position', () => {
      const id = usePrismStore.getState().addNode('test', { x: 0, y: 0 });
      usePrismStore.getState().updateNodePosition(id, { x: 200, y: 300 });
      const node = usePrismStore.getState().nodes[0];
      expect(node.position).toEqual({ x: 200, y: 300 });
    });
  });

  describe('updateNodeParam', () => {
    it('should update a parameter', () => {
      const id = usePrismStore.getState().addNode('test', { x: 0, y: 0 });
      usePrismStore.getState().updateNodeParam(id, 'value', 42);
      const node = usePrismStore.getState().nodes[0];
      expect(node.params.value).toBe(42);
    });

    it('should preserve other parameters', () => {
      const id = usePrismStore.getState().addNode('test', { x: 0, y: 0 });
      usePrismStore.getState().updateNodeParam(id, 'a', 1);
      usePrismStore.getState().updateNodeParam(id, 'b', 2);
      const node = usePrismStore.getState().nodes[0];
      expect(node.params).toEqual({ a: 1, b: 2 });
    });
  });

  describe('addEdge', () => {
    it('should add an edge and return its id', () => {
      const n1 = usePrismStore.getState().addNode('source', { x: 0, y: 0 });
      const n2 = usePrismStore.getState().addNode('target', { x: 100, y: 0 });
      const edgeId = usePrismStore.getState().addEdge({ source: n1, sourceHandle: 'out', target: n2, targetHandle: 'in' });
      expect(typeof edgeId).toBe('string');
      expect(usePrismStore.getState().edges).toHaveLength(1);
    });

    it('should create edge with correct properties', () => {
      const n1 = usePrismStore.getState().addNode('source', { x: 0, y: 0 });
      const n2 = usePrismStore.getState().addNode('target', { x: 100, y: 0 });
      const edgeId = usePrismStore.getState().addEdge({ source: n1, sourceHandle: 'value', target: n2, targetHandle: 'input' });
      const edge = usePrismStore.getState().edges[0];
      expect(edge.id).toBe(edgeId);
      expect(edge.source).toBe(n1);
      expect(edge.sourceHandle).toBe('value');
      expect(edge.target).toBe(n2);
      expect(edge.targetHandle).toBe('input');
    });
  });

  describe('removeEdge', () => {
    it('should remove the edge', () => {
      const n1 = usePrismStore.getState().addNode('source', { x: 0, y: 0 });
      const n2 = usePrismStore.getState().addNode('target', { x: 100, y: 0 });
      const edgeId = usePrismStore.getState().addEdge({ source: n1, sourceHandle: 'out', target: n2, targetHandle: 'in' });
      expect(usePrismStore.getState().edges).toHaveLength(1);
      usePrismStore.getState().removeEdge(edgeId);
      expect(usePrismStore.getState().edges).toHaveLength(0);
    });
  });

  describe('selectNode', () => {
    it('should select a node', () => {
      const id = usePrismStore.getState().addNode('test', { x: 0, y: 0 });
      usePrismStore.getState().selectNode(id);
      expect(usePrismStore.getState().selectedNodeId).toBe(id);
    });

    it('should deselect with null', () => {
      const id = usePrismStore.getState().addNode('test', { x: 0, y: 0 });
      usePrismStore.getState().selectNode(id);
      usePrismStore.getState().selectNode(null);
      expect(usePrismStore.getState().selectedNodeId).toBeNull();
    });
  });

  describe('newProject', () => {
    it('should reset all state', () => {
      usePrismStore.getState().addNode('test', { x: 0, y: 0 });
      usePrismStore.getState().setProjectName('My Project');
      usePrismStore.getState().newProject();
      const state = usePrismStore.getState();
      expect(state.nodes).toHaveLength(0);
      expect(state.edges).toHaveLength(0);
      expect(state.selectedNodeId).toBeNull();
      expect(state.projectName).toBe('Untitled');
      expect(state.isModified).toBe(false);
    });
  });

  describe('loadProject', () => {
    it('should load project data', () => {
      const project: Project = {
        version: '1.0',
        name: 'Loaded Project',
        nodes: [{ id: 'n1', type: 'test', position: { x: 10, y: 20 }, params: { val: 5 } }],
        edges: [{ id: 'e1', source: 'n1', sourceHandle: 'out', target: 'n2', targetHandle: 'in' }],
      };
      usePrismStore.getState().loadProject(project);
      const state = usePrismStore.getState();
      expect(state.projectName).toBe('Loaded Project');
      expect(state.nodes).toEqual(project.nodes);
      expect(state.edges).toEqual(project.edges);
      expect(state.isModified).toBe(false);
    });
  });

  describe('getProject', () => {
    it('should return current project', () => {
      const id = usePrismStore.getState().addNode('math_add', { x: 50, y: 100 });
      usePrismStore.getState().setProjectName('Test Project');
      const project = usePrismStore.getState().getProject();
      expect(project.version).toBe('1.0');
      expect(project.name).toBe('Test Project');
      expect(project.nodes).toHaveLength(1);
      expect(project.nodes[0].id).toBe(id);
    });
  });

  describe('setProjectName', () => {
    it('should update name and set modified', () => {
      usePrismStore.getState().setModified(false);
      usePrismStore.getState().setProjectName('New Name');
      expect(usePrismStore.getState().projectName).toBe('New Name');
      expect(usePrismStore.getState().isModified).toBe(true);
    });
  });

  describe('selectors', () => {
    it('selectSelectedNode returns selected node or null', () => {
      expect(selectSelectedNode(usePrismStore.getState())).toBeNull();
      const id = usePrismStore.getState().addNode('test', { x: 0, y: 0 });
      usePrismStore.getState().selectNode(id);
      const selected = selectSelectedNode(usePrismStore.getState());
      expect(selected?.id).toBe(id);
    });

    it('getNodeById returns node or null', () => {
      const id = usePrismStore.getState().addNode('test', { x: 0, y: 0 });
      expect(getNodeById(usePrismStore.getState(), id)?.id).toBe(id);
      expect(getNodeById(usePrismStore.getState(), 'nonexistent')).toBeNull();
    });

    it('getNodeEdges returns connected edges', () => {
      const n1 = usePrismStore.getState().addNode('source', { x: 0, y: 0 });
      const n2 = usePrismStore.getState().addNode('target', { x: 100, y: 0 });
      const n3 = usePrismStore.getState().addNode('other', { x: 200, y: 0 });
      usePrismStore.getState().addEdge({ source: n1, sourceHandle: 'out', target: n2, targetHandle: 'in' });
      usePrismStore.getState().addEdge({ source: n2, sourceHandle: 'out', target: n3, targetHandle: 'in' });
      const edges = getNodeEdges(usePrismStore.getState(), n2);
      expect(edges).toHaveLength(2);
    });

    it('hasEdge checks for existing edge', () => {
      const n1 = usePrismStore.getState().addNode('source', { x: 0, y: 0 });
      const n2 = usePrismStore.getState().addNode('target', { x: 100, y: 0 });
      expect(hasEdge(usePrismStore.getState(), n1, 'out', n2, 'in')).toBe(false);
      usePrismStore.getState().addEdge({ source: n1, sourceHandle: 'out', target: n2, targetHandle: 'in' });
      expect(hasEdge(usePrismStore.getState(), n1, 'out', n2, 'in')).toBe(true);
    });

    it('isInputConnected checks if input is connected', () => {
      const n1 = usePrismStore.getState().addNode('source', { x: 0, y: 0 });
      const n2 = usePrismStore.getState().addNode('target', { x: 100, y: 0 });
      expect(isInputConnected(usePrismStore.getState(), n2, 'in')).toBe(false);
      usePrismStore.getState().addEdge({ source: n1, sourceHandle: 'out', target: n2, targetHandle: 'in' });
      expect(isInputConnected(usePrismStore.getState(), n2, 'in')).toBe(true);
    });
  });
});
