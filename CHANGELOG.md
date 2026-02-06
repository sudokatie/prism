# Changelog

All notable changes to Prism will be documented in this file.

## [0.1.0] - 2026-02-06

### Added

- Initial release
- Node-based visual shader editor using React Flow
- Real-time WebGL 2.0 preview with 60fps rendering
- 20 built-in nodes across 5 categories:
  - Input: UV, Time, Mouse, Resolution
  - Math: Add, Multiply, Sin, Cos, Mix, Smoothstep, Step, Fract
  - Pattern: Noise, Circle, Checker, Gradient
  - Color: RGB, HSV to RGB, Blend
  - Output: Final color output
- GLSL code generation with topological sorting
- Type-safe port connections with automatic conversions
- Simplex noise helper functions (2D and 3D)
- Properties panel for editing node parameters
- Node palette with drag-and-drop support
- Project save/load functionality (JSON format)
- Export to GLSL with syntax highlighting
- Keyboard shortcuts for common actions
- Dark theme UI with Tailwind CSS
- 170+ unit tests
