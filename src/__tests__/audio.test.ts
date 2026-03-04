import { getAudioUniforms, AudioAnalyzerState } from '../hooks/useAudioAnalyzer';
import { AudioInputNode, FFTBandsNode, BeatDetectorNode, VolumeNode, audioNodes } from '../components/nodes/AudioNodes';

describe('Audio Nodes', () => {
  describe('AudioInputNode', () => {
    it('should have correct structure', () => {
      expect(AudioInputNode.type).toBe('audio_input');
      expect(AudioInputNode.category).toBe('audio');
      expect(AudioInputNode.requiresAudio).toBe(true);
    });

    it('should have 4 outputs', () => {
      expect(AudioInputNode.outputs.length).toBe(4);
      expect(AudioInputNode.outputs.map(o => o.name)).toEqual(['volume', 'bass', 'mid', 'treble']);
    });

    it('should have smoothing and gain params', () => {
      expect(AudioInputNode.params.length).toBe(2);
      expect(AudioInputNode.params.map(p => p.name)).toEqual(['smoothing', 'gain']);
    });

    it('should generate correct code with default gain', () => {
      const code = AudioInputNode.generateCode({}, { gain: 1.0 });
      expect(code.volume).toBe('(u_audio_volume)');
      expect(code.bass).toBe('(u_audio_bass)');
    });

    it('should apply gain multiplier in code', () => {
      const code = AudioInputNode.generateCode({}, { gain: 2.5 });
      expect(code.volume).toContain('* 2.50');
    });
  });

  describe('FFTBandsNode', () => {
    it('should have correct structure', () => {
      expect(FFTBandsNode.type).toBe('audio_fft_bands');
      expect(FFTBandsNode.category).toBe('audio');
      expect(FFTBandsNode.requiresAudio).toBe(true);
    });

    it('should have 8 band outputs', () => {
      expect(FFTBandsNode.outputs.length).toBe(8);
      for (let i = 0; i < 8; i++) {
        expect(FFTBandsNode.outputs[i].name).toBe(`band${i}`);
        expect(FFTBandsNode.outputs[i].type).toBe('float');
      }
    });

    it('should generate FFT array access code', () => {
      const code = FFTBandsNode.generateCode({}, {});
      expect(code.band0).toBe('u_audio_fft[0]');
      expect(code.band7).toBe('u_audio_fft[7]');
    });
  });

  describe('BeatDetectorNode', () => {
    it('should have correct structure', () => {
      expect(BeatDetectorNode.type).toBe('audio_beat');
      expect(BeatDetectorNode.category).toBe('audio');
      expect(BeatDetectorNode.requiresAudio).toBe(true);
    });

    it('should have beat, beatRaw, and bpm outputs', () => {
      expect(BeatDetectorNode.outputs.map(o => o.name)).toEqual(['beat', 'beatRaw', 'bpm']);
    });

    it('should have threshold and decay params', () => {
      expect(BeatDetectorNode.params.map(p => p.name)).toEqual(['threshold', 'decay']);
    });

    it('should generate correct beat uniforms', () => {
      const code = BeatDetectorNode.generateCode({}, {});
      expect(code.beat).toBe('u_audio_beat');
      expect(code.beatRaw).toBe('u_audio_beat_raw');
      expect(code.bpm).toBe('u_audio_bpm');
    });
  });

  describe('VolumeNode', () => {
    it('should have correct structure', () => {
      expect(VolumeNode.type).toBe('audio_volume');
      expect(VolumeNode.category).toBe('audio');
      expect(VolumeNode.requiresAudio).toBe(true);
    });

    it('should have level, peak, and rms outputs', () => {
      expect(VolumeNode.outputs.map(o => o.name)).toEqual(['level', 'peak', 'rms']);
    });

    it('should apply gain to all outputs', () => {
      const code = VolumeNode.generateCode({}, { gain: 3.0 });
      expect(code.level).toContain('* 3.00');
      expect(code.peak).toContain('* 3.00');
      expect(code.rms).toContain('* 3.00');
    });
  });

  describe('audioNodes array', () => {
    it('should export all 4 audio nodes', () => {
      expect(audioNodes.length).toBe(4);
      expect(audioNodes).toContain(AudioInputNode);
      expect(audioNodes).toContain(FFTBandsNode);
      expect(audioNodes).toContain(BeatDetectorNode);
      expect(audioNodes).toContain(VolumeNode);
    });

    it('should all have requiresAudio flag', () => {
      audioNodes.forEach(node => {
        expect(node.requiresAudio).toBe(true);
      });
    });
  });
});

describe('Audio Uniforms', () => {
  const mockState: AudioAnalyzerState = {
    enabled: true,
    hasPermission: true,
    error: null,
    volume: 0.5,
    peak: 0.7,
    rms: 0.4,
    bass: 0.8,
    mid: 0.5,
    treble: 0.3,
    fftBands: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2],
    beat: 0.6,
    beatRaw: 0,
    bpm: 120,
  };

  it('should convert state to shader uniforms', () => {
    const uniforms = getAudioUniforms(mockState);
    
    expect(uniforms.u_audio_volume).toBe(0.5);
    expect(uniforms.u_audio_peak).toBe(0.7);
    expect(uniforms.u_audio_rms).toBe(0.4);
    expect(uniforms.u_audio_bass).toBe(0.8);
    expect(uniforms.u_audio_mid).toBe(0.5);
    expect(uniforms.u_audio_treble).toBe(0.3);
    expect(uniforms.u_audio_beat).toBe(0.6);
    expect(uniforms.u_audio_beat_raw).toBe(0);
  });

  it('should normalize BPM to 0-1 range', () => {
    const uniforms = getAudioUniforms(mockState);
    expect(uniforms.u_audio_bpm).toBe(0.6); // 120 / 200
  });

  it('should include FFT bands array', () => {
    const uniforms = getAudioUniforms(mockState);
    expect(uniforms.u_audio_fft).toEqual([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2]);
  });
});
