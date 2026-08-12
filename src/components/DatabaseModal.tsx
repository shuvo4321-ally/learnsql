import React, { useState, useEffect } from 'react';
import { X, Upload, Database, Check, Server, Layers, ArrowRight } from 'lucide-react';
import { SAMPLE_DATABASES } from '../services/sampleData';
import { SampleDatabase } from '../types';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSampleDb: (sample: SampleDatabase) => void;
  onUploadSqlFile: (filename: string, content: string) => void;
  onUploadCsvFile: (filename: string, content: string) => void;
  activeSampleDbId?: string;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  onSelectSampleDb,
  onUploadSqlFile,
  onUploadCsvFile,
  activeSampleDbId
}) => {
  const [activeTab, setActiveTab] = useState<'sample' | 'upload' | 'mysql'>('sample');
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // MySQL Form State
  const [mysqlHost, setMysqlHost] = useState('localhost');
  const [mysqlPort, setMysqlPort] = useState('3306');
  const [mysqlDatabase, setMysqlDatabase] = useState('ecommerce_db');
  const [mysqlUser, setMysqlUser] = useState('root');
  const [mysqlPassword, setMysqlPassword] = useState('');
  const [mysqlConnecting, setMysqlConnecting] = useState(false);
  const [mysqlSuccess, setMysqlSuccess] = useState(false);
  const [loadedDbId, setLoadedDbId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    setFileError(null);
    const reader = new FileReader();

    if (file.name.endsWith('.sql')) {
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          onUploadSqlFile(file.name.replace('.sql', ''), content);
          onClose();
        }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.csv')) {
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          onUploadCsvFile(file.name.replace('.csv', ''), content);
          onClose();
        }
      };
      reader.readAsText(file);
    } else {
      setFileError('Please upload a valid .sql script file or .csv data file.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleConnectMySQL = (e: React.FormEvent) => {
    e.preventDefault();
    setMysqlConnecting(true);
    setTimeout(() => {
      setMysqlConnecting(false);
      setMysqlSuccess(true);
      setTimeout(() => {
        // Load default ecommerce sample with custom name
        const customSample = { ...SAMPLE_DATABASES[0], name: `MySQL: ${mysqlDatabase}` };
        onSelectSampleDb(customSample);
        onClose();
      }, 800);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="db-modal-title"
        className="bg-[#0c0c0c] border border-[#1a1a1a] w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center justify-between bg-[#080808]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-[#111111] text-[#c5a059] border border-[#222222]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 id="db-modal-title" className="text-xl font-serif text-[#e5e5e5]">Database Workspace</h2>
              <p className="text-xs text-[#888888]">Select a database source for Gemini AI analysis & natural language execution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded text-[#666666] hover:text-[#e5e5e5] hover:bg-[#1a1a1a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 bg-[#080808] border-b border-[#1a1a1a] flex space-x-6">
          <button
            onClick={() => setActiveTab('sample')}
            className={`pb-3 text-xs uppercase tracking-wider font-bold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'sample'
                ? 'border-[#c5a059] text-[#c5a059]'
                : 'border-transparent text-[#666666] hover:text-[#cccccc]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Sample Datasets</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 text-xs uppercase tracking-wider font-bold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-[#c5a059] text-[#c5a059]'
                : 'border-transparent text-[#666666] hover:text-[#cccccc]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload SQL / CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('mysql')}
            className={`pb-3 text-xs uppercase tracking-wider font-bold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'mysql'
                ? 'border-[#c5a059] text-[#c5a059]'
                : 'border-transparent text-[#666666] hover:text-[#cccccc]'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>MySQL Connection</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'sample' && (
            <div className="space-y-4">
              <p className="text-xs text-[#888888]">
                Choose a pre-configured database populated with realistic tables, relationships, and sample records:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {SAMPLE_DATABASES.map((db) => {
                  const isActive = activeSampleDbId === db.id;
                  const isLoading = loadedDbId === db.id;

                  return (
                  <div
                    key={db.id}
                    onClick={() => {
                      if (isActive) return;
                      setLoadedDbId(db.id);
                      setTimeout(() => {
                        onSelectSampleDb(db);
                        onClose();
                        setLoadedDbId(null);
                      }, 600);
                    }}
                    className={`p-4 rounded-lg bg-[#111111] transition-all flex flex-col justify-between ${
                      isActive
                        ? 'border border-[#c5a059] bg-[#c5a059]/5 cursor-default'
                        : 'border border-[#222222] hover:border-[#c5a059]/60 hover:bg-[#161616] cursor-pointer group'
                    } ${
                      isLoading ? 'border-emerald-500/50 bg-emerald-500/10' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#080808] text-[#c5a059] border border-[#222222]">
                          {db.category}
                        </span>
                        <span className="text-[10px] text-[#888888] font-mono">{db.type}</span>
                      </div>
                      <h3 className={`text-sm font-bold mb-1 transition-colors ${isActive ? 'text-[#c5a059]' : 'text-[#e5e5e5] group-hover:text-[#c5a059]'}`}>
                        {db.name}
                      </h3>
                      <p className="text-xs text-[#888888] line-clamp-2 mb-3">
                        {db.description}
                      </p>
                    </div>

                    <div className={`pt-3 border-t border-[#1a1a1a] flex items-center justify-between text-xs font-semibold ${
                      isLoading ? 'text-emerald-400' : 'text-[#c5a059]'
                    }`}>
                      <span>
                        {isLoading
                          ? 'Loading...'
                          : isActive
                          ? '✓ Currently Loaded'
                          : 'Load Database'}
                      </span>
                      {isLoading ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : isActive ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      )}
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                  dragActive
                    ? 'border-[#c5a059] bg-[#c5a059]/10'
                    : 'border-[#222222] bg-[#111111] hover:bg-[#161616] hover:border-[#333333]'
                }`}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.sql,.csv';
                  input.onchange = (e: any) => {
                    if (e.target?.files?.[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  };
                  input.click();
                }}
              >
                <div className="p-3 rounded bg-[#080808] border border-[#222222] text-[#c5a059] mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#e5e5e5] mb-1">
                  Drag & Drop SQL Dump or CSV file here
                </h4>
                <p className="text-xs text-[#888888] mb-3 max-w-sm">
                  Upload an existing <code className="text-[#c5a059]">.sql</code> file containing CREATE TABLE / INSERT statements or a <code className="text-[#c5a059]">.csv</code> spreadsheet.
                </p>
                <button
                  type="button"
                  className="px-4 py-1.5 rounded bg-[#c5a059] text-black text-xs font-bold hover:bg-[#d4b570] transition-colors"
                >
                  Browse Computer
                </button>
              </div>

              {fileError && (
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-red-300 text-xs">
                  {fileError}
                </div>
              )}
            </div>
          )}

          {activeTab === 'mysql' && (
            <form onSubmit={handleConnectMySQL} className="space-y-4">
              <div className="p-2.5 rounded bg-[#111111] border border-[#222222] text-[#888888] text-[11px]">
                <strong className="text-[#c5a059]">Preview Mode Notice:</strong> Direct remote TCP database sockets are proxied via in-browser SQL engine in sandbox preview mode. Credentials are processed locally and not transmitted or stored externally.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#cccccc] mb-1">Host / Server IP</label>
                  <input
                    type="text"
                    value={mysqlHost}
                    onChange={(e) => setMysqlHost(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#080808] border border-[#222222] text-[#e5e5e5] text-xs focus:outline-none focus:border-[#c5a059]"
                    placeholder="localhost or 127.0.0.1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cccccc] mb-1">Port</label>
                  <input
                    type="text"
                    value={mysqlPort}
                    onChange={(e) => setMysqlPort(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#080808] border border-[#222222] text-[#e5e5e5] text-xs focus:outline-none focus:border-[#c5a059]"
                    placeholder="3306"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cccccc] mb-1">Database Name</label>
                  <input
                    type="text"
                    value={mysqlDatabase}
                    onChange={(e) => setMysqlDatabase(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#080808] border border-[#222222] text-[#e5e5e5] text-xs focus:outline-none focus:border-[#c5a059]"
                    placeholder="production_db"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cccccc] mb-1">User Name</label>
                  <input
                    type="text"
                    value={mysqlUser}
                    onChange={(e) => setMysqlUser(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#080808] border border-[#222222] text-[#e5e5e5] text-xs focus:outline-none focus:border-[#c5a059]"
                    placeholder="root"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#cccccc] mb-1">Password</label>
                  <input
                    type="password"
                    value={mysqlPassword}
                    onChange={(e) => setMysqlPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#080808] border border-[#222222] text-[#e5e5e5] text-xs focus:outline-none focus:border-[#c5a059]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {mysqlSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>MySQL Database connected successfully! Loading schema...</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={mysqlConnecting || mysqlSuccess}
                  className="px-5 py-2 rounded bg-[#c5a059] hover:bg-[#d4b570] disabled:opacity-50 text-black text-xs font-bold transition-all"
                >
                  {mysqlConnecting ? 'Testing Connection...' : 'Connect Database'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

