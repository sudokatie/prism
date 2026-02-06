/**
 * Project utilities - save/load/validate
 */
import type { Project, NodeInstance, Edge } from './types';

/**
 * Current project file version
 */
export const PROJECT_VERSION = '1.0';

/**
 * Serialize project to JSON string
 */
export function saveProject(project: Project): string {
  return JSON.stringify(project, null, 2);
}

/**
 * Parse JSON string to Project object
 * Returns null if invalid
 */
export function loadProject(json: string): Project | null {
  try {
    const parsed = JSON.parse(json);
    if (!validateProject(parsed)) {
      return null;
    }
    return parsed as Project;
  } catch {
    return null;
  }
}

/**
 * Validate project structure
 */
export function validateProject(obj: unknown): obj is Project {
  if (!obj || typeof obj !== 'object') return false;

  const project = obj as Record<string, unknown>;

  // Check required fields
  if (typeof project.version !== 'string') return false;
  if (typeof project.name !== 'string') return false;
  if (!Array.isArray(project.nodes)) return false;
  if (!Array.isArray(project.edges)) return false;

  // Validate nodes
  for (const node of project.nodes) {
    if (!validateNode(node)) return false;
  }

  // Validate edges
  for (const edge of project.edges) {
    if (!validateEdge(edge)) return false;
  }

  return true;
}

/**
 * Validate node structure
 */
function validateNode(obj: unknown): obj is NodeInstance {
  if (!obj || typeof obj !== 'object') return false;

  const node = obj as Record<string, unknown>;

  if (typeof node.id !== 'string') return false;
  if (typeof node.type !== 'string') return false;

  // Position validation
  if (!node.position || typeof node.position !== 'object') return false;
  const pos = node.position as Record<string, unknown>;
  if (typeof pos.x !== 'number') return false;
  if (typeof pos.y !== 'number') return false;

  // Params can be any object
  if (node.params !== undefined && typeof node.params !== 'object') return false;

  return true;
}

/**
 * Validate edge structure
 */
function validateEdge(obj: unknown): obj is Edge {
  if (!obj || typeof obj !== 'object') return false;

  const edge = obj as Record<string, unknown>;

  if (typeof edge.id !== 'string') return false;
  if (typeof edge.source !== 'string') return false;
  if (typeof edge.sourceHandle !== 'string') return false;
  if (typeof edge.target !== 'string') return false;
  if (typeof edge.targetHandle !== 'string') return false;

  return true;
}

/**
 * Download project as JSON file
 */
export function downloadProject(project: Project, filename?: string): void {
  const json = saveProject(project);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${project.name}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

/**
 * Create empty project
 */
export function createEmptyProject(name = 'Untitled'): Project {
  return {
    version: PROJECT_VERSION,
    name,
    nodes: [],
    edges: [],
  };
}

/**
 * Clone a project (deep copy)
 */
export function cloneProject(project: Project): Project {
  return JSON.parse(JSON.stringify(project));
}
