import {
  easeLinear,
  easeIn,
  easeOut,
  easeInOut,
  getEasingFunction,
  clamp,
  lerp,
  lerpValue,
  findSurroundingKeyframes,
  interpolateKeyframes,
  getAnimatedValues,
} from '../lib/interpolation';
import { Keyframe } from '../lib/types';

describe('Easing Functions', () => {
  describe('easeLinear', () => {
    it('returns input unchanged', () => {
      expect(easeLinear(0)).toBe(0);
      expect(easeLinear(0.5)).toBe(0.5);
      expect(easeLinear(1)).toBe(1);
    });
  });

  describe('easeIn', () => {
    it('starts slow and accelerates', () => {
      expect(easeIn(0)).toBe(0);
      expect(easeIn(0.5)).toBe(0.25);
      expect(easeIn(1)).toBe(1);
    });
  });

  describe('easeOut', () => {
    it('starts fast and decelerates', () => {
      expect(easeOut(0)).toBe(0);
      expect(easeOut(0.5)).toBe(0.75);
      expect(easeOut(1)).toBe(1);
    });
  });

  describe('easeInOut', () => {
    it('starts slow, speeds up, then slows down', () => {
      expect(easeInOut(0)).toBe(0);
      expect(easeInOut(0.5)).toBe(0.5);
      expect(easeInOut(1)).toBe(1);
      // First half is slower than linear
      expect(easeInOut(0.25)).toBeLessThan(0.25);
      // Second half catches up
      expect(easeInOut(0.75)).toBeGreaterThan(0.75);
    });
  });

  describe('getEasingFunction', () => {
    it('returns correct function for each mode', () => {
      expect(getEasingFunction('linear')).toBe(easeLinear);
      expect(getEasingFunction('easeIn')).toBe(easeIn);
      expect(getEasingFunction('easeOut')).toBe(easeOut);
      expect(getEasingFunction('easeInOut')).toBe(easeInOut);
    });
  });
});

describe('Helper Functions', () => {
  describe('clamp', () => {
    it('clamps values to range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    it('interpolates between two numbers', () => {
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 1)).toBe(10);
    });

    it('handles negative ranges', () => {
      expect(lerp(-10, 10, 0.5)).toBe(0);
    });
  });

  describe('lerpValue', () => {
    it('interpolates numbers', () => {
      expect(lerpValue(0, 10, 0.5)).toBe(5);
    });

    it('interpolates arrays', () => {
      expect(lerpValue([0, 0], [10, 20], 0.5)).toEqual([5, 10]);
    });

    it('handles arrays of different lengths', () => {
      expect(lerpValue([0, 0, 0], [10, 20], 0.5)).toEqual([5, 10, 0]);
    });

    it('handles mixed types by converting', () => {
      expect(lerpValue(0, [10, 20], 0.5)).toEqual([5, 10]);
    });
  });
});

describe('findSurroundingKeyframes', () => {
  const keyframes: Keyframe[] = [
    { time: 0, value: 0, interpolation: 'linear' },
    { time: 5, value: 10, interpolation: 'easeIn' },
    { time: 10, value: 5, interpolation: 'easeOut' },
  ];

  it('returns nulls for empty keyframes', () => {
    expect(findSurroundingKeyframes([], 5)).toEqual([null, null]);
  });

  it('returns first keyframe twice when time is before first', () => {
    const [before, after] = findSurroundingKeyframes(keyframes, -1);
    expect(before?.time).toBe(0);
    expect(after?.time).toBe(0);
  });

  it('returns last keyframe twice when time is after last', () => {
    const [before, after] = findSurroundingKeyframes(keyframes, 15);
    expect(before?.time).toBe(10);
    expect(after?.time).toBe(10);
  });

  it('finds surrounding keyframes in the middle', () => {
    const [before, after] = findSurroundingKeyframes(keyframes, 3);
    expect(before?.time).toBe(0);
    expect(after?.time).toBe(5);
  });

  it('finds surrounding keyframes at exact keyframe time', () => {
    // At exactly time=5, we're at the boundary of [0,5] segment
    // so we get keyframe 0 and keyframe 5
    const [before, after] = findSurroundingKeyframes(keyframes, 5);
    expect(before?.time).toBe(0);
    expect(after?.time).toBe(5);
    // Interpolating at this point gives us keyframe 5's value (t=1)
  });

  it('handles unsorted keyframes', () => {
    const unsorted: Keyframe[] = [
      { time: 10, value: 5, interpolation: 'linear' },
      { time: 0, value: 0, interpolation: 'linear' },
      { time: 5, value: 10, interpolation: 'linear' },
    ];
    const [before, after] = findSurroundingKeyframes(unsorted, 3);
    expect(before?.time).toBe(0);
    expect(after?.time).toBe(5);
  });
});

