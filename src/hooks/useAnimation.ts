// Animation playback hook

import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimationData, AnimationState, AnimationTrack, Keyframe, KeyframeValue } from '../lib/types';
import { getAnimatedValues } from '../lib/interpolation';

interface UseAnimationReturn {
  // State
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  loop: boolean;
  
  // Controls
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setLoop: (loop: boolean) => void;
  setDuration: (duration: number) => void;
  
  // Animation data
  tracks: AnimationTrack[];
  addTrack: (nodeId: string, param: string) => void;
  removeTrack: (nodeId: string, param: string) => void;
  addKeyframe: (nodeId: string, param: string, keyframe: Keyframe) => void;
  removeKeyframe: (nodeId: string, param: string, time: number) => void;
  updateKeyframe: (nodeId: string, param: string, time: number, updates: Partial<Keyframe>) => void;
  
  // Value getters
  getAnimatedValues: () => Map<string, KeyframeValue>;
  
  // Import/Export
  exportAnimation: () => AnimationData;
  importAnimation: (data: AnimationData) => void;
}

export function useAnimation(initialDuration = 10): UseAnimationReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration);
  const [loop, setLoop] = useState(true);
  const [tracks, setTracks] = useState<AnimationTrack[]>([]);
  
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }
    
    lastTimeRef.current = performance.now();
    
    const animate = (now: number) => {
      const deltaMs = now - lastTimeRef.current;
      lastTimeRef.current = now;
      
      setCurrentTime((prev) => {
        const next = prev + deltaMs / 1000;
        if (next >= duration) {
          if (loop) {
            return next % duration;
          } else {
            setIsPlaying(false);
            return duration;
          }
        }
        return next;
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, duration, loop]);
  
  // Controls
  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);
  
  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);
  
  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);
  
  const seek = useCallback((time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, duration)));
  }, [duration]);
  
  // Track management
  const addTrack = useCallback((nodeId: string, param: string) => {
    setTracks((prev) => {
      // Check if track already exists
      if (prev.some((t) => t.nodeId === nodeId && t.param === param)) {
        return prev;
      }
      return [...prev, { nodeId, param, keyframes: [] }];
    });
  }, []);
  
  const removeTrack = useCallback((nodeId: string, param: string) => {
    setTracks((prev) => prev.filter((t) => !(t.nodeId === nodeId && t.param === param)));
  }, []);
  
  // Keyframe management
  const addKeyframe = useCallback((nodeId: string, param: string, keyframe: Keyframe) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.nodeId !== nodeId || track.param !== param) {
          return track;
        }
        // Replace if keyframe at same time exists, otherwise add
        const existingIndex = track.keyframes.findIndex((k) => k.time === keyframe.time);
        if (existingIndex >= 0) {
          const newKeyframes = [...track.keyframes];
          newKeyframes[existingIndex] = keyframe;
          return { ...track, keyframes: newKeyframes };
        }
        return { ...track, keyframes: [...track.keyframes, keyframe].sort((a, b) => a.time - b.time) };
      })
    );
  }, []);
  
  const removeKeyframe = useCallback((nodeId: string, param: string, time: number) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.nodeId !== nodeId || track.param !== param) {
          return track;
        }
        return { ...track, keyframes: track.keyframes.filter((k) => k.time !== time) };
      })
    );
  }, []);
  
  const updateKeyframe = useCallback(
    (nodeId: string, param: string, time: number, updates: Partial<Keyframe>) => {
      setTracks((prev) =>
        prev.map((track) => {
          if (track.nodeId !== nodeId || track.param !== param) {
            return track;
          }
          return {
            ...track,
            keyframes: track.keyframes.map((k) => {
              if (k.time !== time) return k;
              return { ...k, ...updates };
            }),
          };
        })
      );
    },
    []
  );
  
  // Get animated values at current time
  const getAnimatedValuesAtCurrentTime = useCallback(() => {
    return getAnimatedValues(tracks, currentTime);
  }, [tracks, currentTime]);
  
  // Import/Export
  const exportAnimation = useCallback((): AnimationData => {
    return { duration, loop, tracks };
  }, [duration, loop, tracks]);
  
  const importAnimation = useCallback((data: AnimationData) => {
    setDuration(data.duration);
    setLoop(data.loop);
    setTracks(data.tracks);
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);
  
  return {
    isPlaying,
    currentTime,
    duration,
    loop,
    play,
    pause,
    stop,
    seek,
    setLoop,
    setDuration,
    tracks,
    addTrack,
    removeTrack,
    addKeyframe,
    removeKeyframe,
    updateKeyframe,
    getAnimatedValues: getAnimatedValuesAtCurrentTime,
    exportAnimation,
    importAnimation,
  };
}
