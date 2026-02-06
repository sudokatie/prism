/**
 * Tests for WebGL renderer
 */
import { createRenderer, Renderer, Uniforms } from '../lib/webgl';

// Mock WebGL2RenderingContext
class MockWebGL2RenderingContext {
  canvas = { width: 800, height: 600 };

  private programs: object[] = [];
  private shaders: object[] = [];
  private buffers: object[] = [];
  private vaos: object[] = [];
  private compileStatus = true;
  private linkStatus = true;
  private errorLog = '';

  // Control compile/link status for tests
  setCompileStatus(status: boolean, log = '') {
    this.compileStatus = status;
    this.errorLog = log;
  }
  setLinkStatus(status: boolean, log = '') {
    this.linkStatus = status;
    this.errorLog = log;
  }

  createShader(type: number) {
    const shader = { type };
    this.shaders.push(shader);
    return shader;
  }
  shaderSource(_shader: WebGLShader, _source: string) {}
  compileShader(_shader: WebGLShader) {}
  getShaderParameter(_shader: WebGLShader, pname: number) {
    if (pname === 0x8B81) return this.compileStatus; // COMPILE_STATUS
    return true;
  }
  getShaderInfoLog(_shader: WebGLShader) {
    return this.errorLog;
  }
  deleteShader(_shader: WebGLShader) {}

  createProgram() {
    const program = {};
    this.programs.push(program);
    return program;
  }
  attachShader(_program: WebGLProgram, _shader: WebGLShader) {}
  linkProgram(_program: WebGLProgram) {}
  getProgramParameter(_program: WebGLProgram, pname: number) {
    if (pname === 0x8B82) return this.linkStatus; // LINK_STATUS
    return true;
  }
  getProgramInfoLog(_program: WebGLProgram) {
    return this.errorLog;
  }
  deleteProgram(_program: WebGLProgram) {}
  useProgram(_program: WebGLProgram) {}

  getUniformLocation(_program: WebGLProgram, name: string) {
    return { name };
  }
  uniform1f(_location: WebGLUniformLocation, _x: number) {}
  uniform2f(_location: WebGLUniformLocation, _x: number, _y: number) {}

  createBuffer() {
    const buffer = {};
    this.buffers.push(buffer);
    return buffer;
  }
  bindBuffer(_target: number, _buffer: WebGLBuffer | null) {}
  bufferData(_target: number, _data: ArrayBufferView, _usage: number) {}
  deleteBuffer(_buffer: WebGLBuffer) {}

  createVertexArray() {
    const vao = {};
    this.vaos.push(vao);
    return vao;
  }
  bindVertexArray(_vao: WebGLVertexArrayObject | null) {}
  enableVertexAttribArray(_index: number) {}
  vertexAttribPointer() {}
  deleteVertexArray(_vao: WebGLVertexArrayObject) {}

  viewport(_x: number, _y: number, _width: number, _height: number) {}
  clearColor(_r: number, _g: number, _b: number, _a: number) {}
  clear(_mask: number) {}
  drawArrays(_mode: number, _first: number, _count: number) {}

  // Constants
  VERTEX_SHADER = 0x8B31;
  FRAGMENT_SHADER = 0x8B30;
  COMPILE_STATUS = 0x8B81;
  LINK_STATUS = 0x8B82;
  ARRAY_BUFFER = 0x8892;
  STATIC_DRAW = 0x88E4;
  FLOAT = 0x1406;
  TRIANGLES = 0x0004;
  COLOR_BUFFER_BIT = 0x4000;
}

// Mock canvas element
function createMockCanvas(supportWebGL = true): HTMLCanvasElement {
  const mockGL = supportWebGL ? new MockWebGL2RenderingContext() : null;
  return {
    getContext: (contextId: string) => {
      if (contextId === 'webgl2') return mockGL;
      return null;
    },
    width: 800,
    height: 600,
  } as unknown as HTMLCanvasElement;
}

// Sample fragment shader for testing
const SAMPLE_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  fragColor = vec4(uv, 0.5 + 0.5 * sin(u_time), 1.0);
}
`;

describe('WebGL Renderer', () => {
  let renderer: Renderer;

  beforeEach(() => {
    renderer = createRenderer();
  });

  afterEach(() => {
    renderer.dispose();
  });

  describe('init', () => {
    it('should initialize successfully with WebGL2 support', () => {
      const canvas = createMockCanvas(true);
      const result = renderer.init(canvas);
      expect(result).toBe(true);
    });

    it('should fail initialization without WebGL2 support', () => {
      const canvas = createMockCanvas(false);
      const result = renderer.init(canvas);
      expect(result).toBe(false);
    });
  });

  describe('compile', () => {
    it('should compile valid shader successfully', () => {
      const canvas = createMockCanvas(true);
      renderer.init(canvas);

      const result = renderer.compile(SAMPLE_FRAGMENT_SHADER);
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error without initialized context', () => {
      const result = renderer.compile(SAMPLE_FRAGMENT_SHADER);
      expect(result.success).toBe(false);
      expect(result.error).toBe('No WebGL context');
    });

    it('should return shader compilation error', () => {
      const canvas = createMockCanvas(true);
      renderer.init(canvas);

      // Get the mock GL context and set it to fail compilation
      const gl = canvas.getContext('webgl2') as unknown as MockWebGL2RenderingContext;
      gl.setCompileStatus(false, 'ERROR: Syntax error on line 5');

      const result = renderer.compile('invalid shader code');
      expect(result.success).toBe(false);
      // Vertex shader compiles first, so error mentions vertex shader
      expect(result.error).toBeDefined();
    });
  });

  describe('render', () => {
    it('should render without error', () => {
      const canvas = createMockCanvas(true);
      renderer.init(canvas);
      renderer.compile(SAMPLE_FRAGMENT_SHADER);

      const uniforms: Uniforms = {
        u_time: 1.5,
        u_resolution: [800, 600],
        u_mouse: [0.5, 0.5],
      };

      // Should not throw
      expect(() => renderer.render(uniforms)).not.toThrow();
    });

    it('should handle render before compile gracefully', () => {
      const canvas = createMockCanvas(true);
      renderer.init(canvas);

      const uniforms: Uniforms = {
        u_time: 0,
        u_resolution: [800, 600],
        u_mouse: [0, 0],
      };

      // Should not throw even without compiled program
      expect(() => renderer.render(uniforms)).not.toThrow();
    });
  });

  describe('dispose', () => {
    it('should clean up resources', () => {
      const canvas = createMockCanvas(true);
      renderer.init(canvas);
      renderer.compile(SAMPLE_FRAGMENT_SHADER);

      // Should not throw
      expect(() => renderer.dispose()).not.toThrow();

      // After dispose, compile should fail (no context)
      const result = renderer.compile(SAMPLE_FRAGMENT_SHADER);
      expect(result.success).toBe(false);
    });
  });
});
