/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useAnimation } from '../hooks/useAnimation';

describe('useAnimation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial state', () => {
    it('starts paused', () => {
      const { result } = renderHook(() => useAnimation());
      expect(result.current.isPlaying).toBe(false);
    });

    it('starts at time 0', () => {
      const { result } = renderHook(() => useAnimation());
      expect(result.current.currentTime).toBe(0);
    });

    it('uses default duration of 10', () => {
      const { result } = renderHook(() => useAnimation());
      expect(result.current.duration).toBe(10);
    });

    it('uses custom initial duration', () => {
      const { result } = renderHook(() => useAnimation(30));
      expect(result.current.duration).toBe(30);
    });

    it('starts with loop enabled', () => {
      const { result } = renderHook(() => useAnimation());
      expect(result.current.loop).toBe(true);
    });

    it('starts with empty tracks', () => {
      const { result } = renderHook(() => useAnimation());
      expect(result.current.tracks).toEqual([]);
    });
  });

  describe('Controls', () => {
    it('play sets isPlaying to true', () => {
      const { result } = renderHook(() => useAnimation());
      act(() => {
        result.current.play();
      });
      expect(result.current.isPlaying).toBe(true);
    });

    it('pause sets isPlaying to false', () => {
      const { result } = renderHook(() => useAnimation());
      act(() => {
        result.current.play();
        result.current.pause();
      });
      expect(result.current.isPlaying).toBe(false);
    });

    it('stop pauses and resets time to 0', () => {
      const { result } = renderHook(() => useAnimation());
      act(() => {
        result.current.play();
        result.current.seek(5);
        result.current.stop();
      });
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentTime).toBe(0);
    });

    it('seek sets current time', () => {
      const { result } = renderHook(() => useAnimation());
      act(() => {
        result.current.seek(5);
      });
      expect(result.current.currentTime).toBe(5);
    });

    it('seek clamps to valid range', () => {
      const { result } = renderHook(() => useAnimation(10));
      act(() => {
        result.current.seek(-5);
      });
      expect(result.current.currentTime).toBe(0);
      
      act(() => {
        result.current.seek(15);
      });
      expect(result.current.currentTime).toBe(10);
    });

    it('setLoop updates loop state', () => {
      const { result } = renderHook(() => useAnimation());
      act(() => {
        result.current.setLoop(false);
      });
      expect(result.current.loop).toBe(false);
    });

    it('setDuration updates duration', () => {
      const { result } = renderHook(() => useAnimation());
      act(() => {
        result.current.setDuration(20);
      });
      expect(result.current.duration).toBe(20);
    });
  });

  describe('Track management', () => {
    it('addTrack adds a new track', () => {
      const { result } = renderHook(() => useAnimation());
      act(() => {
        result.current.addTrack('node-1', 'scale');
      });
      expect(result.current.tracks).toHaveLength(1);
      expect(result.current.tracks[0]).toEqual({
        nodeId: 'node-1',
        param: 'scale',
        keyframes: [],
      });
    });

    it('addTrack does not duplicate tracks', () => {
      const { result } = renderHook(() => useAnimation());
      act(() => {
        result.current.addTrack('node-1', 'scale');
        result.current.addTrack('node-1', 'scale');
      });
      expect(result.current.tracks).toHaveLength(1);
    });

    it('removeTrack removes a track', () => {
      const { result } = renderHook(() => useAnimation());
      act(() => {
        result.current.addTrack('node-1', 'scale');
        result.current.addTrack('node-2', 'color');
        result.current.removeTrack('node-1', 'scale');
      });
      expect(result.current.tracks).toHaveLength(1);
      expect(result.current.tracks[0].nodeId).toBe('node-2');
    });
  });

  describe('Keyframe management', () => {
    it('addKeyframe adds keyframe to track', () => {
      const { result } = renderHook(() => useAnimation());
      act(() => {
        result.current.addTrack('node-1', 'scale');
        result.current.addKeyframe('node-1', 'scale', {
          time: 0,
          value: 1,
          interpolation: 'linear',
        });
      });
      expect(result.current.tracks[0].keyframes).toHaveLength(1);
    });

    it('addKeyframe keeps keyframes sorted by time', () => {
      const { result } = renderHook(() => useAnimation());
      act(() => {
        result.current.addTrack('node-1', 'scale');
        result.current.addKeyframe('node-1', 'scale', { time: 10, value: 5, interpolation: 'linear' });
        result.current.addKeyframe('node-1', 'scale', { time: 0, value: 1, interpolation: 'linear' });
        result.current.addKeyframe('node-1', 'scale', { time: 5, value: 3, interpolation: 'linear' });
      });
      expect(result.current.tracks[0].keyframes.map((k) => k.time)).toEqual([0, 5, 10]);
    });

    it('addKeyframe replaces keyframe at same time', () => {
      const { result } = renderHook(() => useAnimation());
      act(() => {
        result.current.addTrack('node-1', 'scale');
        result.current.addKeyframe('node-1', 'scale', { time: 5, value: 1, interpolation: 'linear' });
        result.current.addKeyframe('node-1', 'scale', { time: 5, value: 10, interpolation: 'easeIn' });
      });
      expect(result.current.tracks[0].keyframes).toHaveLength(1);
      expect(result.current.tracks[0].keyframes[0].value).toBe(10);
    });

    it('removeKeyframe removes keyframe at time', () => {
      const { result } = renderHook(() => useAnimation());
      act(() => {
        result.current.addTrack('node-1', 'scale');
        result.current.addKeyframe('node-1', 'scale', { time: 0, value: 1, interpolation: 'linear' });
        result.current.addKeyframe('node-1', 'scale', { time: 5, value: 3, interpolation: 'linear' });
        result.current.removeKeyframe('node-1', 'scale', 0);
      });
      expect(result.current.tracks[0].keyframes).toHaveLength(1);
      expect(result.current.tracks[0].keyframes[0].time).toBe(5);
    });

    it('updateKeyframe updates keyframe properties', () => {
      const { result } = renderHook(() => useAnimation());
      act(() => {
        result.current.addTrack('node-1', 'scale');
        result.current.addKeyframe('node-1', 'scale', { time: 5, value: 1, interpolation: 'linear' });
        result.current.updateKeyframe('node-1', 'scale', 5, { value: 10, interpolation: 'easeOut' });
      });
      expect(result.current.tracks[0].keyframes[0].value).toBe(10);
      expect(result.current.tracks[0].keyframes[0].interpolation).toBe('easeOut');
    });
  });

  describe('getAnimatedValues', () => {
    it('returns empty map with no tracks', () => {
      const { result } = renderHook(() => useAnimation());
      const values = result.current.getAnimatedValues();
      expect(values.size).toBe(0);
    });

    it('returns interpolated values at current time', () => {
      const { result } = renderHook(() => useAnimation());
      act(() => {
        result.current.addTrack('node-1', 'scale');
        result.current.addKeyframe('node-1', 'scale', { time: 0, value: 0, interpolation: 'linear' });
        result.current.addKeyframe('node-1', 'scale', { time: 10, value: 100, interpolation: 'linear' });
        result.current.seek(5);
      });
      const values = result.current.getAnimatedValues();
      expect(values.get('node-1.scale')).toBe(50);
    });
  });

  describe('Import/Export', () => {
    it('exportAnimation returns animation data', () => {
      const { result } = renderHook(() => useAnimation());
      act(() => {
        result.current.setDuration(20);
        result.current.setLoop(false);
        result.current.addTrack('node-1', 'scale');
        result.current.addKeyframe('node-1', 'scale', { time: 0, value: 1, interpolation: 'linear' });
      });
      const data = result.current.exportAnimation();
      expect(data.duration).toBe(20);
      expect(data.loop).toBe(false);
      expect(data.tracks).toHaveLength(1);
    });

    it('importAnimation restores animation data', () => {
      const { result } = renderHook(() => useAnimation());
      act(() => {
        result.current.importAnimation({
          duration: 30,
          loop: false,
          tracks: [
            {
              nodeId: 'node-1',
              param: 'scale',
              keyframes: [{ time: 0, value: 5, interpolation: 'easeIn' }],
            },
          ],
        });
      });
      expect(result.current.duration).toBe(30);
      expect(result.current.loop).toBe(false);
      expect(result.current.tracks).toHaveLength(1);
      expect(result.current.currentTime).toBe(0);
      expect(result.current.isPlaying).toBe(false);
    });
  });
});
