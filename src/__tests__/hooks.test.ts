/**
 * Tests for React hooks
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCompiler } from '@/hooks/useCompiler';
import { useRenderer } from '@/hooks/useRenderer';
import { usePrismStore } from '@/lib/store';
import { RefObject } from 'react';

// Mock WebGL context
class MockWebGL2RenderingContext {
  canvas = { width: 800, height: 600 };
  createShader() { return {}; }
  shaderSource() {}
  compileShader() {}
  getShaderParameter() { return true; }
  getShaderInfoLog() { return ''; }
  deleteShader() {}
  createProgram() { return {}; }
  attachShader() {}
  linkProgram() {}
  getProgramParameter() { return true; }
  getProgramInfoLog() { return ''; }
  deleteProgram() {}
  useProgram() {}
  getUniformLocation() { return {}; }
  uniform1f() {}
  uniform2f() {}
  createBuffer() { return {}; }
  bindBuffer() {}
  bufferData() {}
  deleteBuffer() {}
  createVertexArray() { return {}; }
  bindVertexArray() {}
  enableVertexAttribArray() {}
  vertexAttribPointer() {}
  deleteVertexArray() {}
  viewport() {}
  clearColor() {}
  clear() {}
  drawArrays() {}
  VERTEX_SHADER = 0x8B31;
  FRAGMENT_SHADER = 0x8B30;
  COMPILE_STATUS = 0x8B81;
  LINK_STATUS = 0x8B82;
  ARRAY_BUFFER = 0x8892;
  STATIC_DRAW = 0x88E4;
  FLOAT = 0x1406;
  TRIANGLES = 0x0004;
  COLOR_BUFFER_BIT = 0x4000;
}

// Create mock canvas
function createMockCanvas(): HTMLCanvasElement {
  const mockGL = new MockWebGL2RenderingContext();
  return {
    getContext: (id: string) => id === 'webgl2' ? mockGL : null,
    width: 800,
    height: 600,
    addEventListener: () => {},
    removeEventListener: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
  } as unknown as HTMLCanvasElement;
}

// Reset store before each test
beforeEach(() => {
  usePrismStore.getState().newProject();
});

describe('useCompiler', () => {
  it('should return null code when no nodes exist', async () => {
    const { result } = renderHook(() => useCompiler());

    await waitFor(() => {
      expect(result.current.code).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.errorNodeId).toBeNull();
    });
  });

  it('should return error when no output node exists', async () => {
    // Add a non-output node
    act(() => {
      usePrismStore.getState().addNode('input_uv', { x: 0, y: 0 });
    });

    const { result } = renderHook(() => useCompiler());

    await waitFor(() => {
      expect(result.current.code).toBeNull();
      expect(result.current.error).toBe('No output node found');
    });
  });

  it('should compile successfully with valid graph', async () => {
    // Add UV node and Output node connected
    act(() => {
      const store = usePrismStore.getState();
      const uvId = store.addNode('input_uv', { x: 0, y: 0 });
      const outputId = store.addNode('output', { x: 200, y: 0 });
      store.addEdge({
        source: uvId,
        sourceHandle: 'uv',
        target: outputId,
        targetHandle: 'color',
      });
    });

    const { result } = renderHook(() => useCompiler());

    await waitFor(() => {
      expect(result.current.code).not.toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.code).toContain('#version 300 es');
      expect(result.current.code).toContain('fragColor');
    });
  });

  it('should recompile on node changes', async () => {
    // Start with output node only
    let outputId: string;
    act(() => {
      outputId = usePrismStore.getState().addNode('output', { x: 200, y: 0 });
    });

    const { result } = renderHook(() => useCompiler());

    await waitFor(() => {
      expect(result.current.code).not.toBeNull();
    });

    const firstCode = result.current.code;

    // Add a time node and connect it
    act(() => {
      const store = usePrismStore.getState();
      const timeId = store.addNode('input_time', { x: 0, y: 0 });
      store.addEdge({
        source: timeId,
        sourceHandle: 'time',
        target: outputId!,
        targetHandle: 'color',
      });
    });

    await waitFor(() => {
      // Code should have changed to include u_time
      expect(result.current.code).not.toBe(firstCode);
      expect(result.current.code).toContain('u_time');
    });
  });

  it('should debounce rapid changes', async () => {
    const { result } = renderHook(() => useCompiler());

    // Make several rapid changes
    act(() => {
      const store = usePrismStore.getState();
      store.addNode('input_uv', { x: 0, y: 0 });
      store.addNode('input_time', { x: 100, y: 0 });
      store.addNode('output', { x: 200, y: 0 });
    });

    // Initially may not have code yet (debouncing)
    // After debounce period, should compile (output node exists)
    await waitFor(() => {
      expect(result.current.code).not.toBeNull();
    }, { timeout: 500 });
  });

  it('should provide compile function for manual trigger', async () => {
    act(() => {
      usePrismStore.getState().addNode('output', { x: 0, y: 0 });
    });

    const { result } = renderHook(() => useCompiler());

    await waitFor(() => {
      expect(result.current.code).not.toBeNull();
    });

    // Calling compile should not throw
    expect(() => {
      act(() => {
        result.current.compile();
      });
    }).not.toThrow();
  });
});

describe('useRenderer', () => {
  const SAMPLE_SHADER = `#version 300 es
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
out vec4 fragColor;
void main() {
  fragColor = vec4(1.0);
}`;

  it('should initialize renderer with canvas', () => {
    const canvas = createMockCanvas();
    const canvasRef = { current: canvas } as RefObject<HTMLCanvasElement>;

    const { result } = renderHook(() => useRenderer(canvasRef, null));

    // Should start playing by default
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should toggle playing state', () => {
    const canvas = createMockCanvas();
    const canvasRef = { current: canvas } as RefObject<HTMLCanvasElement>;

    const { result } = renderHook(() => useRenderer(canvasRef, SAMPLE_SHADER));

    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.setPlaying(false);
    });

    expect(result.current.isPlaying).toBe(false);

    act(() => {
      result.current.setPlaying(true);
    });

    expect(result.current.isPlaying).toBe(true);
  });

  it('should recompile when code changes', () => {
    const canvas = createMockCanvas();
    const canvasRef = { current: canvas } as RefObject<HTMLCanvasElement>;

    const { result, rerender } = renderHook(
      ({ code }) => useRenderer(canvasRef, code),
      { initialProps: { code: SAMPLE_SHADER } }
    );

    expect(result.current.error).toBeNull();

    // Change shader code
    const newShader = SAMPLE_SHADER.replace('vec4(1.0)', 'vec4(0.5)');
    rerender({ code: newShader });

    // Should still have no error (valid shader)
    expect(result.current.error).toBeNull();
  });
});
