// Node Registry - central registry of all node definitions

import type { NodeDef } from '@/lib/types';
import { UVNode, TimeNode, MouseNode, ResolutionNode } from './InputNodes';
import { AddNode, MultiplyNode, SinNode, CosNode, MixNode, SmoothstepNode, StepNode, FractNode } from './MathNodes';
import { NoiseNode, CircleNode, CheckerNode, GradientNode } from './PatternNodes';
import { RGBNode, HSVToRGBNode, BlendNode } from './ColorNodes';
import { OutputNode } from './OutputNode';

// All available nodes
const allNodes: NodeDef[] = [
  // Input nodes
  UVNode,
  TimeNode,
  MouseNode,
  ResolutionNode,
  // Math nodes
  AddNode,
  MultiplyNode,
  SinNode,
  CosNode,
  MixNode,
  SmoothstepNode,
  StepNode,
  FractNode,
  // Pattern nodes
  NoiseNode,
  CircleNode,
  CheckerNode,
  GradientNode,
  // Color nodes
  RGBNode,
  HSVToRGBNode,
  BlendNode,
  // Output nodes
  OutputNode,
];

// Map for quick lookup by type
const nodeMap = new Map<string, NodeDef>();
allNodes.forEach(node => nodeMap.set(node.type, node));

/**
 * Get all available node definitions.
 */
export function getAllNodeDefs(): NodeDef[] {
  return allNodes;
}

/**
 * Get a node definition by type.
 */
export function getNodeDef(type: string): NodeDef | undefined {
  return nodeMap.get(type);
}

/**
 * Get all nodes in a specific category.
 */
export function getNodesByCategory(category: string): NodeDef[] {
  return allNodes.filter(node => node.category === category);
}

/**
 * Get all unique categories.
 */
export function getCategories(): string[] {
  const categories = new Set<string>();
  allNodes.forEach(node => categories.add(node.category));
  return Array.from(categories);
}

/**
 * Check if a node type exists.
 */
export function hasNodeDef(type: string): boolean {
  return nodeMap.has(type);
}

// Re-export all node definitions for convenience
export * from './InputNodes';
export * from './MathNodes';
export * from './PatternNodes';
export * from './ColorNodes';
export * from './OutputNode';
