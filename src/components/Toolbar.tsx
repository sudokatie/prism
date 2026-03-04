'use client';

/**
 * Toolbar - Top toolbar with project actions
 */
import { useCallback, useState } from 'react';
import { usePrismStore, selectProjectName, selectIsModified } from '@/lib/store';
import { useCompiler } from '@/hooks/useCompiler';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';
import { PresetBrowser } from './PresetBrowser';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
}

/**
 * Toolbar button component
 */
function Button({ onClick, children, variant = 'default', disabled = false }: ButtonProps) {
  const baseStyles = 'px-3 py-1.5 text-sm font-medium rounded transition-colors disabled:opacity-50';
  const variants = {
    default: 'bg-gray-700 text-white hover:bg-gray-600',
    primary: 'bg-blue-600 text-white hover:bg-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-500',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

/**
 * Simple GLSL syntax highlighting
 */
function highlightGLSL(code: string): React.ReactNode[] {
  const keywords = /\b(void|float|vec2|vec3|vec4|mat2|mat3|mat4|int|bool|uniform|in|out|precision|highp|mediump|lowp|const|return|if|else|for|while|break|continue|discard)\b/g;
  const functions = /\b(sin|cos|tan|asin|acos|atan|pow|exp|log|sqrt|abs|sign|floor|ceil|fract|mod|min|max|clamp|mix|step|smoothstep|length|distance|dot|cross|normalize|reflect|refract|texture)\b/g;
  const numbers = /\b(\d+\.?\d*[eE]?[+-]?\d*|0x[0-9a-fA-F]+)\b/g;
  const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
  const preprocessor = /^(\s*#\w+.*$)/gm;

  // Split by lines to maintain structure
  const lines = code.split('\n');
  
  return lines.map((line, i) => {
    // Highlight the line
    const highlighted = line
      .replace(comments, '<span class="text-gray-500">$1</span>')
      .replace(preprocessor, '<span class="text-purple-400">$1</span>')
      .replace(keywords, '<span class="text-blue-400">$1</span>')
      .replace(functions, '<span class="text-yellow-400">$1</span>')
      .replace(numbers, '<span class="text-green-400">$1</span>');
    
    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: highlighted }} />
        {i < lines.length - 1 && '\n'}
      </span>
    );
  });
}

/**
 * Export modal for GLSL code with syntax highlighting
 */
function ExportModal({ code, onClose }: { code: string; onClose: () => void }) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
  }, [code]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shader.glsl';
    a.click();
    URL.revokeObjectURL(url);
  }, [code]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Export GLSL</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            ×
          </button>
        </div>

        <pre className="flex-1 overflow-auto p-4 text-sm text-gray-300 font-mono bg-gray-900">
          {highlightGLSL(code)}
        </pre>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-700">
          <Button onClick={handleCopy}>Copy to Clipboard</Button>
          <Button onClick={handleDownload} variant="primary">Download .glsl</Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Main toolbar component
 */
export function Toolbar() {
  const projectName = usePrismStore(selectProjectName);
  const isModified = usePrismStore(selectIsModified);
  const { newProject, setProjectName } = usePrismStore();
  const { code, requiresAudio } = useCompiler();
  const audio = useAudioAnalyzer();

  const [showExport, setShowExport] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // Toggle audio
  const handleToggleAudio = useCallback(() => {
    if (audio.enabled) {
      audio.stop();
    } else {
      audio.start();
    }
  }, [audio]);

  // New project
  const handleNew = useCallback(() => {
    if (isModified && !confirm('Discard unsaved changes?')) return;
    newProject();
  }, [isModified, newProject]);

  // Save project (download JSON)
  const handleSave = useCallback(() => {
    const project = usePrismStore.getState().getProject();
    const json = JSON.stringify(project, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
    usePrismStore.getState().setModified(false);
  }, []);

  // Load project (file picker)
  const handleLoad = useCallback(() => {
    if (isModified && !confirm('Discard unsaved changes?')) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const project = JSON.parse(e.target?.result as string);
          usePrismStore.getState().loadProject(project);
        } catch {
          alert('Invalid project file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [isModified]);

  // Export GLSL
  const handleExport = useCallback(() => {
    if (code) {
      setShowExport(true);
    } else {
      alert('Add an Output node to generate GLSL');
    }
  }, [code]);

  return (
    <>
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-4">
        {/* Project name */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="
              bg-transparent text-white font-semibold text-lg
              border-b border-transparent hover:border-gray-600 focus:border-blue-500
              focus:outline-none px-1
            "
          />
          {isModified && <span className="text-gray-500 text-sm">*</span>}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-700" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button onClick={handleNew}>New</Button>
          <Button onClick={() => setShowPresets(true)}>Presets</Button>
          <Button onClick={handleLoad}>Load</Button>
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={handleExport} variant="primary">Export GLSL</Button>
        </div>

        {/* Audio control (only shown when audio nodes are used) */}
        {requiresAudio && (
          <>
            <div className="h-6 w-px bg-gray-700" />
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleToggleAudio} 
                variant={audio.enabled ? 'danger' : 'default'}
              >
                {audio.enabled ? '🎤 Stop Audio' : '🎤 Enable Audio'}
              </Button>
              {audio.enabled && (
                <div className="flex items-center gap-1">
                  <div 
                    className="w-2 h-4 bg-green-500 rounded-sm transition-all"
                    style={{ opacity: 0.3 + audio.bass * 0.7 }}
                  />
                  <div 
                    className="w-2 h-4 bg-yellow-500 rounded-sm transition-all"
                    style={{ opacity: 0.3 + audio.mid * 0.7 }}
                  />
                  <div 
                    className="w-2 h-4 bg-red-500 rounded-sm transition-all"
                    style={{ opacity: 0.3 + audio.treble * 0.7 }}
                  />
                </div>
              )}
              {audio.error && (
                <span className="text-red-400 text-xs">{audio.error}</span>
              )}
            </div>
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Status */}
        {code ? (
          <span className="text-green-400 text-sm">Shader compiled</span>
        ) : (
          <span className="text-gray-500 text-sm">No shader</span>
        )}
      </div>

      {/* Export modal */}
      {showExport && code && (
        <ExportModal code={code} onClose={() => setShowExport(false)} />
      )}

      {/* Preset browser */}
      {showPresets && (
        <PresetBrowser onClose={() => setShowPresets(false)} />
      )}
    </>
  );
}
