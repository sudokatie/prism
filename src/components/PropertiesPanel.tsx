'use client';

/**
 * PropertiesPanel - Parameter editor for selected node
 */
import { useCallback, useState, useRef, useEffect } from 'react';
import { usePrismStore, selectSelectedNode } from '@/lib/store';
import { getNodeDef } from '@/components/nodes';
import type { ParamDef, Keyframe, KeyframeValue } from '@/lib/types';

// Animation callback type
type OnAddKeyframe = (nodeId: string, param: string, keyframe: Keyframe) => void;

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

  // Start drag (mouse or touch)
  const startDrag = useCallback((clientX: number) => {
    setIsDragging(true);
    dragStartRef.current = { x: clientX, startValue: value };
  }, [value]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    startDrag(e.clientX);
    e.preventDefault();
  }, [startDrag]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    startDrag(e.touches[0].clientX);
  }, [startDrag]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientX: number, shiftKey: boolean, ctrlKey: boolean) => {
      if (!dragStartRef.current) return;
      
      const deltaX = clientX - dragStartRef.current.x;
      
      // Determine increment based on modifier keys
      let increment = 0.1; // Normal
      if (shiftKey) increment = 0.01; // Fine
      if (ctrlKey) increment = 1.0; // Coarse
      
      const newValue = dragStartRef.current.startValue + deltaX * increment;
      onChange(clamp(newValue));
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.shiftKey, e.ctrlKey || e.metaKey);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      handleMove(e.touches[0].clientX, false, false);
    };

    const handleEnd = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDragging, clamp, onChange]);

  return (
    <input
      type="number"
      value={value}
      onChange={handleChange}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      step={0.1}
      min={param.min}
      max={param.max}
      className={`
        w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded
        text-white text-base focus:outline-none focus:border-blue-500
        touch-manipulation
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
      className="w-full h-10 rounded cursor-pointer touch-manipulation"
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
        w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded
        text-white text-base focus:outline-none focus:border-blue-500
        touch-manipulation
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
  onAnimate?: () => void;
  isAnimated?: boolean;
}

/**
 * Parameter row with label and input
 */
function ParamRow({ param, value, onChange, onAnimate, isAnimated }: ParamRowProps) {
  // Only float, vec2, vec3, vec4, color are animatable
  const isAnimatable = ['float', 'vec2', 'vec3', 'vec4', 'color'].includes(param.type);
  
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-400 capitalize">{param.name}</label>
        {isAnimatable && onAnimate && (
          <button
            onClick={onAnimate}
            className={`text-sm px-2.5 py-1 rounded touch-manipulation min-h-[32px] ${
              isAnimated
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600 active:bg-gray-500'
            }`}
            title={isAnimated ? 'Add keyframe at current time' : 'Add to animation'}
          >
            {isAnimated ? 'Key' : 'Animate'}
          </button>
        )}
      </div>

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
                flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded
                text-white text-base focus:outline-none focus:border-blue-500
                touch-manipulation
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
                flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded
                text-white text-base focus:outline-none focus:border-blue-500
                touch-manipulation
              "
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface PropertiesPanelProps {
  onAddKeyframe?: OnAddKeyframe;
  animatedParams?: Set<string>;  // Set of "nodeId.param" strings
  currentTime?: number;
}

/**
 * Properties panel sidebar
 */
export function PropertiesPanel({ 
  onAddKeyframe, 
  animatedParams,
  currentTime = 0 
}: PropertiesPanelProps) {
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

  const handleAnimate = (paramName: string, value: unknown) => {
    if (!onAddKeyframe) return;
    
    // Convert value to KeyframeValue
    let keyframeValue: KeyframeValue;
    if (typeof value === 'number') {
      keyframeValue = value;
    } else if (Array.isArray(value)) {
      keyframeValue = value as number[];
    } else {
      // Default fallback
      const param = def.params.find(p => p.name === paramName);
      keyframeValue = param?.default as KeyframeValue ?? 0;
    }
    
    onAddKeyframe(selectedNode.id, paramName, {
      time: Math.round(currentTime * 100) / 100,
      value: keyframeValue,
      interpolation: 'linear',
    });
  };

  return (
    <div className="h-48 bg-gray-800 border-t border-gray-700 p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold text-white mb-3">{def.label}</h2>

      {def.params.length === 0 ? (
        <p className="text-xs text-gray-500">No editable parameters</p>
      ) : (
        <div className="space-y-3">
          {def.params.map((param) => {
            const isAnimated = animatedParams?.has(`${selectedNode.id}.${param.name}`);
            return (
              <ParamRow
                key={param.name}
                param={param}
                value={selectedNode.params[param.name]}
                onChange={(value) => handleParamChange(param.name, value)}
                onAnimate={onAddKeyframe ? () => handleAnimate(param.name, selectedNode.params[param.name]) : undefined}
                isAnimated={isAnimated}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
