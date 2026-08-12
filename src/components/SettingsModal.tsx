import React, { useState } from 'react';
import { X, Save, Key, Settings as SettingsIcon } from 'lucide-react';
import { AISettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onUpdateSettings: (settings: AISettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  const [localSettings, setLocalSettings] = useState<AISettings>(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    // Optionally persist to localStorage
    localStorage.setItem('lsql_ai_settings', JSON.stringify(localSettings));
    onUpdateSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-[#333333] rounded-lg w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#222222]">
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-[#c5a059]" />
            <h2 className="text-lg font-bold text-white tracking-tight">Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#222222] rounded text-[#888888] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* API Key Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-white font-semibold">
              <Key className="w-4 h-4 text-[#c5a059]" />
              <label>Gemini API Key</label>
            </div>
            <p className="text-xs text-[#888888]">
              Provide your own Gemini API key to override the server's default key. Your key is stored securely in your browser's local storage.
            </p>
            <input
              type="password"
              value={localSettings.geminiApiKey || ''}
              onChange={(e) => setLocalSettings({ ...localSettings, geminiApiKey: e.target.value })}
              placeholder="AIzaSy..."
              className="w-full bg-[#161616] border border-[#333333] rounded p-2 text-sm text-white focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          <div className="border-t border-[#222222] pt-4">
            <label className="text-white font-semibold flex items-center space-x-2 mb-2">
              <span>Model Selection</span>
            </label>
            <select
              value={localSettings.model}
              onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
              className="w-full bg-[#161616] border border-[#333333] rounded p-2 text-sm text-white focus:outline-none focus:border-[#c5a059]"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fastest)</option>
              <option value="gemini-3.5-pro">Gemini 3.5 Pro (Reasoning)</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.autoCorrection}
                onChange={(e) => setLocalSettings({ ...localSettings, autoCorrection: e.target.checked })}
                className="rounded border-[#333333] text-[#c5a059] focus:ring-[#c5a059] bg-[#161616]"
              />
              <span className="text-sm text-white font-semibold">Enable SQL Auto-Correction</span>
            </label>
            <p className="text-xs text-[#888888] ml-6 mt-1">
              Automatically ask Gemini to fix errors if a query fails to execute.
            </p>
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.showSQL}
                onChange={(e) => setLocalSettings({ ...localSettings, showSQL: e.target.checked })}
                className="rounded border-[#333333] text-[#c5a059] focus:ring-[#c5a059] bg-[#161616]"
              />
              <span className="text-sm text-white font-semibold">Always Show SQL</span>
            </label>
            <p className="text-xs text-[#888888] ml-6 mt-1">
              Display the underlying SQL query for every natural language response.
            </p>
          </div>
          
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#222222] bg-[#161616] rounded-b-lg flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-[#888888] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold bg-[#c5a059] text-black hover:bg-[#d6b26b] rounded transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
