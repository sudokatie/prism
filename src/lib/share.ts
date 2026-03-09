/**
 * Preset sharing via URL encoding
 */
import pako from 'pako';
import type { Project } from './types';
import { validateProject } from './project';

const SHARE_VERSION = 'v1';
const MAX_URL_LENGTH = 8000; // Safe limit for most browsers

/**
 * Convert Uint8Array to base64url string
 */
function uint8ToBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes)
    .map(b => String.fromCharCode(b))
    .join('');
  const base64 = btoa(binary);
  // Convert to base64url: replace + with -, / with _, remove =
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Convert base64url string to Uint8Array
 */
function base64UrlToUint8(str: string): Uint8Array {
  // Convert from base64url: replace - with +, _ with /
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encode a project as a shareable string
 */
export function encodePreset(project: Project): string {
  const json = JSON.stringify(project);
  const compressed = pako.deflate(json);
  const encoded = uint8ToBase64Url(compressed);
  return `${SHARE_VERSION}_${encoded}`;
}

/**
 * Decode a shared string back to a project
 * Returns null if invalid
 */
export function decodePreset(encoded: string): Project | null {
  try {
    // Check version prefix
    const parts = encoded.split('_');
    if (parts.length < 2 || parts[0] !== SHARE_VERSION) {
      return null;
    }
    
    // Decode and decompress
    const data = parts.slice(1).join('_'); // Handle any _ in the base64
    const compressed = base64UrlToUint8(data);
    const json = pako.inflate(compressed, { to: 'string' });
    const project = JSON.parse(json) as Project;
    
    // Validate the project structure
    if (!validateProject(project)) {
      return null;
    }
    
    return project;
  } catch {
    return null;
  }
}

/**
 * Get a full share URL for a project
 * Returns null if the URL would be too long
 */
export function getShareUrl(project: Project): string | null {
  const encoded = encodePreset(project);
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}`
    : '';
  const url = `${baseUrl}?share=${encoded}`;
  
  if (url.length > MAX_URL_LENGTH) {
    return null;
  }
  
  return url;
}

/**
 * Parse share parameter from current URL
 * Returns the decoded project or null
 */
export function parseShareParam(): Project | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const params = new URLSearchParams(window.location.search);
  const share = params.get('share');
  
  if (!share) {
    return null;
  }
  
  return decodePreset(share);
}

/**
 * Clear the share parameter from URL without reload
 */
export function clearShareParam(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const url = new URL(window.location.href);
  url.searchParams.delete('share');
  window.history.replaceState({}, '', url.toString());
}

/**
 * Check if a project can be shared (URL not too long)
 */
export function canShare(project: Project): boolean {
  return getShareUrl(project) !== null;
}
