'use client';

/**
 * PropertiesPanel - Parameter editor for selected node
 */
import { useCallback, useState, useRef, useEffect } from 'react';
import { usePrismStore, selectSelectedNode } from '@/lib/store';
import { getNodeDef } from '@/components/nodes';
import type { ParamDef } from '@/lib/types';

interface FloatInputProps {
  param: ParamDef;
  value: number;
  onChange: (value: number) => void;
}

/**
 * Float input with drag-to-adjust
 * - Normal drag: 0.1 increment
 * - Shift+drag: 0.01 increment (fine)
 * - Ctrl+drag: 1.0 increment (coarse)
 */
function FloatInput({ param, value, onChange }: FloatInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; startValue: number } | null>(null);

  const clamp = useCallback((v: number) => {
    return Math.max(param.min ?? -Infinity, Math.min(param.max ?? Infinity, v));
  }, [param.min, param.max]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      if (!isNaN(v)) {
        onChange(clamp(v));
      }
    },
    [clamp, onChange]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start drag on left click
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, startValue: value };
    e.preventDefault();
  }, [value]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      
      const deltaX = e.clientX - dragStartRef.current.x;
      
      // Determine increment based on modifier keys
      let increment = 0.1; // Normal
      if (e.shiftKey) increment = 0.01; // Fine
      if (e.ctrlKey || e.metaKey) increment = 1.0; // Coarse
      
      const newValue = dragStartRef.current.startValue + deltaX * increment;
      onChange(clamp(newValue));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, clamp, onChange]);

  return (
    <input
      type="number"
      value={value}
      onChange={handleChange}
      onMouseDown={handleMouseDown}
      step={0.1}
      min={param.min}
      max={param.max}
      className={`
        w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded
        text-white text-sm focus:outline-none focus:border-blue-500
        ${isDragging ? 'cursor-ew-resize' : 'cursor-text'}
      `}
      style={{ cursor: isDragging ? 'ew-resize' : undefined }}
    />
  );
}

interface ColorInputProps {
  value: number[];
  onChange: (value: number[]) => void;
}

/**
 * Color picker for vec3 color values
 */
function ColorInput({ value, onChange }: ColorInputProps) {
  // Convert 0-1 to hex
  const toHex = (rgb: number[]) => {
    const r = Math.round((rgb[0] ?? 0) * 255);
    const g = Math.round((rgb[1] ?? 0) * 255);
    const b = Math.round((rgb[2] ?? 0) * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Convert hex to 0-1
  const fromHex = (hex: string): number[] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(fromHex(e.target.value));
    },
    [onChange]
  );

  return (
    <input
      type="color"
      value={toHex(value)}
      onChange={handleChange}
      className="w-full h-8 rounded cursor-pointer"
    />
  );
}

interface SelectInputProps {
  param: ParamDef;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Dropdown select for enum values
 */
function SelectInput({ param, value, onChange }: SelectInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <select
      value={value}
      onChange={handleChange}
      className="
        w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded
        text-white text-sm focus:outline-none focus:border-blue-500
      "
    >
      {param.options?.map((option) => {
        // Handle both string options and {label, value} objects
        const optValue = typeof option === 'string' ? option : (option as { value: string }).value;
        const optLabel = typeof option === 'string' ? option : (option as { label: string }).label;
        return (
          <option key={optValue} value={optValue}>
            {optLabel}
          </option>
        );
      })}
    </select>
  );
}

interface ParamRowProps {
  param: ParamDef;
  value: unknown;
  onChange: (value: unknown) => void;
}

/**
 * Parameter row with label and input
 */
function ParamRow({ param, value, onChange }: ParamRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 capitalize">{param.name}</label>

      {param.type === 'float' && (
        <FloatInput
          param={param}
          value={value as number ?? param.default as number}
          onChange={onChange}
        />
      )}

      {param.type === 'color' && (
        <ColorInput
          value={value as number[] ?? param.default as number[] ?? [1, 1, 1]}
          onChange={onChange}
        />
      )}

      {param.type === 'select' && (
        <SelectInput
          param={param}
          value={value as string ?? param.default as string}
          onChange={onChange}
        />
      )}

      {param.type === 'vec2' && (
        <div className="flex gap-2">
          {['x', 'y'].map((axis, i) => (
            <input
              key={axis}
              type="number"
              step={0.1}
              value={(value as number[] ?? param.default as number[])?.[i] ?? 0}
              onChange={(e) => {
                const arr = [...(value as number[] ?? param.default as number[] ?? [0, 0])];
                arr[i] = parseFloat(e.target.value) || 0;
                onChange(arr);
              }}
              placeholder={axis}
              className="
                flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded
                text-white text-sm focus:outline-none focus:border-blue-500
              "
            />
          ))}
        </div>
      )}

      {param.type === 'vec3' && !param.name.toLowerCase().includes('color') && (
        <div className="flex gap-2">
          {['x', 'y', 'z'].map((axis, i) => (
            <input
              key={axis}
              type="number"
              step={0.1}
              value={(value as number[] ?? param.default as number[])?.[i] ?? 0}
              onChange={(e) => {
                const arr = [...(value as number[] ?? param.default as number[] ?? [0, 0, 0])];
                arr[i] = parseFloat(e.target.value) || 0;
                onChange(arr);
              }}
              placeholder={axis}
              className="
                flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded
                text-white text-sm focus:outline-none focus:border-blue-500
              "
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Properties panel sidebar
 */
export function PropertiesPanel() {
  const selectedNode = usePrismStore(selectSelectedNode);
  const { updateNodeParam } = usePrismStore();

  if (!selectedNode) {
    return (
      <div className="h-48 bg-gray-800 border-t border-gray-700 p-4">
        <h2 className="text-sm font-semibold text-gray-400">Properties</h2>
        <p className="text-xs text-gray-500 mt-2">Select a node to edit its properties</p>
      </div>
    );
  }

  const def = getNodeDef(selectedNode.type);
  if (!def) return null;

  const handleParamChange = (paramName: string, value: unknown) => {
    updateNodeParam(selectedNode.id, paramName, value);
  };

  return (
    <div className="h-48 bg-gray-800 border-t border-gray-700 p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold text-white mb-3">{def.label}</h2>

      {def.params.length === 0 ? (
        <p className="text-xs text-gray-500">No editable parameters</p>
      ) : (
        <div className="space-y-3">
          {def.params.map((param) => (
            <ParamRow
              key={param.name}
              param={param}
              value={selectedNode.params[param.name]}
              onChange={(value) => handleParamChange(param.name, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
