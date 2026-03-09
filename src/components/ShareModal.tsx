'use client';

import { useState, useEffect, useRef } from 'react';
import { getShareUrl, canShare } from '../lib/share';
import type { Project } from '../lib/types';

interface ShareModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ project, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const shareUrl = canShare(project) ? getShareUrl(project) : null;

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setError(null);
      // Select the URL when modal opens
      setTimeout(() => inputRef.current?.select(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!canShare(project)) {
      setError('Project is too large to share via URL. Please save as a file instead.');
    }
  }, [project]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-4">Share Preset</h2>
        
        {error ? (
          <div className="bg-red-900/30 border border-red-700 rounded p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : (
          <>
            <p className="text-zinc-400 text-sm mb-4">
              Share this URL to let others view your shader preset:
            </p>
            
            <div className="flex gap-2 mb-4">
              <input
                ref={inputRef}
                type="text"
                value={shareUrl || ''}
                readOnly
                className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white text-sm font-mono"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <p className="text-zinc-500 text-xs">
              Note: Shared links contain the full project data encoded in the URL.
            </p>
          </>
        )}
        
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
