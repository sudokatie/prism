/**
 * WebGL 2.0 renderer for Prism
 */

export interface Uniforms {
  u_time: number;
  u_resolution: [number, number];
  u_mouse: [number, number];
  // Audio uniforms (optional)
  u_audio_volume?: number;
  u_audio_peak?: number;
  u_audio_rms?: number;
  u_audio_bass?: number;
  u_audio_mid?: number;
  u_audio_treble?: number;
  u_audio_fft?: number[];
  u_audio_beat?: number;
  u_audio_beat_raw?: number;
  u_audio_bpm?: number;
}

export interface Renderer {
  init(canvas: HTMLCanvasElement): boolean;
  compile(fragmentShader: string): { success: boolean; error?: string };
  render(uniforms: Uniforms): void;
  dispose(): void;
}

// Vertex shader for fullscreen quad
const VERTEX_SHADER = `#version 300 es
in vec4 a_position;

void main() {
  gl_Position = a_position;
}
`;

/**
 * Create a WebGL 2.0 renderer
 */
export function createRenderer(): Renderer {
  let gl: WebGL2RenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let vao: WebGLVertexArrayObject | null = null;
  let buffer: WebGLBuffer | null = null;

  // Uniform locations cache
  let uTime: WebGLUniformLocation | null = null;
  let uResolution: WebGLUniformLocation | null = null;
  let uMouse: WebGLUniformLocation | null = null;
  // Audio uniform locations
  let uAudioVolume: WebGLUniformLocation | null = null;
  let uAudioPeak: WebGLUniformLocation | null = null;
  let uAudioRms: WebGLUniformLocation | null = null;
  let uAudioBass: WebGLUniformLocation | null = null;
  let uAudioMid: WebGLUniformLocation | null = null;
  let uAudioTreble: WebGLUniformLocation | null = null;
  let uAudioFft: WebGLUniformLocation | null = null;
  let uAudioBeat: WebGLUniformLocation | null = null;
  let uAudioBeatRaw: WebGLUniformLocation | null = null;
  let uAudioBpm: WebGLUniformLocation | null = null;

  function createShader(type: number, source: string): WebGLShader | null {
    if (!gl) return null;

    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  function getShaderError(shader: WebGLShader): string {
    if (!gl) return 'No WebGL context';
    return gl.getShaderInfoLog(shader) || 'Unknown shader error';
  }

  return {
    init(canvas: HTMLCanvasElement): boolean {
      gl = canvas.getContext('webgl2');
      if (!gl) return false;

      // Create fullscreen quad (two triangles covering -1 to 1)
      const positions = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]);

      buffer = gl.createBuffer();
      if (!buffer) return false;

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      vao = gl.createVertexArray();
      if (!vao) return false;

      gl.bindVertexArray(vao);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);

      return true;
    },

    compile(fragmentShader: string): { success: boolean; error?: string } {
      if (!gl) {
        return { success: false, error: 'No WebGL context' };
      }

      // Delete old program if exists
      if (program) {
        gl.deleteProgram(program);
        program = null;
      }

      // Create vertex shader
      const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
      if (!vertShader) {
        return { success: false, error: 'Failed to compile vertex shader' };
      }

      // Create fragment shader
      const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
      if (!fragShader) {
        gl.deleteShader(vertShader);
        return { success: false, error: 'Failed to create fragment shader' };
      }

      gl.shaderSource(fragShader, fragmentShader);
      gl.compileShader(fragShader);

      if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
        const error = getShaderError(fragShader);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
        return { success: false, error };
      }

      // Create program
      program = gl.createProgram();
      if (!program) {
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
        return { success: false, error: 'Failed to create program' };
      }

      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);

      // Clean up shaders (attached to program)
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(program) || 'Failed to link program';
        gl.deleteProgram(program);
        program = null;
        return { success: false, error };
      }

      // Cache uniform locations
      uTime = gl.getUniformLocation(program, 'u_time');
      uResolution = gl.getUniformLocation(program, 'u_resolution');
      uMouse = gl.getUniformLocation(program, 'u_mouse');
      // Audio uniform locations (may be null if not used in shader)
      uAudioVolume = gl.getUniformLocation(program, 'u_audio_volume');
      uAudioPeak = gl.getUniformLocation(program, 'u_audio_peak');
      uAudioRms = gl.getUniformLocation(program, 'u_audio_rms');
      uAudioBass = gl.getUniformLocation(program, 'u_audio_bass');
      uAudioMid = gl.getUniformLocation(program, 'u_audio_mid');
      uAudioTreble = gl.getUniformLocation(program, 'u_audio_treble');
      uAudioFft = gl.getUniformLocation(program, 'u_audio_fft');
      uAudioBeat = gl.getUniformLocation(program, 'u_audio_beat');
      uAudioBeatRaw = gl.getUniformLocation(program, 'u_audio_beat_raw');
      uAudioBpm = gl.getUniformLocation(program, 'u_audio_bpm');

      return { success: true };
    },

    render(uniforms: Uniforms): void {
      if (!gl || !program || !vao) return;

      // Set viewport to canvas size
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // Clear
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Use program
      gl.useProgram(program);

      // Set uniforms
      if (uTime !== null) {
        gl.uniform1f(uTime, uniforms.u_time);
      }
      if (uResolution !== null) {
        gl.uniform2f(uResolution, uniforms.u_resolution[0], uniforms.u_resolution[1]);
      }
      if (uMouse !== null) {
        gl.uniform2f(uMouse, uniforms.u_mouse[0], uniforms.u_mouse[1]);
      }
      // Set audio uniforms (only if provided)
      if (uAudioVolume !== null && uniforms.u_audio_volume !== undefined) {
        gl.uniform1f(uAudioVolume, uniforms.u_audio_volume);
      }
      if (uAudioPeak !== null && uniforms.u_audio_peak !== undefined) {
        gl.uniform1f(uAudioPeak, uniforms.u_audio_peak);
      }
      if (uAudioRms !== null && uniforms.u_audio_rms !== undefined) {
        gl.uniform1f(uAudioRms, uniforms.u_audio_rms);
      }
      if (uAudioBass !== null && uniforms.u_audio_bass !== undefined) {
        gl.uniform1f(uAudioBass, uniforms.u_audio_bass);
      }
      if (uAudioMid !== null && uniforms.u_audio_mid !== undefined) {
        gl.uniform1f(uAudioMid, uniforms.u_audio_mid);
      }
      if (uAudioTreble !== null && uniforms.u_audio_treble !== undefined) {
        gl.uniform1f(uAudioTreble, uniforms.u_audio_treble);
      }
      if (uAudioFft !== null && uniforms.u_audio_fft !== undefined) {
        gl.uniform1fv(uAudioFft, uniforms.u_audio_fft);
      }
      if (uAudioBeat !== null && uniforms.u_audio_beat !== undefined) {
        gl.uniform1f(uAudioBeat, uniforms.u_audio_beat);
      }
      if (uAudioBeatRaw !== null && uniforms.u_audio_beat_raw !== undefined) {
        gl.uniform1f(uAudioBeatRaw, uniforms.u_audio_beat_raw);
      }
      if (uAudioBpm !== null && uniforms.u_audio_bpm !== undefined) {
        gl.uniform1f(uAudioBpm, uniforms.u_audio_bpm);
      }

      // Draw fullscreen quad
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindVertexArray(null);
    },

    dispose(): void {
      if (gl) {
        if (program) {
          gl.deleteProgram(program);
          program = null;
        }
        if (buffer) {
          gl.deleteBuffer(buffer);
          buffer = null;
        }
        if (vao) {
          gl.deleteVertexArray(vao);
          vao = null;
        }
      }
      gl = null;
      uTime = null;
      uResolution = null;
      uMouse = null;
      // Clear audio uniforms
      uAudioVolume = null;
      uAudioPeak = null;
      uAudioRms = null;
      uAudioBass = null;
      uAudioMid = null;
      uAudioTreble = null;
      uAudioFft = null;
      uAudioBeat = null;
      uAudioBeatRaw = null;
      uAudioBpm = null;
    }
  };
}
