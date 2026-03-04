/**
 * Audio analyzer hook for Prism.
 * Handles microphone input, FFT analysis, beat detection, and volume tracking.
 * Provides data as shader-ready uniforms.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface AudioAnalyzerState {
  /** Whether audio input is enabled */
  enabled: boolean;
  /** Whether we have microphone permission */
  hasPermission: boolean;
  /** Error message if any */
  error: string | null;
  /** Current volume level (0-1) */
  volume: number;
  /** Peak volume with decay (0-1) */
  peak: number;
  /** RMS volume level (0-1) */
  rms: number;
  /** Bass frequency level (0-1) */
  bass: number;
  /** Mid frequency level (0-1) */
  mid: number;
  /** Treble frequency level (0-1) */
  treble: number;
  /** 8-band FFT data (each 0-1) */
  fftBands: number[];
  /** Beat detection value (decays from 1 to 0) */
  beat: number;
  /** Raw beat trigger (0 or 1) */
  beatRaw: number;
  /** Estimated BPM */
  bpm: number;
}

export interface AudioAnalyzerConfig {
  /** FFT size (power of 2, 32-32768). Default: 256 */
  fftSize?: number;
  /** Smoothing time constant (0-1). Default: 0.8 */
  smoothing?: number;
  /** Beat detection threshold (ratio over average). Default: 1.5 */
  beatThreshold?: number;
  /** Beat decay rate (0-1). Default: 0.95 */
  beatDecay?: number;
  /** Peak decay rate (0-1). Default: 0.99 */
  peakDecay?: number;
}

const DEFAULT_CONFIG: Required<AudioAnalyzerConfig> = {
  fftSize: 256,
  smoothing: 0.8,
  beatThreshold: 1.5,
  beatDecay: 0.95,
  peakDecay: 0.99,
};

const INITIAL_STATE: AudioAnalyzerState = {
  enabled: false,
  hasPermission: false,
  error: null,
  volume: 0,
  peak: 0,
  rms: 0,
  bass: 0,
  mid: 0,
  treble: 0,
  fftBands: [0, 0, 0, 0, 0, 0, 0, 0],
  beat: 0,
  beatRaw: 0,
  bpm: 0,
};

