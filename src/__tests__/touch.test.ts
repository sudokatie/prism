/**
 * Tests for mobile touch support configuration
 */
import * as fs from 'fs';
import * as path from 'path';

describe('Mobile Touch Support', () => {
  describe('viewport configuration', () => {
    it('layout.tsx exports viewport with touch-friendly settings', () => {
      const source = fs.readFileSync(
        path.join(__dirname, '../app/layout.tsx'),
        'utf-8'
      );
      
      // Check for viewport export
      expect(source).toContain('export const viewport');
      expect(source).toContain('device-width');
      expect(source).toContain('userScalable: false');
      expect(source).toContain('viewportFit: "cover"');
    });

    it('layout.tsx has PWA-ready metadata', () => {
      const source = fs.readFileSync(
        path.join(__dirname, '../app/layout.tsx'),
        'utf-8'
      );
      
      expect(source).toContain('title: "Prism - Visual Shader Editor"');
      expect(source).toContain('appleWebApp');
      expect(source).toContain('capable: true');
    });
  });

  describe('touch utility classes', () => {
    it('PropertiesPanel uses touch-friendly styling', () => {
      const source = fs.readFileSync(
        path.join(__dirname, '../components/PropertiesPanel.tsx'),
        'utf-8'
      );
      
      // Check for touch-manipulation class (prevents 300ms tap delay)
      expect(source).toContain('touch-manipulation');
      
      // Check for larger touch targets (py-2 instead of py-1)
      expect(source).toContain('py-2');
      
      // Check for text-base (larger than text-sm for readability)
      expect(source).toContain('text-base');
    });

    it('Canvas has touch-none to prevent scroll interference', () => {
      const source = fs.readFileSync(
        path.join(__dirname, '../components/Canvas.tsx'),
        'utf-8'
      );
      
      expect(source).toContain('touch-none');
    });
  });

  describe('ReactFlow touch configuration', () => {
    it('Canvas has touch-friendly ReactFlow props', () => {
      const source = fs.readFileSync(
        path.join(__dirname, '../components/Canvas.tsx'),
        'utf-8'
      );
      
      // Check for touch configuration props
      expect(source).toContain('panOnDrag={true}');
      expect(source).toContain('zoomOnPinch={true}');
      expect(source).toContain('zoomOnDoubleClick={false}');
      expect(source).toContain('selectNodesOnDrag={false}');
      expect(source).toContain('minZoom={0.25}');
      expect(source).toContain('maxZoom={2}');
    });
  });

  describe('FloatInput touch events', () => {
    it('PropertiesPanel FloatInput has touch handlers', () => {
      const source = fs.readFileSync(
        path.join(__dirname, '../components/PropertiesPanel.tsx'),
        'utf-8'
      );
      
      // Check for touch event handlers
      expect(source).toContain('onTouchStart');
      expect(source).toContain('handleTouchStart');
      expect(source).toContain('touchmove');
      expect(source).toContain('touchend');
      expect(source).toContain('touchcancel');
    });
  });
});
