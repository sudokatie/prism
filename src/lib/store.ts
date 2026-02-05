// Prism state management
// TODO: Implement in Task 3

import { create } from 'zustand';
import type { NodeInstance, Edge, Project } from './types';

export interface PrismStore {
  // State
  nodes: NodeInstance[];
  edges: Edge[];
  selectedNodeId: string | null;
  projectName: string;
  isModified: boolean;

  // Actions - TODO: implement
  addNode: (type: string, position: { x: number; y: number }) => void;
  removeNode: (id: string) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  updateNodeParam: (id: string, param: string, value: unknown) => void;
  addEdge: (edge: Omit<Edge, 'id'>) => void;
  removeEdge: (id: string) => void;
  selectNode: (id: string | null) => void;
  newProject: () => void;
  loadProject: (project: Project) => void;
  getProject: () => Project;
  setModified: (modified: boolean) => void;
}

export const usePrismStore = create<PrismStore>()((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  selectedNodeId: null,
  projectName: 'Untitled',
  isModified: false,

  // Placeholder actions
  addNode: () => {},
  removeNode: () => {},
  updateNodePosition: () => {},
  updateNodeParam: () => {},
  addEdge: () => {},
  removeEdge: () => {},
  selectNode: () => {},
  newProject: () => {},
  loadProject: () => {},
  getProject: () => ({ version: '1.0', name: get().projectName, nodes: get().nodes, edges: get().edges }),
  setModified: () => {},
}));
