'use client';

/**
 * Prism - Visual Shader Editor
 * Main application page
 */
import { useEffect, useCallback } from 'react';
import { Toolbar } from '@/components/Toolbar';
import { NodePalette } from '@/components/NodePalette';
import { Canvas } from '@/components/Canvas';
import { Preview } from '@/components/Preview';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { usePrismStore } from '@/lib/store';

export default function Home() {
  const { removeNode, selectedNodeId, selectNode } = usePrismStore();
  const addNode = usePrismStore((state) => state.addNode);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Delete selected node
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        // Don't delete if focused on input
        if ((e.target as HTMLElement).tagName === 'INPUT') return;
        removeNode(selectedNodeId);
        e.preventDefault();
      }

      // Duplicate selected node (Cmd/Ctrl + D)
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && selectedNodeId) {
        e.preventDefault();
        const node = usePrismStore.getState().nodes.find((n) => n.id === selectedNodeId);
        if (node) {
          const newId = usePrismStore.getState().addNode(node.type, {
            x: node.position.x + 50,
            y: node.position.y + 50,
          });
          // Copy params
          Object.entries(node.params).forEach(([key, value]) => {
            usePrismStore.getState().updateNodeParam(newId, key, value);
          });
          selectNode(newId);
        }
      }

      // Save project (Cmd/Ctrl + S)
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        const project = usePrismStore.getState().getProject();
        const json = JSON.stringify(project, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name}.json`;
        a.click();
        URL.revokeObjectURL(url);
        usePrismStore.getState().setModified(false);
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        selectNode(null);
      }
    },
    [selectedNodeId, removeNode, selectNode]
  );

  // Register keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle drag and drop from palette
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const nodeType = e.dataTransfer.getData('application/prism-node');
      if (nodeType) {
        // Calculate drop position relative to canvas
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        addNode(nodeType, { x, y });
      }
    },
    [addNode]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      {/* Top Toolbar */}
      <Toolbar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Node Palette */}
        <NodePalette />

        {/* Center: Canvas + Properties */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas */}
          <div
            className="flex-1 relative"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Canvas />
          </div>

          {/* Bottom: Properties Panel */}
          <PropertiesPanel />
        </div>

        {/* Right: Preview */}
        <Preview width={350} height={350} />
      </div>
    </div>
  );
}