export function useAudioAnalyzer(config: AudioAnalyzerConfig = {}) {
  const [state, setState] = useState<AudioAnalyzerState>(INITIAL_STATE);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  
  // Beat detection state
  const energyHistoryRef = useRef<number[]>([]);
  const lastBeatTimeRef = useRef<number>(0);
  const beatTimesRef = useRef<number[]>([]);
  const beatValueRef = useRef<number>(0);
  const peakValueRef = useRef<number>(0);
  
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  const analyze = useCallback(() => {
    const analyzer = analyzerRef.current;
    const dataArray = dataArrayRef.current;
    
    if (!analyzer || !dataArray) return;
    
    analyzer.getByteFrequencyData(dataArray);
    
    const bufferLength = analyzer.frequencyBinCount;
    
    // Calculate overall volume (average of all frequencies)
    let sum = 0;
    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = dataArray[i] / 255;
      sum += normalized;
      sumSquares += normalized * normalized;
    }
    const volume = sum / bufferLength;
    const rms = Math.sqrt(sumSquares / bufferLength);
    
    // Update peak with decay
    peakValueRef.current = Math.max(volume, peakValueRef.current * cfg.peakDecay);
    
    // Calculate frequency bands (8 bands)
    // Frequency resolution = sampleRate / fftSize
    // For 44100 Hz and 256 FFT: ~172 Hz per bin
    const bandsCount = 8;
    const binsPerBand = Math.floor(bufferLength / bandsCount);
    const fftBands: number[] = [];
    
    for (let band = 0; band < bandsCount; band++) {
      let bandSum = 0;
      const start = band * binsPerBand;
      const end = Math.min(start + binsPerBand, bufferLength);
      for (let i = start; i < end; i++) {
        bandSum += dataArray[i] / 255;
      }
      fftBands.push(bandSum / (end - start));
    }
    
    // Calculate bass/mid/treble (weighted averages)
    // Bass: first 2 bands, Mid: bands 2-5, Treble: bands 5-7
    const bass = (fftBands[0] + fftBands[1]) / 2;
    const mid = (fftBands[2] + fftBands[3] + fftBands[4]) / 3;
    const treble = (fftBands[5] + fftBands[6] + fftBands[7]) / 3;
    
    // Beat detection using energy comparison
    const energy = bass * 2 + mid; // Weight bass heavily
    energyHistoryRef.current.push(energy);
    if (energyHistoryRef.current.length > 43) { // ~1 second at 60fps
      energyHistoryRef.current.shift();
    }
    
    const avgEnergy = energyHistoryRef.current.reduce((a, b) => a + b, 0) / 
      energyHistoryRef.current.length;
    
    const now = performance.now();
    let beatRaw = 0;
    
    if (energy > avgEnergy * cfg.beatThreshold && now - lastBeatTimeRef.current > 100) {
      // Beat detected
      beatRaw = 1;
      beatValueRef.current = 1;
      lastBeatTimeRef.current = now;
      
      // Track beat times for BPM calculation
      beatTimesRef.current.push(now);
      if (beatTimesRef.current.length > 10) {
        beatTimesRef.current.shift();
      }
    }
    
    // Decay beat value
    beatValueRef.current *= cfg.beatDecay;
    
    // Calculate BPM from beat history
    let bpm = 0;
    if (beatTimesRef.current.length >= 4) {
      const intervals: number[] = [];
      for (let i = 1; i < beatTimesRef.current.length; i++) {
        intervals.push(beatTimesRef.current[i] - beatTimesRef.current[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgInterval > 0) {
        bpm = Math.round(60000 / avgInterval);
        // Clamp to reasonable range
        bpm = Math.max(60, Math.min(200, bpm));
      }
    }
    
    setState(prev => ({
      ...prev,
      volume,
      peak: peakValueRef.current,
      rms,
      bass,
      mid,
      treble,
      fftBands,
      beat: beatValueRef.current,
      beatRaw,
      bpm,
    }));
    
    animationFrameRef.current = requestAnimationFrame(analyze);
  }, [cfg.beatDecay, cfg.beatThreshold, cfg.peakDecay]);
  
  const start = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create audio context and analyzer
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = cfg.fftSize;
      analyzer.smoothingTimeConstant = cfg.smoothing;
      analyzerRef.current = analyzer;
      
      // Connect microphone to analyzer
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyzer);
      
      // Create data array for FFT
      dataArrayRef.current = new Uint8Array(analyzer.frequencyBinCount);
      
      // Start analysis loop
      animationFrameRef.current = requestAnimationFrame(analyze);
      
      setState(prev => ({
        ...prev,
        enabled: true,
        hasPermission: true,
        error: null,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access microphone';
      setState(prev => ({
        ...prev,
        enabled: false,
        hasPermission: false,
        error: message,
      }));
    }
  }, [cfg.fftSize, cfg.smoothing, analyze]);
  
  const stop = useCallback(() => {
    // Stop animation loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyzerRef.current = null;
    dataArrayRef.current = null;
    
    // Reset state
    setState(INITIAL_STATE);
    energyHistoryRef.current = [];
    beatTimesRef.current = [];
    beatValueRef.current = 0;
    peakValueRef.current = 0;
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);
  
  return {
    ...state,
    start,
    stop,
  };
}

/**
 * Get audio uniforms for shader.
 * Returns an object that can be spread into uniform definitions.
 */
export function getAudioUniforms(state: AudioAnalyzerState) {
  return {
    u_audio_volume: state.volume,
    u_audio_peak: state.peak,
    u_audio_rms: state.rms,
    u_audio_bass: state.bass,
    u_audio_mid: state.mid,
    u_audio_treble: state.treble,
    u_audio_fft: state.fftBands,
    u_audio_beat: state.beat,
    u_audio_beat_raw: state.beatRaw,
    u_audio_bpm: state.bpm / 200, // Normalize to 0-1 range
  };
}
