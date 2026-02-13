'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAnimation } from '@/hooks/useAnimation';

// Get the return type of useAnimation
type AnimationContextType = ReturnType<typeof useAnimation> | null;

const AnimationContext = createContext<AnimationContextType>(null);

interface AnimationProviderProps {
  children: ReactNode;
  initialDuration?: number;
}

export function AnimationProvider({ children, initialDuration = 10 }: AnimationProviderProps) {
  const animation = useAnimation(initialDuration);
  
  return (
    <AnimationContext.Provider value={animation}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimationContext() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimationContext must be used within an AnimationProvider');
  }
  return context;
}

export function useAnimationContextOptional() {
  return useContext(AnimationContext);
}
