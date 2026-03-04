// Audio input node definitions: AudioInput, FFT Bands, Beat, Volume

import type { NodeDef } from '@/lib/types';

/**
 * Audio Input Node - main microphone input that provides raw audio data.
 * Requires user permission and creates audio context.
 * Outputs are available as uniforms: u_audio_volume, u_audio_bass, u_audio_mid, u_audio_treble
 */
export const AudioInputNode: NodeDef = {
  type: 'audio_input',
  label: 'Audio Input',
  category: 'audio',
  inputs: [],
  outputs: [
    { name: 'volume', type: 'float' },
    { name: 'bass', type: 'float' },
    { name: 'mid', type: 'float' },
    { name: 'treble', type: 'float' },
  ],
  params: [
    { name: 'smoothing', type: 'float', default: 0.8, min: 0.0, max: 0.99 },
    { name: 'gain', type: 'float', default: 1.0, min: 0.1, max: 5.0 },
  ],
  generateCode: (_inputs, params) => {
    const gain = (params.gain as number) ?? 1.0;
    const gainStr = gain === 1.0 ? '' : ` * ${gain.toFixed(2)}`;
    return {
      volume: `(u_audio_volume${gainStr})`,
      bass: `(u_audio_bass${gainStr})`,
      mid: `(u_audio_mid${gainStr})`,
      treble: `(u_audio_treble${gainStr})`,
    };
  },
  requiresAudio: true,
};

/**
 * FFT Bands Node - provides 8 frequency bands from FFT analysis.
 * More granular control than the basic Audio Input node.
 * Bands are roughly: sub-bass, bass, low-mid, mid, upper-mid, presence, brilliance, air
 */
export const FFTBandsNode: NodeDef = {
  type: 'audio_fft_bands',
  label: 'FFT Bands',
  category: 'audio',
  inputs: [],
  outputs: [
    { name: 'band0', type: 'float' }, // 20-60 Hz (sub-bass)
    { name: 'band1', type: 'float' }, // 60-250 Hz (bass)
    { name: 'band2', type: 'float' }, // 250-500 Hz (low-mid)
    { name: 'band3', type: 'float' }, // 500-2000 Hz (mid)
    { name: 'band4', type: 'float' }, // 2000-4000 Hz (upper-mid)
    { name: 'band5', type: 'float' }, // 4000-6000 Hz (presence)
    { name: 'band6', type: 'float' }, // 6000-12000 Hz (brilliance)
    { name: 'band7', type: 'float' }, // 12000-20000 Hz (air)
  ],
  params: [
    { name: 'smoothing', type: 'float', default: 0.8, min: 0.0, max: 0.99 },
  ],
  generateCode: () => ({
    band0: 'u_audio_fft[0]',
    band1: 'u_audio_fft[1]',
    band2: 'u_audio_fft[2]',
    band3: 'u_audio_fft[3]',
    band4: 'u_audio_fft[4]',
    band5: 'u_audio_fft[5]',
    band6: 'u_audio_fft[6]',
    band7: 'u_audio_fft[7]',
  }),
  requiresAudio: true,
};

/**
 * Beat Detector Node - detects beats/transients in the audio.
 * Uses energy comparison for beat detection.
 */
export const BeatDetectorNode: NodeDef = {
  type: 'audio_beat',
  label: 'Beat Detector',
  category: 'audio',
  inputs: [],
  outputs: [
    { name: 'beat', type: 'float' }, // 1.0 on beat, decays to 0
    { name: 'beatRaw', type: 'float' }, // Raw beat trigger (0 or 1)
    { name: 'bpm', type: 'float' }, // Estimated BPM
  ],
  params: [
    { name: 'threshold', type: 'float', default: 1.5, min: 1.0, max: 3.0 },
    { name: 'decay', type: 'float', default: 0.95, min: 0.8, max: 0.99 },
  ],
  generateCode: () => ({
    beat: 'u_audio_beat',
    beatRaw: 'u_audio_beat_raw',
    bpm: 'u_audio_bpm',
  }),
  requiresAudio: true,
};

/**
 * Volume Node - simple volume/amplitude analysis.
 * Good for basic audio reactivity.
 */
export const VolumeNode: NodeDef = {
  type: 'audio_volume',
  label: 'Volume',
  category: 'audio',
  inputs: [],
  outputs: [
    { name: 'level', type: 'float' }, // Current volume level (0-1)
    { name: 'peak', type: 'float' }, // Peak hold with decay
    { name: 'rms', type: 'float' }, // RMS (root mean square) level
  ],
  params: [
    { name: 'gain', type: 'float', default: 1.0, min: 0.1, max: 5.0 },
    { name: 'peakDecay', type: 'float', default: 0.99, min: 0.9, max: 0.999 },
  ],
  generateCode: (_inputs, params) => {
    const gain = (params.gain as number) ?? 1.0;
    const gainStr = gain === 1.0 ? '' : ` * ${gain.toFixed(2)}`;
    return {
      level: `(u_audio_volume${gainStr})`,
      peak: `(u_audio_peak${gainStr})`,
      rms: `(u_audio_rms${gainStr})`,
    };
  },
  requiresAudio: true,
};

// Export all audio nodes
export const audioNodes = [
  AudioInputNode,
  FFTBandsNode,
  BeatDetectorNode,
  VolumeNode,
];
