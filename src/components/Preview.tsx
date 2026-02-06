'use client';

/**
 * Preview - WebGL preview panel with resizable width
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { useCompiler } from '@/hooks/useCompiler';
import { useRenderer } from '@/hooks/useRenderer';

interface PreviewProps {
  width?: number;
  height?: number;
}

/**
 * WebGL preview panel with real-time rendering
 */
export function Preview({ width: initialWidth = 400, height = 400 }: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [panelWidth, setPanelWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  // Compile node graph to GLSL
  const { code, error: compileError, errorNodeId } = useCompiler();

  // Render shader
  const { isPlaying, setPlaying, error: renderError } = useRenderer(canvasRef, code);

  // Combined error
  const error = compileError || renderError;

  // Resize handling
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Panel is on the right, so width = window.right - mouse.x
      const newWidth = Math.max(200, Math.min(600, window.innerWidth - e.clientX));
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Update canvas size based on panel width
  const canvasSize = Math.min(panelWidth - 32, height); // 32px padding
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvasSize;
      canvas.height = canvasSize;
    }
  }, [canvasSize]);

  return (
    <div 
      className="flex flex-col bg-gray-800 border-l border-gray-700 relative"
      style={{ width: panelWidth }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={handleResizeStart}
        className={`
          absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize
          hover:bg-blue-500 transition-colors
          ${isResizing ? 'bg-blue-500' : 'bg-transparent'}
        `}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-white">Preview</h2>
        <button
          onClick={() => setPlaying(!isPlaying)}
          className={`
            px-3 py-1 text-xs rounded font-medium transition-colors
            ${isPlaying
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
            }
          `}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="bg-black rounded shadow-lg"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-4 bg-red-900/90 rounded flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-red-300 font-semibold mb-2">Shader Error</div>
              <div className="text-red-100 text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                {error}
              </div>
              {errorNodeId && (
                <div className="text-red-400 text-xs mt-2">Node: {errorNodeId}</div>
              )}
            </div>
          </div>
        )}

        {/* No shader message */}
        {!code && !error && (
          <div className="absolute inset-4 flex items-center justify-center">
            <div className="text-gray-500 text-sm text-center">
              Add an Output node to see the preview
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
