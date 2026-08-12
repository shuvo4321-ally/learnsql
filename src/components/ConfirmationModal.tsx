import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { formatSql } from '../utils/formatSql';

interface ConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  sql?: string;
  operation?: string;
  explanation?: string;
  confirmText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title = 'Confirmation Required',
  message,
  sql,
  operation,
  explanation,
  confirmText = 'Confirm & Execute SQL',
  isDanger = true,
  onConfirm,
  onCancel
}) => {
  // Add Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        className={`bg-[#0c0c0c] border ${isDanger ? 'border-amber-500/40' : 'border-[#333333]'} w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className={`px-6 py-4 ${isDanger ? 'bg-amber-500/10 border-amber-500/20' : 'bg-[#111111] border-[#222222]'} border-b flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded ${isDanger ? 'bg-amber-500/20 text-amber-400' : 'bg-[#222222] text-[#888888]'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="confirmation-modal-title" className="text-lg font-serif text-[#e5e5e5]">{title}</h3>
              {operation && (
                <p className={`text-xs ${isDanger ? 'text-amber-300/80' : 'text-[#888888]'} font-medium`}>
                  Data Mutation Detected ({operation})
                </p>
              )}
            </div>
          </div>

          <button onClick={onCancel} className="p-1 rounded text-[#666666] hover:text-[#e5e5e5]" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-[#cccccc] leading-relaxed">
            {message || 'Gemini generated a query that modifies or deletes records in your database. Please review the SQL statement carefully before proceeding:'}
          </p>

          {sql && (
            <div className="p-3 bg-[#080808] rounded border border-[#222222] font-mono text-xs text-[#c5a059] overflow-x-auto whitespace-pre-wrap">
              <pre><code>{formatSql(sql)}</code></pre>
            </div>
          )}

          {explanation && (
            <div className="p-3 bg-[#111111] rounded border border-[#222222] text-xs text-[#cccccc]">
              <span className="font-bold text-[#c5a059]">Impact: </span>
              {explanation}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-[#080808] border-t border-[#1a1a1a] flex items-center justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-[#111111] hover:bg-[#1a1a1a] text-[#cccccc] text-xs font-semibold border border-[#222222] transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded ${isDanger ? 'bg-amber-600 hover:bg-amber-500 text-black shadow-amber-600/20' : 'bg-rose-900 hover:bg-rose-800 text-rose-100 shadow-rose-900/20'} text-xs font-bold transition-all shadow-lg`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

