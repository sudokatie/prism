'use client';

import React, { useState, useCallback } from 'react';
import { PlaybackControls } from './PlaybackControls';
import { TimelineTrack } from './TimelineTrack';
import { AnimationTrack, Keyframe, InterpolationMode, KeyframeValue } from '../lib/types';

interface TimelineProps {
  // Animation state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  loop: boolean;
  tracks: AnimationTrack[];
  
  // Node info for labels
  nodeLabels: Map<string, string>;
  
  // Playback controls
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  onLoopChange: (loop: boolean) => void;
  onDurationChange: (duration: number) => void;
  
  // Track management
  onAddKeyframe: (nodeId: string, param: string, keyframe: Keyframe) => void;
  onRemoveKeyframe: (nodeId: string, param: string, time: number) => void;
  onUpdateKeyframe: (nodeId: string, param: string, time: number, updates: Partial<Keyframe>) => void;
  
  // Visibility
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const DEFAULT_INTERPOLATION: InterpolationMode = 'linear';

export function Timeline({
  isPlaying,
  currentTime,
  duration,
  loop,
  tracks,
  nodeLabels,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onLoopChange,
  onDurationChange,
  onAddKeyframe,
  onRemoveKeyframe,
  onUpdateKeyframe,
  isVisible,
  onToggleVisibility,
}: TimelineProps) {
  const [editingDuration, setEditingDuration] = useState(false);
  const [durationInput, setDurationInput] = useState(duration.toString());

  const handleAddKeyframe = useCallback(
    (nodeId: string, param: string, time: number) => {
      // Get current value from track or use default
      const track = tracks.find((t) => t.nodeId === nodeId && t.param === param);
      let value: KeyframeValue = 0;
      
      if (track && track.keyframes.length > 0) {
        // Use value from nearest keyframe
        const sorted = [...track.keyframes].sort((a, b) => Math.abs(a.time - time) - Math.abs(b.time - time));
        value = sorted[0].value;
      }
      
      onAddKeyframe(nodeId, param, {
        time,
        value,
        interpolation: DEFAULT_INTERPOLATION,
      });
    },
    [tracks, onAddKeyframe]
  );

  const handleMoveKeyframe = useCallback(
    (nodeId: string, param: string, fromTime: number, toTime: number) => {
      const track = tracks.find((t) => t.nodeId === nodeId && t.param === param);
      const keyframe = track?.keyframes.find((k) => k.time === fromTime);
      if (!keyframe) return;
      
      // Remove old, add new
      onRemoveKeyframe(nodeId, param, fromTime);
      onAddKeyframe(nodeId, param, { ...keyframe, time: toTime });
    },
    [tracks, onRemoveKeyframe, onAddKeyframe]
  );

  const handleDurationSubmit = useCallback(() => {
    const newDuration = parseFloat(durationInput);
    if (!isNaN(newDuration) && newDuration > 0) {
      onDurationChange(newDuration);
    } else {
      setDurationInput(duration.toString());
    }
    setEditingDuration(false);
  }, [durationInput, duration, onDurationChange]);

  if (!isVisible) {
    return (
      <button
        onClick={onToggleVisibility}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 px-4 py-1 bg-zinc-800 border border-zinc-700 border-b-0 rounded-t text-xs text-zinc-400 hover:bg-zinc-700"
      >
        Show Timeline
      </button>
    );
  }

  return (
    <div className="bg-zinc-800 border-t border-zinc-700">
      {/* Header with toggle */}
      <div className="flex items-center justify-between px-3 py-1 bg-zinc-850 border-b border-zinc-700">
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-zinc-300">Animation Timeline</span>
          
          {/* Duration editor */}
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <span>Duration:</span>
            {editingDuration ? (
              <input
                type="number"
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value)}
                onBlur={handleDurationSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleDurationSubmit();
                  if (e.key === 'Escape') {
                    setDurationInput(duration.toString());
                    setEditingDuration(false);
                  }
                }}
                className="w-16 px-1 bg-zinc-700 border border-zinc-600 rounded text-zinc-300"
                min={0.1}
                step={0.1}
                autoFocus
              />
            ) : (
              <button
                onClick={() => {
                  setDurationInput(duration.toString());
                  setEditingDuration(true);
                }}
                className="px-1 hover:bg-zinc-700 rounded"
              >
                {duration}s
              </button>
            )}
          </div>
        </div>
        
        <button
          onClick={onToggleVisibility}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          Hide
        </button>
      </div>

      {/* Playback controls */}
      <PlaybackControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        loop={loop}
        onPlay={onPlay}
        onPause={onPause}
        onStop={onStop}
        onSeek={onSeek}
        onLoopChange={onLoopChange}
      />

      {/* Tracks */}
      <div className="max-h-48 overflow-y-auto">
        {tracks.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-zinc-500">
            No animation tracks. Select a node and click &quot;Add Keyframe&quot; to start animating.
          </div>
        ) : (
          tracks.map((track) => (
            <TimelineTrack
              key={`${track.nodeId}.${track.param}`}
              nodeId={track.nodeId}
              nodeLabel={nodeLabels.get(track.nodeId) || track.nodeId.slice(0, 8)}
              param={track.param}
              keyframes={track.keyframes}
              duration={duration}
              currentTime={currentTime}
              onAddKeyframe={(time) => handleAddKeyframe(track.nodeId, track.param, time)}
              onRemoveKeyframe={(time) => onRemoveKeyframe(track.nodeId, track.param, time)}
              onMoveKeyframe={(from, to) => handleMoveKeyframe(track.nodeId, track.param, from, to)}
              onUpdateKeyframe={(time, updates) => onUpdateKeyframe(track.nodeId, track.param, time, updates)}
            />
          ))
        )}
      </div>

      {/* Time ruler */}
      <div className="flex border-t border-zinc-700">
        <div className="w-40 flex-shrink-0 bg-zinc-800 border-r border-zinc-700" />
        <div className="flex-1 relative h-4 bg-zinc-900 text-xs text-zinc-500">
          {Array.from({ length: Math.floor(duration) + 1 }, (_, i) => (
            <span
              key={i}
              className="absolute -translate-x-1/2"
              style={{ left: `${(i / duration) * 100}%` }}
            >
              {i}s
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Timeline;
