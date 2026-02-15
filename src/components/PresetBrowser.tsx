'use client';

import { useState, useCallback } from 'react';
import { getAllPresets, getPresetsByCategory, searchPresets, clonePresetProject, type PresetCategory, type Preset } from '@/lib/presets';
import { usePrismStore } from '@/lib/store';

const CATEGORY_LABELS: Record<PresetCategory, string> = {
  patterns: 'Patterns',
  effects: 'Effects',
  generators: 'Generators',
};

interface PresetBrowserProps {
  onClose?: () => void;
}

export function PresetBrowser({ onClose }: PresetBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPreset, setHoveredPreset] = useState<string | null>(null);
  const loadProject = usePrismStore((state) => state.loadProject);

  const presets = searchQuery
    ? searchPresets(searchQuery)
    : selectedCategory === 'all'
      ? getAllPresets()
      : getPresetsByCategory(selectedCategory);

  const handleLoadPreset = useCallback((preset: Preset) => {
    const project = clonePresetProject(preset);
    loadProject(project);
    onClose?.();
  }, [loadProject, onClose]);

  return (
    <div className="preset-browser fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Preset Library</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b border-gray-700 flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {(['patterns', 'effects', 'generators'] as PresetCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Preset Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {presets.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              {searchQuery ? 'No presets match your search' : 'No presets in this category'}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset)}
                  onMouseEnter={() => setHoveredPreset(preset.id)}
                  onMouseLeave={() => setHoveredPreset(null)}
                  className={`relative p-4 rounded-lg border text-left transition-all ${
                    hoveredPreset === preset.id
                      ? 'bg-gray-700 border-blue-500 shadow-lg'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {/* Placeholder preview (could render actual shader later) */}
                  <div className="aspect-square mb-3 rounded bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <span className="text-3xl opacity-30">
                      {preset.category === 'patterns' && '◆'}
                      {preset.category === 'effects' && '◎'}
                      {preset.category === 'generators' && '◈'}
                    </span>
                  </div>
                  <h3 className="font-medium text-white text-sm mb-1 truncate">{preset.name}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2">{preset.description}</p>
                  <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded bg-gray-900 text-gray-400 capitalize">
                    {preset.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 text-center text-gray-400 text-sm">
          {presets.length} preset{presets.length !== 1 ? 's' : ''} available
        </div>
      </div>
    </div>
  );
}
