// Node Registry - central registry of all node definitions

import type { NodeDef } from '@/lib/types';
import { UVNode, TimeNode, MouseNode, ResolutionNode } from './InputNodes';
import { MathNodes } from './MathNodes';
import { NoiseNode, CircleNode, CheckerNode, GradientNode } from './PatternNodes';
import { RGBNode, HSVToRGBNode, BlendNode, LevelsNode, BrightnessContrastNode, ColorBalanceNode, VibranceNode, PosterizeNode } from './ColorNodes';
import { DistortionNodes } from './DistortionNodes';
import { BlurNodes } from './BlurNodes';
import { audioNodes } from './AudioNodes';
import { OutputNode } from './OutputNode';

// All available nodes
const allNodes: NodeDef[] = [
  // Input nodes
  UVNode,
  TimeNode,
  MouseNode,
  ResolutionNode,
  // Math nodes
  ...MathNodes,
  // Pattern nodes
  NoiseNode,
  CircleNode,
  CheckerNode,
  GradientNode,
  // Color nodes
  RGBNode,
  HSVToRGBNode,
  BlendNode,
  LevelsNode,
  BrightnessContrastNode,
  ColorBalanceNode,
  VibranceNode,
  PosterizeNode,
  // Distortion nodes
  ...DistortionNodes,
  // Blur/effect nodes
  ...BlurNodes,
  // Audio nodes
  ...audioNodes,
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
export function getNodesByCategory(): Record<string, NodeDef[]>;
export function getNodesByCategory(category: string): NodeDef[];
export function getNodesByCategory(category?: string): NodeDef[] | Record<string, NodeDef[]> {
  if (category === undefined) {
    // Return all nodes grouped by category
    const grouped: Record<string, NodeDef[]> = {};
    allNodes.forEach(node => {
      if (!grouped[node.category]) {
        grouped[node.category] = [];
      }
      grouped[node.category].push(node);
    });
    return grouped;
  }
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
export * from './DistortionNodes';
export * from './BlurNodes';
export * from './AudioNodes';
export * from './OutputNode';
