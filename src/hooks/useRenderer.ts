/**
 * Hook for WebGL rendering
 */
import { useCallback, useEffect, useRef, useState, RefObject } from 'react';
import { createRenderer, Renderer } from '@/lib/webgl';

export interface UseRendererResult {
  isPlaying: boolean;
  setPlaying: (playing: boolean) => void;
  error: string | null;
}

/**
 * Hook to manage WebGL rendering.
 * Handles renderer lifecycle, shader compilation, and animation loop.
 */
export function useRenderer(
  canvasRef: RefObject<HTMLCanvasElement>,
  code: string | null
): UseRendererResult {
  const [isPlaying, setIsPlaying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rendererRef = useRef<Renderer | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });

  /**
   * Initialize renderer when canvas is available
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = createRenderer();
    const initialized = renderer.init(canvas);

    if (!initialized) {
      setError('Failed to initialize WebGL 2.0');
      return;
    }

    rendererRef.current = renderer;
    startTimeRef.current = performance.now() / 1000;

    return () => {
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [canvasRef]);

  /**
   * Compile shader when code changes
   */
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || !code) {
      setError(null);
      return;
    }

    const result = renderer.compile(code);
    if (!result.success) {
      setError(result.error || 'Shader compilation failed');
    } else {
      setError(null);
    }
  }, [code]);

  /**
   * Handle mouse movement
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: 1 - (e.clientY - rect.top) / rect.height, // Flip Y for WebGL
      };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [canvasRef]);

  /**
   * Animation loop
   */
  useEffect(() => {
    const renderer = rendererRef.current;
    const canvas = canvasRef.current;

    if (!renderer || !canvas || !isPlaying || error) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const render = () => {
      const currentTime = performance.now() / 1000 - startTimeRef.current;

      renderer.render({
        u_time: currentTime,
        u_resolution: [canvas.width, canvas.height],
        u_mouse: [mouseRef.current.x, mouseRef.current.y],
      });

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [canvasRef, isPlaying, error]);

  /**
   * Toggle playing state
   */
  const setPlaying = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  return {
    isPlaying,
    setPlaying,
    error,
  };
}
