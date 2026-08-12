import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  Trash2,
  Search,
  Plus
} from 'lucide-react';
import { AISettings, ChatMessage, DatabaseSchema, SampleDatabase } from '../types';
import { ResultChart } from './ResultChart';
import { ResultTable } from './ResultTable';
import { ConfirmationModal } from './ConfirmationModal';
import { formatSql } from '../utils/formatSql';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  currentSchema: DatabaseSchema | null;
  activeSampleDb?: SampleDatabase;
  settings: AISettings;
  onClearChat: () => void;
  onNewChat: () => void;
  onConfirmDestructiveAction: (msgId: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  currentSchema,
  activeSampleDb,
  settings,
  onClearChat,
  onNewChat,
  onConfirmDestructiveAction
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedSqlId, setCopiedSqlId] = useState<string | null>(null);
  const [expandedLogicId, setExpandedLogicId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);

  useEffect(() => {
    // Only scroll to bottom when a new message is submitted/received or when loading starts
    if (messages.length > prevMessagesLength.current || (isLoading && prevMessagesLength.current === 0)) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleCopySQL = async (sql: string, msgId: string) => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopiedSqlId(msgId);
      setTimeout(() => setCopiedSqlId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback or silent catch
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full bg-[#050505] text-[#e5e5e5] overflow-hidden relative">
      
      {/* Top Bar info & Clear / New Chat Buttons */}
      {messages.length > 0 && (
        <div className="px-6 py-2.5 bg-[#080808] border-b border-[#222222] flex items-center justify-between text-xs text-[#888888] shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
            <span>Active context: <strong className="text-[#e5e5e5] font-mono">{currentSchema?.name}</strong></span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center space-x-1 uppercase tracking-widest text-[10px] text-[#888888] hover:text-red-400 transition-colors"
              title="Clear Chat History"
              aria-label="Clear Chat History"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>
      )}

      {/* Message Timeline */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 space-y-6 scroll-smooth">
        
        {/* Welcome Empty State */}
        {messages.length === 0 && (
          <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-6 animate-fade-in">
            <div className="w-12 h-12 rounded border border-[#333333] bg-[#111111] mx-auto flex items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#c5a059]/10 to-transparent" />
              <div className="flex items-baseline tracking-tighter">
                <span className="text-[#c5a059] font-black text-lg font-mono relative z-10">L</span>
                <span className="text-[#e5e5e5] font-black text-lg font-mono relative z-10">S</span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white mb-2 tracking-tight">
                Ask LSQL Anything
              </h1>
              <p className="text-xs sm:text-sm text-[#888888] max-w-lg mx-auto leading-relaxed">
                Gemini translates natural language questions into schema-aware SQL, executes it safely, and presents clear insights.
              </p>
            </div>

            {/* Quick Question Chips */}
            {activeSampleDb?.suggestedQuestions && activeSampleDb.suggestedQuestions.length > 0 && (
              <div className="pt-6 max-w-2xl mx-auto">
                <div className="text-[10px] uppercase tracking-widest font-bold text-[#555555] mb-4 flex items-center justify-center space-x-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Suggested Questions for {activeSampleDb.name}</span>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {activeSampleDb.suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(q)}
                      className="px-4 py-2 rounded-full bg-[#111111] hover:bg-[#1a1a1a] border border-[#222222] hover:border-[#c5a059]/50 text-xs text-[#cccccc] hover:text-[#c5a059] transition-all text-left active:scale-95"
                    >
                      "{q}"
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages List */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col space-y-3 max-w-4xl mx-auto animate-fade-in ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            {/* User Message */}
            {msg.role === 'user' ? (
              <div className="bg-[#111111] border border-[#222222] text-[#e5e5e5] px-5 py-3.5 rounded-2xl rounded-tr-none text-xs sm:text-sm max-w-xl leading-relaxed shadow-sm">
                {msg.content}
              </div>
            ) : (
              /* Assistant Response Card */
              <div className="w-full bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-5 shadow-2xl space-y-5">
                
                {/* Assistant Header */}
                <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-[#c5a059] shrink-0 flex items-center justify-center text-[10px] text-black font-bold">
                      G
                    </div>
                    <h3 className="font-serif text-lg text-white">Query Result</h3>
                    <span className="text-[10px] text-[#888888] uppercase tracking-widest font-mono">{msg.timestamp}</span>
                  </div>

                  {msg.operation && (
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${
                      msg.operation === 'SELECT'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/30'
                    }`}>
                      {msg.operation}
                    </span>
                  )}
                </div>

                {/* Auto Correction Notification */}
                {msg.correctedCount && msg.correctedCount > 0 && (
                  <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-xs flex items-center space-x-2 font-mono">
                    <RefreshCw className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Schema mismatch detected. Gemini auto-corrected and re-executed SQL.</span>
                  </div>
                )}

                {/* Natural Language Answer Interpretation */}
                {msg.answerInterpretation ? (
                  <div className="space-y-3">
                    <div className="text-sm text-[#e5e5e5] leading-relaxed">
                      {msg.answerInterpretation.answer}
                    </div>

                    {msg.answerInterpretation.keyInsights?.length > 0 && (
                      <div className="p-3.5 rounded-lg bg-[#080808] border border-[#1a1a1a] space-y-2">
                        <div className="text-[10px] uppercase tracking-widest font-bold text-[#c5a059] flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a059]" />
                          <span>Key Insights</span>
                        </div>
                        <ul className="list-disc list-inside text-xs text-[#aaaaaa] space-y-1">
                          {msg.answerInterpretation.keyInsights.map((insight, idx) => (
                            <li key={idx}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-[#cccccc] leading-relaxed">{msg.content}</div>
                )}

                {/* Destructive Confirmation Bar */}
                {msg.requiresConfirmation && !msg.isConfirmed && (
                  <div className="p-4 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-[#c5a059]">
                      <strong className="block font-bold mb-0.5">Confirmation Required:</strong>
                      This query will mutate or delete records in your database.
                    </div>
                    <button
                      onClick={() => onConfirmDestructiveAction(msg.id)}
                      className="px-4 py-2 rounded bg-[#c5a059] hover:bg-[#d4b570] text-black text-xs font-bold uppercase tracking-wider transition-all shrink-0"
                    >
                      Confirm & Execute
                    </button>
                  </div>
                )}

                {/* SQL & Explanation 2-column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Generated SQL Box */}
                  {msg.sql && settings.showSQL && (
                    <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-lg flex flex-col">
                      <div className="flex items-center justify-between mb-3 border-b border-[#1a1a1a] pb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-1 h-3 bg-[#c5a059]" />
                          <span className="text-[10px] uppercase tracking-widest text-[#888888] font-bold">
                            Generated SQL
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopySQL(msg.sql!, msg.id)}
                          className="text-[10px] uppercase tracking-widest text-[#888888] hover:text-[#c5a059] transition-colors flex items-center space-x-1"
                          aria-label="Copy SQL"
                        >
                          {copiedSqlId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="text-[11px] font-mono text-[#888888] leading-relaxed overflow-x-auto whitespace-pre-wrap flex-1">
                        <code>{formatSql(msg.sql)}</code>
                      </pre>
                    </div>
                  )}

                  {/* AI Explanation Box */}
                  {msg.explanation && settings.showExplanation && (
                    <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-lg flex flex-col">
                      <div className="flex items-center space-x-2 mb-3 border-b border-[#1a1a1a] pb-2">
                        <div className="w-1 h-3 bg-[#c5a059]" />
                        <span className="text-[10px] uppercase tracking-widest text-[#888888] font-bold">
                          AI Logic
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#cccccc] flex-1">
                        {msg.explanation}
                      </p>

                      {msg.logicSteps && msg.logicSteps.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-[#1a1a1a]">
                          <button
                            onClick={() =>
                              setExpandedLogicId(expandedLogicId === msg.id ? null : msg.id)
                            }
                            className="flex items-center justify-between w-full text-[10px] uppercase tracking-widest font-semibold text-[#666666] hover:text-[#c5a059]"
                          >
                            <span>Step Breakdown</span>
                            {expandedLogicId === msg.id ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>

                          {expandedLogicId === msg.id && (
                            <ol className="list-decimal list-inside space-y-1 text-[#888888] font-mono text-[10px] pt-2">
                              {msg.logicSteps.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ol>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Query Results Data Table & Chart */}
                {msg.queryResult && (
                  <div className="space-y-4 pt-2">
                    {msg.suggestedVisualization && (
                      <ResultChart
                        columns={msg.queryResult.columns}
                        rows={msg.queryResult.rows}
                        suggestedType={msg.suggestedVisualization}
                      />
                    )}

                    <ResultTable result={msg.queryResult} />
                  </div>
                )}

              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="max-w-4xl mx-auto flex items-center space-x-3 p-4 bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl">
            <div className="w-6 h-6 rounded-full bg-[#c5a059] flex items-center justify-center text-[10px] text-black font-bold shrink-0">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-serif text-white">Gemini is evaluating database schema...</div>
              <div className="text-[10px] text-[#888888] font-mono">Generating SQL → Validating → Executing Query</div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Query Input Footer Bar */}
      <footer className="p-4 sm:px-8 py-5 bg-[#080808] border-t border-[#222222] shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-end">
          <div className="absolute left-4 pb-3.5 w-5 h-5 flex items-center justify-center text-[#888888]">
            <Search className="w-4 h-4" />
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask your database a question... (Shift+Enter for newline)`}
            disabled={isLoading}
            rows={Math.min(4, Math.max(1, inputText.split('\n').length))}
            className="w-full bg-[#111111] border border-[#222222] rounded-2xl py-3 pl-12 pr-32 text-xs sm:text-sm text-[#eeeeee] focus:outline-none focus:border-[#c5a059] placeholder-[#888888] disabled:opacity-50 transition-colors resize-none leading-relaxed"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 bottom-2 bg-[#c5a059] hover:bg-[#d4b570] text-black px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest disabled:opacity-30 transition-all active:scale-95"
          >
            Ask Gemini
          </button>
        </form>
      </footer>

      <ConfirmationModal
        isOpen={showClearConfirm}
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={() => {
          onClearChat();
          setShowClearConfirm(false);
        }}
        title="Clear Chat History?"
        message="This will remove all messages from the current view. You can start a new query session."
        confirmText="Clear History"
        isDanger={true}
      />
    </div>
  );
};

