import React from 'react';
import { FolderOpen, Table, History, Plus, Settings } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { DatabaseSchema } from '../types';

interface NavbarProps {
  currentSchema: DatabaseSchema | null;
  user: FirebaseUser | null;
  onOpenDbModal: () => void;
  onOpenSchemaBrowser: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onNewChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSchema,
  user,
  onOpenDbModal,
  onOpenSchemaBrowser,
  onOpenSettings,
  onOpenHistory,
  onNewChat
}) => {
  const tableCount = currentSchema?.tables.length || 0;

  return (
    <header className="bg-[#050505] border-b border-[#222222] text-[#e5e5e5] sticky top-0 z-30 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <button
          onClick={onNewChat}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity focus:outline-none group"
          title="Start a new chat session"
          aria-label="Start a new chat session"
        >
          <div className="w-8 h-8 rounded border border-[#333333] group-hover:border-[#c5a059] bg-[#111111] flex items-center justify-center shrink-0 shadow-md relative overflow-hidden transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-[#c5a059]/10 to-transparent" />
            <div className="flex items-baseline tracking-tighter">
              <span className="text-[#c5a059] font-black text-sm font-mono relative z-10">L</span>
              <span className="text-[#e5e5e5] font-black text-sm font-mono relative z-10">S</span>
            </div>
          </div>
          <div className="flex items-baseline space-x-3">
            <span className="font-bold text-xl tracking-tight text-[#f0f0f0] font-mono">
              LSQL
            </span>
          </div>
        </button>

        {/* Database Status Badge & Navigation */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {currentSchema && (
            <button
              onClick={onOpenSchemaBrowser}
              className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded bg-[#111111] hover:bg-[#1a1a1a] border border-[#222222] text-xs font-mono text-[#888888] hover:text-[#c5a059] transition-colors"
              title="Click to explore schema"
            >
              <Table className="w-3.5 h-3.5 text-[#c5a059]" />
              <span className="text-[#e5e5e5] font-semibold">{currentSchema.name}</span>
              <span className="text-[#555353]">({tableCount} tables)</span>
            </button>
          )}

          <button
            onClick={onOpenDbModal}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#c5a059] hover:bg-[#d4b570] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95"
            title={currentSchema ? `Change Database (Current: ${currentSchema.name})` : "Connect Database"}
          >
            <FolderOpen className="w-3.5 h-3.5 text-black shrink-0" />
            <span className="hidden sm:inline max-w-[130px] truncate">
              {currentSchema ? currentSchema.name : 'CONNECT DB'}
            </span>
            <span className="sm:hidden">DB</span>
          </button>

          {/* History / Cloud Saved Sessions */}
          <button
            onClick={onOpenHistory}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#111111] hover:bg-[#1c1c1c] border border-[#333333] hover:border-[#c5a059] text-xs font-mono text-[#e5e5e5] hover:text-[#c5a059] transition-all relative"
            title="Saved Sessions & History"
          >
            <History className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="hidden sm:inline font-semibold">History</span>
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-4 h-4 rounded-full border border-[#c5a059] shrink-0 ml-1"
              />
            ) : (
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
            )}
          </button>

          {currentSchema && (
            <button
              onClick={onOpenSchemaBrowser}
              className="lg:hidden text-xs uppercase tracking-widest text-[#888888] hover:text-[#c5a059] p-2"
              title="Schema Explorer"
              aria-label="Open Schema Explorer"
            >
              <Table className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="p-2 rounded border border-[#222222] bg-[#111111] text-[#888888] hover:text-[#c5a059] hover:border-[#333333] transition-colors"
            title="Settings & API Key"
            aria-label="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};


