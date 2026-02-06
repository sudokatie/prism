import { NOISE_2D_HELPER, NOISE_3D_HELPER, HSV_TO_RGB_HELPER, getHelper, isValidGLSL } from '../lib/noise';

describe('Noise Helpers', () => {
  describe('NOISE_2D_HELPER', () => {
    it('should be valid GLSL', () => {
      expect(isValidGLSL(NOISE_2D_HELPER)).toBe(true);
    });

    it('should include snoise function', () => {
      expect(NOISE_2D_HELPER).toContain('float snoise(vec2');
    });

    it('should include permute helper', () => {
      expect(NOISE_2D_HELPER).toContain('permute');
    });
  });

  describe('NOISE_3D_HELPER', () => {
    it('should be valid GLSL', () => {
      expect(isValidGLSL(NOISE_3D_HELPER)).toBe(true);
    });

    it('should include snoise function', () => {
      expect(NOISE_3D_HELPER).toContain('float snoise(vec3');
    });

    it('should include taylorInvSqrt helper', () => {
      expect(NOISE_3D_HELPER).toContain('taylorInvSqrt');
    });
  });

  describe('HSV_TO_RGB_HELPER', () => {
    it('should be valid GLSL', () => {
      expect(isValidGLSL(HSV_TO_RGB_HELPER)).toBe(true);
    });

    it('should include hsv2rgb function', () => {
      expect(HSV_TO_RGB_HELPER).toContain('vec3 hsv2rgb(vec3');
    });
  });

  describe('getHelper', () => {
    it('should return noise2d helper', () => {
      expect(getHelper('noise2d')).toBe(NOISE_2D_HELPER);
    });

    it('should return noise3d helper', () => {
      expect(getHelper('noise3d')).toBe(NOISE_3D_HELPER);
    });

    it('should return hsv2rgb helper', () => {
      expect(getHelper('hsv2rgb')).toBe(HSV_TO_RGB_HELPER);
    });

    it('should return undefined for unknown helper', () => {
      expect(getHelper('unknown')).toBeUndefined();
    });
  });

  describe('isValidGLSL', () => {
    it('should accept valid GLSL', () => {
      expect(isValidGLSL('float foo(float x) { return x; }')).toBe(true);
      expect(isValidGLSL('vec3 bar(vec2 uv) { return vec3(uv, 1.0); }')).toBe(true);
    });

    it('should reject empty string', () => {
      expect(isValidGLSL('')).toBe(false);
    });

    it('should reject string without parens', () => {
      expect(isValidGLSL('float x = 1.0;')).toBe(false);
    });
  });
});
