'use client';

/**
 * BaseNode - Shared node UI component for all node types
 */
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import type { NodeDef, PortType } from '@/lib/types';

// Port type to color mapping
const PORT_COLORS: Record<PortType, string> = {
  float: '#4299e1',  // Blue
  vec2: '#48bb78',   // Green
  vec3: '#ecc94b',   // Yellow
  vec4: '#9f7aea',   // Purple
};

// Get CSS color for port type
function getPortColor(type: PortType): string {
  return PORT_COLORS[type] || '#a0aec0';
}

export interface BaseNodeData {
  def: NodeDef;
  params: Record<string, unknown>;
}

type BaseNodeProps = NodeProps<BaseNodeData>;

/**
 * Base node component used by all node types
 */
function BaseNodeComponent({ data, selected }: BaseNodeProps) {
  const { def, params } = data;

  return (
    <div
      className={`
        bg-gray-800 rounded-lg shadow-lg min-w-[140px]
        border-2 transition-colors
        ${selected ? 'border-blue-400' : 'border-gray-600'}
      `}
    >
      {/* Header */}
      <div
        className={`
          px-3 py-2 rounded-t-md font-medium text-sm text-white
          ${getCategoryColor(def.category)}
        `}
      >
        {def.label}
      </div>

      {/* Body with ports */}
      <div className="relative px-2 py-3">
        {/* Input ports (left side) */}
        <div className="flex flex-col gap-2">
          {def.inputs.map((input, index) => (
            <div key={input.name} className="flex items-center gap-2 text-xs text-gray-300">
              <Handle
                type="target"
                position={Position.Left}
                id={input.name}
                style={{
                  background: getPortColor(input.type),
                  width: 10,
                  height: 10,
                  border: '2px solid #1a202c',
                  top: `${28 + index * 24}px`,
                }}
              />
              <span className="ml-2">{input.name}</span>
            </div>
          ))}
        </div>

        {/* Output ports (right side) */}
        <div className="flex flex-col gap-2 items-end mt-2">
          {def.outputs.map((output, index) => (
            <div key={output.name} className="flex items-center gap-2 text-xs text-gray-300">
              <span className="mr-2">{output.name}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={output.name}
                style={{
                  background: getPortColor(output.type),
                  width: 10,
                  height: 10,
                  border: '2px solid #1a202c',
                  top: `${28 + (def.inputs.length * 24) + index * 24}px`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Parameter preview (if any) */}
        {def.params.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
            {def.params.slice(0, 2).map((param) => {
              const value = params[param.name] ?? param.default;
              return (
                <div key={param.name} className="flex justify-between">
                  <span>{param.name}:</span>
                  <span className="text-gray-300">{formatValue(value)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Category to header color mapping
function getCategoryColor(category: string): string {
  switch (category) {
    case 'input':
      return 'bg-green-600';
    case 'math':
      return 'bg-blue-600';
    case 'pattern':
      return 'bg-purple-600';
    case 'color':
      return 'bg-pink-600';
    case 'output':
      return 'bg-red-600';
    default:
      return 'bg-gray-600';
  }
}

// Format parameter value for display
function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => typeof v === 'number' ? v.toFixed(1) : v).join(', ')}]`;
  }
  return String(value);
}

// Memoize for performance
export const BaseNode = memo(BaseNodeComponent);
