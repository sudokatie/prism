# Prism

Visual shader programming for generative art. Create stunning shaders without writing code.

## Features

- Node-based visual editor for shader creation
- Real-time WebGL 2.0 preview at 60fps
- 46 built-in nodes (input, math, pattern, color, distortion, output)
- Preset library with 12 ready-to-use shaders
- Type-safe connections with automatic conversions
- Export to GLSL, HLSL, and Metal
- Save/load projects as JSON

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to start creating.

## Node Reference (46 nodes)

### Input Nodes
- **UV** - Screen coordinates (0-1)
- **Time** - Elapsed seconds with configurable speed
- **Mouse** - Normalized mouse position
- **Resolution** - Canvas size in pixels

### Math Nodes
- **Add/Subtract/Multiply/Divide** - Basic arithmetic
- **Sin/Cos** - Trigonometric functions
- **Mix** - Linear interpolation
- **Smoothstep/Step** - Threshold functions
- **Fract** - Fractional part
- **Abs/Min/Max/Clamp** - Value constraints
- **Floor/Ceil/Mod** - Rounding operations
- **Pow/Sqrt** - Power functions
- **Remap** - Value remapping

### Pattern Nodes
- **Noise** - Simplex noise with octaves
- **Circle** - Circular distance field
- **Checker** - Checkerboard pattern
- **Gradient** - Linear/radial gradients

### Color Nodes
- **RGB** - Constant color picker
- **HSV to RGB** - Color space conversion
- **Blend** - Multiple blend modes

### Color Grading Nodes (new in v0.2)
- **Levels** - Black/white point, gamma, output range
- **Brightness/Contrast** - Basic adjustments
- **Color Balance** - Shadows/midtones/highlights RGB shifts
- **Vibrance** - Intelligent saturation
- **Posterize** - Reduce color levels

### Distortion Nodes (new in v0.2)
- **Wave** - Sine wave distortion
- **Ripple** - Radial ripple effect
- **Displacement** - UV displacement mapping
- **Twist** - Rotational twist
- **Pixelate** - Pixel grid effect
- **Swirl** - Spiral distortion

### Blur/Effect Nodes (new in v0.2)
- **Chromatic Aberration** - RGB channel separation
- **Radial Blur** - Zoom blur effect
- **Motion Blur** - Directional blur
- **Sharpen** - Edge enhancement
- **Vignette** - Darken edges

### Output
- **Output** - Final color (required)

## Preset Library (new in v0.3)

Click "Presets" in the toolbar to browse 12 built-in shader presets organized by category:

### Patterns
- **Plasma Wave** - Classic demoscene effect with animated color waves
- **Checkerboard** - Simple animated checkerboard pattern
- **Noise Field** - Animated simplex noise with color gradient

### Effects
- **Radial Pulse** - Pulsing circular waves from center
- **Wave Distortion** - Animated wave distortion effect
- **Pixelate** - Retro pixelated noise effect
- **Chromatic Shift** - RGB channel separation with noise
- **Twist** - Spiral twist distortion with noise
- **Vignette Glow** - Pulsing vignette with color glow

### Generators
- **Fractal Noise** - Multi-octave fractal brownian motion
- **Voronoi Cells** - Animated cellular pattern with color
- **Gradient Flow** - Smooth animated color gradient

Presets provide a starting point - modify and build upon them to create your own effects.

## Animation (new in v0.3)

Animate shader parameters over time with keyframe animation.

### Timeline Controls
- **Cmd/Ctrl+T** - Toggle timeline visibility
- **Space** - Play/pause animation (when timeline visible)
- Click timeline to seek
- Click on track to add keyframe
- Drag keyframes to move them
- Right-click keyframe to delete

### Interpolation Modes
- **Linear** - Constant rate of change (blue)
- **Ease In** - Slow start, fast end (green)
- **Ease Out** - Fast start, slow end (yellow)
- **Ease In-Out** - Smooth start and end (purple)

### Features
- Real-time parameter animation
- Multiple tracks per project
- Loop toggle
- Adjustable duration
- Export animated shaders with time uniforms

## Keyboard Shortcuts

- **Delete/Backspace** - Remove selected node
- **Cmd/Ctrl+D** - Duplicate selected node
- **Cmd/Ctrl+S** - Save project
- **Cmd/Ctrl+T** - Toggle animation timeline
- **Space** - Play/pause animation
- **Escape** - Deselect

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- React Flow for node editor
- WebGL 2.0 for rendering
- Zustand for state management
- Tailwind CSS for styling

## Export

Click "Export GLSL" to get your shader code. The generated code is WebGL 2.0 compatible and includes all necessary uniforms:

```glsl
uniform float u_time;      // Elapsed seconds
uniform vec2 u_resolution; // Canvas size
uniform vec2 u_mouse;      // Mouse position (0-1)
```

### Export Formats

- **GLSL** - WebGL 2.0 fragment shader (default)
- **HLSL** - DirectX pixel shader (new in v0.2)
- **Metal** - Apple Metal fragment shader (new in v0.2)

HLSL and Metal exports handle all type conversions (vec2 -> float2, fract -> frac, etc.) and generate proper shader structures for each platform.

## License

MIT