describe('interpolateKeyframes', () => {
  it('returns null for empty keyframes', () => {
    expect(interpolateKeyframes([], 5)).toBeNull();
  });

  it('returns first value when before first keyframe', () => {
    const keyframes: Keyframe[] = [
      { time: 5, value: 10, interpolation: 'linear' },
    ];
    expect(interpolateKeyframes(keyframes, 0)).toBe(10);
  });

  it('returns last value when after last keyframe', () => {
    const keyframes: Keyframe[] = [
      { time: 0, value: 10, interpolation: 'linear' },
    ];
    expect(interpolateKeyframes(keyframes, 5)).toBe(10);
  });

  it('interpolates linearly between keyframes', () => {
    const keyframes: Keyframe[] = [
      { time: 0, value: 0, interpolation: 'linear' },
      { time: 10, value: 100, interpolation: 'linear' },
    ];
    expect(interpolateKeyframes(keyframes, 5)).toBe(50);
  });

  it('applies easeIn interpolation', () => {
    const keyframes: Keyframe[] = [
      { time: 0, value: 0, interpolation: 'easeIn' },
      { time: 10, value: 100, interpolation: 'linear' },
    ];
    // easeIn at t=0.5 gives 0.25
    expect(interpolateKeyframes(keyframes, 5)).toBe(25);
  });

  it('applies easeOut interpolation', () => {
    const keyframes: Keyframe[] = [
      { time: 0, value: 0, interpolation: 'easeOut' },
      { time: 10, value: 100, interpolation: 'linear' },
    ];
    // easeOut at t=0.5 gives 0.75
    expect(interpolateKeyframes(keyframes, 5)).toBe(75);
  });

  it('interpolates array values', () => {
    const keyframes: Keyframe[] = [
      { time: 0, value: [0, 0, 0], interpolation: 'linear' },
      { time: 10, value: [100, 200, 50], interpolation: 'linear' },
    ];
    expect(interpolateKeyframes(keyframes, 5)).toEqual([50, 100, 25]);
  });
});

describe('getAnimatedValues', () => {
  it('returns empty map for no tracks', () => {
    const values = getAnimatedValues([], 5);
    expect(values.size).toBe(0);
  });

  it('returns values for all tracks at given time', () => {
    const tracks = [
      {
        nodeId: 'node1',
        param: 'scale',
        keyframes: [
          { time: 0, value: 1, interpolation: 'linear' as const },
          { time: 10, value: 5, interpolation: 'linear' as const },
        ],
      },
      {
        nodeId: 'node2',
        param: 'color',
        keyframes: [
          { time: 0, value: [0, 0, 0], interpolation: 'linear' as const },
          { time: 10, value: [1, 1, 1], interpolation: 'linear' as const },
        ],
      },
    ];

    const values = getAnimatedValues(tracks, 5);
    expect(values.get('node1.scale')).toBe(3);
    expect(values.get('node2.color')).toEqual([0.5, 0.5, 0.5]);
  });

  it('uses correct key format', () => {
    const tracks = [
      {
        nodeId: 'abc-123',
        param: 'myParam',
        keyframes: [
          { time: 0, value: 42, interpolation: 'linear' as const },
        ],
      },
    ];

    const values = getAnimatedValues(tracks, 0);
    expect(values.has('abc-123.myParam')).toBe(true);
  });
});
