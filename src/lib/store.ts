// Prism state management

import { create } from 'zustand';
import type { NodeInstance, Edge, Project } from './types';

// Simple ID generator (no external dependencies)
let idCounter = 0;
function generateId(): string {
  return `${Date.now().toString(36)}-${(idCounter++).toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface PrismStore {
  // State
  nodes: NodeInstance[];
  edges: Edge[];
  selectedNodeId: string | null;
  projectName: string;
  isModified: boolean;

  // Node actions
  addNode: (type: string, position: { x: number; y: number }) => string;
  removeNode: (id: string) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  updateNodeParam: (id: string, param: string, value: unknown) => void;

  // Edge actions
  addEdge: (edge: Omit<Edge, 'id'>) => string;
  removeEdge: (id: string) => void;

  // Selection
  selectNode: (id: string | null) => void;

  // Project actions
  newProject: () => void;
  loadProject: (project: Project) => void;
  getProject: () => Project;
  setProjectName: (name: string) => void;
  setModified: (modified: boolean) => void;
}

export const usePrismStore = create<PrismStore>()((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  selectedNodeId: null,
  projectName: 'Untitled',
  isModified: false,

  // Add a new node
  addNode: (type: string, position: { x: number; y: number }) => {
    const id = generateId();
    const node: NodeInstance = {
      id,
      type,
      position,
      params: {},
    };
    set((state) => ({
      nodes: [...state.nodes, node],
      isModified: true,
    }));
    return id;
  },

  // Remove a node and all connected edges
  removeNode: (id: string) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      isModified: true,
    }));
  },

  // Update node position
  updateNodePosition: (id: string, position: { x: number; y: number }) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, position } : n
      ),
      isModified: true,
    }));
  },

  // Update node parameter
  updateNodeParam: (id: string, param: string, value: unknown) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, params: { ...n.params, [param]: value } } : n
      ),
      isModified: true,
    }));
  },

  // Add an edge
  addEdge: (edge: Omit<Edge, 'id'>) => {
    const id = generateId();
    const newEdge: Edge = { id, ...edge };
    set((state) => ({
      edges: [...state.edges, newEdge],
      isModified: true,
    }));
    return id;
  },

  // Remove an edge
  removeEdge: (id: string) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
      isModified: true,
    }));
  },

  // Select a node
  selectNode: (id: string | null) => {
    set({ selectedNodeId: id });
  },

  // Create new project
  newProject: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      projectName: 'Untitled',
      isModified: false,
    });
  },

  // Load a project
  loadProject: (project: Project) => {
    set({
      nodes: project.nodes,
      edges: project.edges,
      projectName: project.name,
      selectedNodeId: null,
      isModified: false,
    });
  },

  // Get current project
  getProject: () => {
    const state = get();
    return {
      version: '1.0',
      name: state.projectName,
      nodes: state.nodes,
      edges: state.edges,
    };
  },

  // Set project name
  setProjectName: (name: string) => {
    set({ projectName: name, isModified: true });
  },

  // Set modified flag
  setModified: (modified: boolean) => {
    set({ isModified: modified });
  },
}));

// Selector helpers
export const selectNodes = (state: PrismStore) => state.nodes;
export const selectEdges = (state: PrismStore) => state.edges;
export const selectSelectedNode = (state: PrismStore) => 
  state.nodes.find((n) => n.id === state.selectedNodeId) ?? null;
export const selectIsModified = (state: PrismStore) => state.isModified;
export const selectProjectName = (state: PrismStore) => state.projectName;

// Get node by id
export const getNodeById = (state: PrismStore, id: string) =>
  state.nodes.find((n) => n.id === id) ?? null;

// Get edges connected to a node
export const getNodeEdges = (state: PrismStore, nodeId: string) =>
  state.edges.filter((e) => e.source === nodeId || e.target === nodeId);

// Check if an edge already exists between two ports
export const hasEdge = (state: PrismStore, source: string, sourceHandle: string, target: string, targetHandle: string) =>
  state.edges.some(
    (e) =>
      e.source === source &&
      e.sourceHandle === sourceHandle &&
      e.target === target &&
      e.targetHandle === targetHandle
  );

// Check if an input port is already connected
export const isInputConnected = (state: PrismStore, nodeId: string, inputName: string) =>
  state.edges.some((e) => e.target === nodeId && e.targetHandle === inputName);
