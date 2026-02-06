'use client';

/**
 * Toolbar - Top toolbar with project actions
 */
import { useCallback, useState } from 'react';
import { usePrismStore, selectProjectName, selectIsModified } from '@/lib/store';
import { useCompiler } from '@/hooks/useCompiler';

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
 * Export modal for GLSL code
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
          {code}
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
  const { code } = useCompiler();

  const [showExport, setShowExport] = useState(false);

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
        } catch (err) {
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
          <Button onClick={handleLoad}>Load</Button>
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={handleExport} variant="primary">Export GLSL</Button>
        </div>

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
    </>
  );
}
