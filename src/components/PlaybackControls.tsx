'use client';

import React from 'react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  loop: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  onLoopChange: (loop: boolean) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export function PlaybackControls({
  isPlaying,
  currentTime,
  duration,
  loop,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onLoopChange,
}: PlaybackControlsProps) {
  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      onSeek(value);
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border-b border-zinc-700">
      {/* Play/Pause button */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="w-8 h-8 flex items-center justify-center rounded bg-zinc-700 hover:bg-zinc-600 text-white"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Stop button */}
      <button
        onClick={onStop}
        className="w-8 h-8 flex items-center justify-center rounded bg-zinc-700 hover:bg-zinc-600 text-white"
        title="Stop"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" />
        </svg>
      </button>

      {/* Time display */}
      <div className="flex items-center gap-1 text-sm text-zinc-300 font-mono">
        <span>{formatTime(currentTime)}</span>
        <span className="text-zinc-500">/</span>
        <span className="text-zinc-400">{formatTime(duration)}</span>
      </div>

      {/* Timeline scrubber */}
      <input
        type="range"
        min={0}
        max={duration}
        step={0.01}
        value={currentTime}
        onChange={handleTimeInputChange}
        className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />

      {/* Loop toggle */}
      <button
        onClick={() => onLoopChange(!loop)}
        className={`w-8 h-8 flex items-center justify-center rounded ${
          loop ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-400'
        } hover:bg-zinc-600`}
        title={loop ? 'Loop enabled' : 'Loop disabled'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
}

export default PlaybackControls;
