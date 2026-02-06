/**
 * Hook for compiling node graph to GLSL shader
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePrismStore, selectNodes, selectEdges } from '@/lib/store';
import { generateGLSL, CodeGenResult } from '@/lib/codegen';

export interface UseCompilerResult {
  code: string | null;
  error: string | null;
  errorNodeId: string | null;
  compile: () => void;
}

/**
 * Debounce delay in milliseconds
 */
const DEBOUNCE_MS = 100;

/**
 * Hook to compile node graph to GLSL.
 * Automatically recompiles when nodes or edges change.
 */
export function useCompiler(): UseCompilerResult {
  const nodes = usePrismStore(selectNodes);
  const edges = usePrismStore(selectEdges);

  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorNodeId, setErrorNodeId] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Perform compilation
   */
  const doCompile = useCallback(() => {
    if (nodes.length === 0) {
      setCode(null);
      setError(null);
      setErrorNodeId(null);
      return;
    }

    const result: CodeGenResult = generateGLSL(nodes, edges);

    if (result.success && result.code) {
      setCode(result.code);
      setError(null);
      setErrorNodeId(null);
    } else {
      setCode(null);
      setError(result.error || 'Unknown compilation error');
      setErrorNodeId(result.errorNodeId || null);
    }
  }, [nodes, edges]);

  /**
   * Manual compile trigger (debounced)
   */
  const compile = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      doCompile();
      debounceRef.current = null;
    }, DEBOUNCE_MS);
  }, [doCompile]);

  /**
   * Auto-compile on node/edge changes (debounced)
   */
  useEffect(() => {
    compile();

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [nodes, edges, compile]);

  return {
    code,
    error,
    errorNodeId,
    compile,
  };
}
