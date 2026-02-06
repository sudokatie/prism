'use client';

/**
 * NodePalette - Draggable node list sidebar
 */
import { DragEvent, useState } from 'react';
import { getNodesByCategory } from '@/components/nodes';
import type { NodeDef } from '@/lib/types';
import { usePrismStore } from '@/lib/store';

// Category display names
const CATEGORY_LABELS: Record<string, string> = {
  input: 'Input',
  math: 'Math',
  pattern: 'Pattern',
  color: 'Color',
  output: 'Output',
};

// Category order
const CATEGORY_ORDER = ['input', 'math', 'pattern', 'color', 'output'];

interface NodeItemProps {
  def: NodeDef;
  onAdd: () => void;
}

/**
 * Single node item in the palette
 */
function NodeItem({ def, onAdd }: NodeItemProps) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/prism-node', def.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onAdd}
      className="
        px-3 py-2 bg-gray-700 rounded cursor-grab hover:bg-gray-600
        text-sm text-white transition-colors active:cursor-grabbing
      "
    >
      {def.label}
    </div>
  );
}

interface CategorySectionProps {
  category: string;
  nodes: NodeDef[];
  onAddNode: (type: string) => void;
}

/**
 * Collapsible category section
 */
function CategorySection({ category, nodes, onAddNode }: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full flex items-center justify-between px-2 py-1
          text-sm font-semibold text-gray-300 hover:text-white
        "
      >
        <span>{CATEGORY_LABELS[category] || category}</span>
        <span className="text-xs">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2 pl-2">
          {nodes.map((def) => (
            <NodeItem
              key={def.type}
              def={def}
              onAdd={() => onAddNode(def.type)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Node palette sidebar
 */
export function NodePalette() {
  const { addNode } = usePrismStore();
  const nodesByCategory = getNodesByCategory();

  // Add node at center of canvas
  const handleAddNode = (type: string) => {
    // Place new nodes in a visible area
    addNode(type, { x: 200 + Math.random() * 100, y: 200 + Math.random() * 100 });
  };

  return (
    <div className="w-56 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold text-white mb-4">Nodes</h2>

      {CATEGORY_ORDER.map((category) => {
        const nodes = nodesByCategory[category];
        if (!nodes || nodes.length === 0) return null;

        return (
          <CategorySection
            key={category}
            category={category}
            nodes={nodes}
            onAddNode={handleAddNode}
          />
        );
      })}
    </div>
  );
}
