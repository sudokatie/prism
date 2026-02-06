/**
 * Tests for React hooks
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCompiler } from '@/hooks/useCompiler';
import { usePrismStore } from '@/lib/store';

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
