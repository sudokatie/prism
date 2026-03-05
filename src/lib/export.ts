// Shader export utilities

import type { NodeInstance, Edge, AnimationData } from './types';
import { generateGLSL, generateShadertoy } from './codegen';
import { getHelper } from './noise';

export interface ExportOptions {
  width?: number;
  height?: number;
  duration?: number;
  loop?: boolean;
  title?: string;
}

/**
 * Generate JavaScript code for easing functions
 */
function generateEasingCode(): string {
  return `
function easeLinear(t) { return t; }
function easeIn(t) { return t * t; }
function easeOut(t) { return 1 - (1 - t) * (1 - t); }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

function getEasing(mode) {
  switch(mode) {
    case 'easeIn': return easeIn;
    case 'easeOut': return easeOut;
    case 'easeInOut': return easeInOut;
    default: return easeLinear;
  }
}

function lerp(a, b, t) { return a + (b - a) * t; }

function lerpValue(a, b, t) {
  if (typeof a === 'number') return lerp(a, b, t);
  if (Array.isArray(a)) return a.map((v, i) => lerp(v, b[i], t));
  return a;
}
`;
}

/**
 * Generate JavaScript code for animation interpolation
 */
function generateAnimationCode(animation: AnimationData): string {
  const tracksJson = JSON.stringify(animation.tracks);
  const duration = animation.duration;
  
  return `
const animationTracks = ${tracksJson};
const animationDuration = ${duration};

function interpolateTrack(track, time) {
  const keyframes = track.keyframes;
  if (keyframes.length === 0) return null;
  if (keyframes.length === 1) return keyframes[0].value;
  
  // Clamp time
  const t = Math.max(0, Math.min(time, animationDuration));
  
  // Find surrounding keyframes
  let prevIdx = 0;
  for (let i = 0; i < keyframes.length; i++) {
    if (keyframes[i].time <= t) prevIdx = i;
  }
  
  const prev = keyframes[prevIdx];
  const nextIdx = Math.min(prevIdx + 1, keyframes.length - 1);
  const next = keyframes[nextIdx];
  
  if (prev === next || prev.time === next.time) return prev.value;
  
  // Interpolate
  const localT = (t - prev.time) / (next.time - prev.time);
  const easing = getEasing(prev.interpolation || 'linear');
  const easedT = easing(localT);
  
  return lerpValue(prev.value, next.value, easedT);
}

function getAnimatedUniforms(time) {
  const uniforms = {};
  for (const track of animationTracks) {
    const value = interpolateTrack(track, time);
    if (value !== null) {
      uniforms[track.nodeId + '_' + track.paramName] = value;
    }
  }
  return uniforms;
}
`;
}

/**
 * Export shader graph as standalone animated HTML
 */
export function exportAnimatedHTML(
  nodes: NodeInstance[],
  edges: Edge[],
  animation: AnimationData | null,
  options: ExportOptions = {}
): string {
  const {
    width = 512,
    height = 512,
    duration = animation?.duration || 10,
    loop = true,
    title = 'Prism Shader'
  } = options;
  
  // Generate shader code
  const result = generateGLSL(nodes, edges);
  if (!result.success || !result.code) {
    throw new Error(result.error || 'Failed to generate shader');
  }
  
  // Get helper code
  const helpers = (result.helpers || [])
    .map(h => getHelper(h))
    .filter(Boolean)
    .join('\n');
  
  // Build full fragment shader
  const fragmentShader = `precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

${helpers}

${result.code}`;

  // Escape for JavaScript string
  const escapedShader = fragmentShader
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
  
  const vertexShader = `attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

  const animationCode = animation 
    ? generateEasingCode() + generateAnimationCode(animation)
    : 'function getAnimatedUniforms() { return {}; }';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    canvas { display: block; max-width: 100%; }
    .controls { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); 
                display: flex; gap: 10px; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 8px; }
    button { background: #333; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    button:hover { background: #444; }
    .time { color: #fff; font-family: monospace; padding: 8px; }
  </style>
</head>
<body>
  <canvas id="canvas" width="${width}" height="${height}"></canvas>
  <div class="controls">
    <button id="playBtn">Play</button>
    <button id="resetBtn">Reset</button>
    <span class="time" id="timeDisplay">0.00s</span>
  </div>
  <script>
${animationCode}

const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

const vertexShaderSource = \`${vertexShader}\`;
const fragmentShaderSource = \`${escapedShader}\`;

function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const vs = createShader(gl.VERTEX_SHADER, vertexShaderSource);
const fs = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error('Program link error:', gl.getProgramInfoLog(program));
}

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

const positionLoc = gl.getAttribLocation(program, 'a_position');
const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
const timeLoc = gl.getUniformLocation(program, 'u_time');
const mouseLoc = gl.getUniformLocation(program, 'u_mouse');

let playing = true;
let startTime = performance.now();
let pausedTime = 0;
const duration = ${duration};
const loop = ${loop};

document.getElementById('playBtn').onclick = () => {
  playing = !playing;
  document.getElementById('playBtn').textContent = playing ? 'Pause' : 'Play';
  if (playing) startTime = performance.now() - pausedTime * 1000;
};

document.getElementById('resetBtn').onclick = () => {
  startTime = performance.now();
  pausedTime = 0;
};

let mouseX = 0.5, mouseY = 0.5;
canvas.onmousemove = (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = (e.clientX - rect.left) / rect.width;
  mouseY = 1 - (e.clientY - rect.top) / rect.height;
};

function render() {
  let time;
  if (playing) {
    time = (performance.now() - startTime) / 1000;
    if (loop) time = time % duration;
    else time = Math.min(time, duration);
    pausedTime = time;
  } else {
    time = pausedTime;
  }
  
  document.getElementById('timeDisplay').textContent = time.toFixed(2) + 's';
  
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  gl.useProgram(program);
  gl.enableVertexAttribArray(positionLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
  
  gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
  gl.uniform1f(timeLoc, time);
  gl.uniform2f(mouseLoc, mouseX, mouseY);
  
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  
  requestAnimationFrame(render);
}

render();
  </script>
</body>
</html>`;
}

/**
 * Export just the GLSL shader code
 */
export function exportGLSL(nodes: NodeInstance[], edges: Edge[]): string {
  const result = generateGLSL(nodes, edges);
  if (!result.success) {
    throw new Error(result.error || 'Failed to generate shader');
  }
  
  const helpers = (result.helpers || [])
    .map(h => getHelper(h))
    .filter(Boolean)
    .join('\n');
  
  return `// Generated by Prism
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

${helpers}

${result.code}`;
}

/**
 * Export shader in Shadertoy-compatible format.
 * 
 * Shadertoy uses different conventions:
 * - iResolution (vec3), iTime (float), iMouse (vec4) uniforms
 * - mainImage(out vec4 fragColor, in vec2 fragCoord) signature
 * 
 * Output can be pasted directly into https://www.shadertoy.com/new
 */
export function exportShadertoy(nodes: NodeInstance[], edges: Edge[]): string {
  const result = generateShadertoy(nodes, edges);
  if (!result.success) {
    throw new Error(result.error || 'Failed to generate Shadertoy shader');
  }
  
  return result.code!;
}
