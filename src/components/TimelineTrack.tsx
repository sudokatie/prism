'use client';

import React, { useCallback, useRef } from 'react';
import { Keyframe, InterpolationMode } from '../lib/types';

interface TimelineTrackProps {
  nodeId: string;
  nodeLabel: string;
  param: string;
  keyframes: Keyframe[];
  duration: number;
  currentTime: number;
  onAddKeyframe: (time: number) => void;
  onRemoveKeyframe: (time: number) => void;
  onMoveKeyframe: (fromTime: number, toTime: number) => void;
  onUpdateKeyframe: (time: number, updates: Partial<Keyframe>) => void;
}

const TRACK_HEIGHT = 32;
const KEYFRAME_SIZE = 12;

export function TimelineTrack({
  nodeId: _nodeId,
  nodeLabel,
  param,
  keyframes,
  duration,
  currentTime,
  onAddKeyframe,
  onRemoveKeyframe,
  onMoveKeyframe,
  onUpdateKeyframe: _onUpdateKeyframe,
}: TimelineTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{ time: number; startX: number } | null>(null);

  const timeToX = useCallback(
    (time: number, width: number) => {
      return (time / duration) * width;
    },
    [duration]
  );

  const xToTime = useCallback(
    (x: number, width: number) => {
      return Math.max(0, Math.min(duration, (x / width) * duration));
    },
    [duration]
  );

  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = xToTime(x, rect.width);
      
      // Check if clicking near existing keyframe
      const clickedKeyframe = keyframes.find((k) => {
        const kx = timeToX(k.time, rect.width);
        return Math.abs(x - kx) < KEYFRAME_SIZE;
      });
      
      if (!clickedKeyframe) {
        // Add new keyframe
        onAddKeyframe(Math.round(time * 100) / 100);
      }
    },
    [keyframes, xToTime, timeToX, onAddKeyframe]
  );

  const handleKeyframeMouseDown = useCallback(
    (e: React.MouseEvent, time: number) => {
      e.stopPropagation();
      draggingRef.current = { time, startX: e.clientX };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!draggingRef.current || !trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const x = moveEvent.clientX - rect.left;
        const newTime = xToTime(x, rect.width);
        const snappedTime = Math.round(newTime * 100) / 100;
        
        if (snappedTime !== draggingRef.current.time) {
          onMoveKeyframe(draggingRef.current.time, snappedTime);
          draggingRef.current.time = snappedTime;
        }
      };

      const handleMouseUp = () => {
        draggingRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [xToTime, onMoveKeyframe]
  );

  const handleKeyframeContextMenu = useCallback(
    (e: React.MouseEvent, time: number) => {
      e.preventDefault();
      e.stopPropagation();
      onRemoveKeyframe(time);
    },
    [onRemoveKeyframe]
  );

  const getInterpolationColor = (mode: InterpolationMode): string => {
    switch (mode) {
      case 'linear':
        return 'bg-blue-500';
      case 'easeIn':
        return 'bg-green-500';
      case 'easeOut':
        return 'bg-yellow-500';
      case 'easeInOut':
        return 'bg-purple-500';
    }
  };

  return (
    <div className="flex border-b border-zinc-700">
      {/* Track label */}
      <div className="w-40 flex-shrink-0 px-2 py-1 bg-zinc-800 border-r border-zinc-700 text-xs text-zinc-300 truncate">
        <span className="text-zinc-500">{nodeLabel}.</span>
        <span>{param}</span>
      </div>

      {/* Track timeline */}
      <div
        ref={trackRef}
        className="flex-1 relative bg-zinc-900 cursor-crosshair"
        style={{ height: TRACK_HEIGHT }}
        onClick={handleTrackClick}
      >
        {/* Playhead indicator */}
        <div
          className="absolute top-0 bottom-0 w-px bg-red-500 pointer-events-none z-10"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        />

        {/* Keyframes */}
        {keyframes.map((keyframe) => (
          <div
            key={keyframe.time}
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing ${getInterpolationColor(
              keyframe.interpolation
            )}`}
            style={{
              left: `${(keyframe.time / duration) * 100}%`,
              width: KEYFRAME_SIZE,
              height: KEYFRAME_SIZE,
              transform: 'translate(-50%, -50%) rotate(45deg)',
            }}
            onMouseDown={(e) => handleKeyframeMouseDown(e, keyframe.time)}
            onContextMenu={(e) => handleKeyframeContextMenu(e, keyframe.time)}
            title={`Time: ${keyframe.time}s\nValue: ${JSON.stringify(keyframe.value)}\nInterpolation: ${keyframe.interpolation}\nRight-click to delete`}
          />
        ))}

        {/* Grid lines every second */}
        {Array.from({ length: Math.floor(duration) + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-zinc-700 pointer-events-none"
            style={{ left: `${(i / duration) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default TimelineTrack;
