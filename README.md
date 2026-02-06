# Prism

Visual shader programming for generative art. Create stunning shaders without writing code.

## Features

- Node-based visual editor for shader creation
- Real-time WebGL 2.0 preview at 60fps
- 20+ built-in nodes (input, math, pattern, color, output)
- Type-safe connections with automatic conversions
- Export to GLSL for use in other projects
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

## Node Reference

### Input Nodes
- **UV** - Screen coordinates (0-1)
- **Time** - Elapsed seconds with configurable speed
- **Mouse** - Normalized mouse position
- **Resolution** - Canvas size in pixels

### Math Nodes
- **Add/Multiply** - Basic arithmetic
- **Sin/Cos** - Trigonometric functions
- **Mix** - Linear interpolation
- **Smoothstep/Step** - Threshold functions
- **Fract** - Fractional part

### Pattern Nodes
- **Noise** - Simplex noise with octaves
- **Circle** - Circular distance field
- **Checker** - Checkerboard pattern
- **Gradient** - Linear/radial gradients

### Color Nodes
- **RGB** - Constant color picker
- **HSV to RGB** - Color space conversion
- **Blend** - Multiple blend modes

### Output
- **Output** - Final color (required)

## Keyboard Shortcuts

- **Delete/Backspace** - Remove selected node
- **Cmd/Ctrl+D** - Duplicate selected node
- **Cmd/Ctrl+S** - Save project
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

## License

MIT
