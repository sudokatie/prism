// Interpolation functions for animation

import { InterpolationMode, Keyframe, KeyframeValue } from './types';

/**
 * Easing functions - take t in [0,1], return eased value in [0,1]
 */
export function easeLinear(t: number): number {
  return t;
}

export function easeIn(t: number): number {
  return t * t;
}

export function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export function easeInOut(t: number): number {
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Get easing function by mode
 */
export function getEasingFunction(mode: InterpolationMode): (t: number) => number {
  switch (mode) {
    case 'linear': return easeLinear;
    case 'easeIn': return easeIn;
    case 'easeOut': return easeOut;
    case 'easeInOut': return easeInOut;
  }
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Lerp between two numbers
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Lerp between two values (number or array)
 */
export function lerpValue(a: KeyframeValue, b: KeyframeValue, t: number): KeyframeValue {
  if (typeof a === 'number' && typeof b === 'number') {
    return lerp(a, b, t);
  }
  
  if (Array.isArray(a) && Array.isArray(b)) {
    const result: number[] = [];
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const av = a[i] ?? 0;
      const bv = b[i] ?? 0;
      result.push(lerp(av, bv, t));
    }
    return result;
  }
  
  // Mismatched types - convert to arrays
  const aArr = typeof a === 'number' ? [a] : a;
  const bArr = typeof b === 'number' ? [b] : b;
  return lerpValue(aArr, bArr, t);
}

/**
 * Find the two keyframes surrounding a given time
 * Returns [before, after] or [keyframe, keyframe] if exact match
 */
export function findSurroundingKeyframes(
  keyframes: Keyframe[],
  time: number
): [Keyframe | null, Keyframe | null] {
  if (keyframes.length === 0) {
    return [null, null];
  }
  
  // Sort by time
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  
  // Before first keyframe
  if (time <= sorted[0].time) {
    return [sorted[0], sorted[0]];
  }
  
  // After last keyframe
  if (time >= sorted[sorted.length - 1].time) {
    return [sorted[sorted.length - 1], sorted[sorted.length - 1]];
  }
  
  // Find surrounding keyframes
  for (let i = 0; i < sorted.length - 1; i++) {
    if (time >= sorted[i].time && time <= sorted[i + 1].time) {
      return [sorted[i], sorted[i + 1]];
    }
  }
  
  // Shouldn't reach here
  return [sorted[0], sorted[sorted.length - 1]];
}

/**
 * Interpolate a value at a given time from keyframes
 */
export function interpolateKeyframes(
  keyframes: Keyframe[],
  time: number
): KeyframeValue | null {
  const [before, after] = findSurroundingKeyframes(keyframes, time);
  
  if (!before || !after) {
    return null;
  }
  
  // Same keyframe (exact match or before/after bounds)
  if (before === after || before.time === after.time) {
    return before.value;
  }
  
  // Calculate normalized time between keyframes
  const rawT = (time - before.time) / (after.time - before.time);
  const clampedT = clamp(rawT, 0, 1);
  
  // Apply easing from the "before" keyframe
  const easingFn = getEasingFunction(before.interpolation);
  const easedT = easingFn(clampedT);
  
  // Interpolate value
  return lerpValue(before.value, after.value, easedT);
}

/**
 * Get all animated values at a given time
 */
export function getAnimatedValues(
  tracks: { nodeId: string; param: string; keyframes: Keyframe[] }[],
  time: number
): Map<string, KeyframeValue> {
  const values = new Map<string, KeyframeValue>();
  
  for (const track of tracks) {
    const value = interpolateKeyframes(track.keyframes, time);
    if (value !== null) {
      const key = `${track.nodeId}.${track.param}`;
      values.set(key, value);
    }
  }
  
  return values;
}
