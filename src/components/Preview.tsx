'use client';

/**
 * Preview - WebGL preview panel
 */
import { useRef, useEffect } from 'react';
import { useCompiler } from '@/hooks/useCompiler';
import { useRenderer } from '@/hooks/useRenderer';

interface PreviewProps {
  width?: number;
  height?: number;
}

/**
 * WebGL preview panel with real-time rendering
 */
export function Preview({ width = 400, height = 400 }: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compile node graph to GLSL
  const { code, error: compileError, errorNodeId } = useCompiler();

  // Render shader
  const { isPlaying, setPlaying, error: renderError } = useRenderer(canvasRef, code);

  // Combined error
  const error = compileError || renderError;

  // Update canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
  }, [width, height]);

  return (
    <div className="flex flex-col bg-gray-800 border-l border-gray-700">
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
          width={width}
          height={height}
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
