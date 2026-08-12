import React, { useState } from 'react';
import {
  History,
  Plus,
  Trash2,
  X,
  MessageSquare,
  Clock,
  Database,
  LogIn,
  LogOut,
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';
import { User } from 'firebase/auth';
import { SavedConversation, logoutUser } from '../lib/firebase';
import { ConfirmationModal } from './ConfirmationModal';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  conversations: SavedConversation[];
  activeConvId: string | null;
  onSelectConversation: (conv: SavedConversation) => void;
  onNewConversation: () => void;
  onDeleteConversation: (convId: string) => void;
  onSignInGoogle: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  user,
  conversations,
  activeConvId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onSignInGoogle
}) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0a0a0a] border-l border-[#222222] text-[#e5e5e5] h-full flex flex-col shadow-2xl animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#222222] flex items-center justify-between bg-[#0e0e0e]">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-[#c5a059]" />
            <h2 className="font-serif-italic text-lg text-[#f0f0f0]">Saved Sessions & History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#888888] hover:text-white hover:bg-[#1f1f1f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile / Auth Status Banner */}
        <div className="p-4 bg-[#111111] border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-9 h-9 rounded-full border border-[#333333] shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#1c1c1c] border border-[#333333] flex items-center justify-center shrink-0 text-[#c5a059]">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
            <div className="truncate">
              <div className="text-xs font-semibold text-[#f0f0f0] truncate">
                {user?.displayName || (user?.isAnonymous ? 'Guest Account' : 'Lumina User')}
              </div>
              <div className="text-[10px] text-[#888888] truncate flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 inline" />
                <span>Cloud Sync Active</span>
              </div>
            </div>
          </div>

          <div>
            {user && !user.isAnonymous ? (
              <button
                onClick={() => logoutUser()}
                className="px-2.5 py-1 text-[11px] font-mono rounded bg-[#1c1c1c] hover:bg-[#282828] text-[#888888] hover:text-rose-400 border border-[#333333] transition-colors flex items-center space-x-1"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={onSignInGoogle}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-[#c5a059] hover:bg-[#d4b570] text-black transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-12 px-4 text-[#666666]">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#c5a059]" />
              <p className="text-xs font-mono mb-1">No saved sessions yet</p>
              <p className="text-[11px]">
                Your SQL questions, explanations, generated code, and results will automatically sync here!
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              const formattedDate = conv.updatedAt
                ? new Date(conv.updatedAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Recently';

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv);
                    onClose();
                  }}
                  className={`group relative p-3 rounded-md border transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-[#181611] border-[#c5a059] text-[#ffffff]'
                      : 'bg-[#111111] border-[#222222] hover:border-[#333333] hover:bg-[#161616] text-[#cccccc]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 pr-6 truncate">
                      <MessageSquare
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-[#c5a059]' : 'text-[#666666]'
                        }`}
                      />
                      <span className="text-xs font-medium truncate">{conv.title}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#666666] hover:text-rose-400 transition-opacity"
                      title="Delete session"
                      aria-label="Delete session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#666666] font-mono">
                    <div className="flex items-center space-x-1.5">
                      <Database className="w-3 h-3 text-[#555353]" />
                      <span className="truncate max-w-[120px]">{conv.dbName}</span>
                      <span>•</span>
                      <span>{conv.messages ? conv.messages.length : 0} msgs</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[#1f1f1f] bg-[#0c0c0c] text-[10px] text-[#666666] text-center font-mono">
          Persistent Cloud Storage Powered by Firebase Firestore
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            onDeleteConversation(deleteId);
            setDeleteId(null);
          }
        }}
        title="Delete Session?"
        message="This will permanently delete this conversation and its queries from your cloud history."
        isDanger={true}
      />
    </div>
  );
};
