import React, { useState, useEffect } from 'react';
import { X, Table, Key, Link as LinkIcon, Search, ArrowRight } from 'lucide-react';
import { DatabaseSchema, TableInfo } from '../types';

interface SchemaBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  schema: DatabaseSchema | null;
}

export const SchemaBrowser: React.FC<SchemaBrowserProps> = ({ isOpen, onClose, schema }) => {
  const [selectedTableName, setSelectedTableName] = useState<string>(
    schema?.tables[0]?.name || ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'columns' | 'sample' | 'erd'>('columns');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (schema?.tables && schema.tables.length > 0) {
      if (!schema.tables.some((t) => t.name === selectedTableName)) {
        setSelectedTableName(schema.tables[0].name);
      }
    }
  }, [schema, selectedTableName]);

  if (!isOpen || !schema) return null;

  const filteredTables = schema.tables.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTable: TableInfo | undefined = schema.tables.find(
    (t) => t.name === (selectedTableName || schema.tables[0]?.name)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schema-modal-title"
        className="bg-[#0c0c0c] border border-[#1a1a1a] w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden flex flex-col h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center justify-between bg-[#080808]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-[#111111] text-[#c5a059] border border-[#222222]">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 id="schema-modal-title" className="text-xl font-serif text-[#e5e5e5] flex items-center space-x-2">
                <span>Schema Explorer: {schema.name}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#111111] text-[#c5a059] font-mono border border-[#222222]">
                  {schema.tables.length} tables
                </span>
              </h2>
              <p className="text-xs text-[#888888]">Inspect structure, datatypes, primary keys, and relationships</p>
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

        {/* Content Body */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          
          {/* Left Table List Sidebar */}
          <div className="w-full sm:w-64 shrink-0 border-b sm:border-b-0 sm:border-r border-[#1a1a1a] bg-[#080808] p-4 flex flex-col space-y-3 h-48 sm:h-auto">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#555555]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tables..."
                className="w-full pl-8 pr-3 py-1.5 rounded bg-[#0c0c0c] border border-[#222222] text-[#e5e5e5] text-xs focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              {filteredTables.map((t) => {
                const isSelected = t.name === selectedTable?.name;
                return (
                  <button
                    key={t.name}
                    onClick={() => setSelectedTableName(t.name)}
                    className={`w-full text-left px-3 py-2 rounded text-xs font-semibold flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#1a1a1a] text-[#c5a059] border border-[#c5a059]/40'
                        : 'text-[#888888] hover:bg-[#111111] hover:text-[#e5e5e5]'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Table className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#c5a059]' : 'text-[#555555]'}`} />
                      <span className="truncate">{t.name}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-[#080808] text-[#c5a059]' : 'bg-[#111111] text-[#666666]'
                    }`}>
                      {t.rowCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Detail View */}
          <div className="flex-1 flex flex-col bg-[#0c0c0c] overflow-hidden">
            {selectedTable ? (
              <>
                {/* Detail View Header */}
                <div className="px-6 py-3 border-b border-[#1a1a1a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 bg-[#080808]">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-[#e5e5e5] font-mono">{selectedTable.name}</span>
                    <span className="text-xs text-[#888888]">({selectedTable.rowCount} total rows)</span>
                  </div>

                  <div className="flex space-x-2 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      onClick={() => setActiveTab('columns')}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        activeTab === 'columns'
                          ? 'bg-[#c5a059] text-black font-bold'
                          : 'bg-[#111111] text-[#888888] hover:text-[#e5e5e5]'
                      }`}
                    >
                      Columns ({selectedTable.columns.length})
                    </button>

                    <button
                      onClick={() => setActiveTab('sample')}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        activeTab === 'sample'
                          ? 'bg-[#c5a059] text-black font-bold'
                          : 'bg-[#111111] text-[#888888] hover:text-[#e5e5e5]'
                      }`}
                    >
                      Sample Data
                    </button>

                    <button
                      onClick={() => setActiveTab('erd')}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        activeTab === 'erd'
                          ? 'bg-[#c5a059] text-black font-bold'
                          : 'bg-[#111111] text-[#888888] hover:text-[#e5e5e5]'
                      }`}
                    >
                      Relationships
                    </button>
                  </div>
                </div>

                {/* Tab Contents */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {activeTab === 'columns' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#222222] bg-[#111111] text-[#666666] font-bold text-[10px] uppercase tracking-wider">
                            <th className="py-2.5 px-3">Column Name</th>
                            <th className="py-2.5 px-3">Data Type</th>
                            <th className="py-2.5 px-3">Key Constraints</th>
                            <th className="py-2.5 px-3">Nullable</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a1a1a] font-mono">
                          {selectedTable.columns.map((col) => (
                            <tr key={col.name} className="hover:bg-[#111111] border-b border-[#1a1a1a]">
                              <td className="py-2.5 px-3 text-[#e5e5e5] font-bold flex items-center space-x-2">
                                <span>{col.name}</span>
                              </td>
                              <td className="py-2.5 px-3 text-[#c5a059]">{col.type}</td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center space-x-2">
                                  {col.primaryKey && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/30">
                                      <Key className="w-3 h-3 mr-1" />
                                      PK
                                    </span>
                                  )}
                                  {col.foreignKey && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                      <LinkIcon className="w-3 h-3 mr-1" />
                                      FK → {col.foreignKey.targetTable}
                                    </span>
                                  )}
                                  {!col.primaryKey && !col.foreignKey && (
                                    <span className="text-[#555555]">-</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-[#888888]">
                                {col.nullable ? 'YES' : 'NO'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === 'sample' && (
                    <div className="overflow-x-auto">
                      {selectedTable.sampleRows.length > 0 ? (
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-[#222222] bg-[#111111] text-[#666666] font-bold text-[10px] uppercase tracking-wider font-mono">
                              {Object.keys(selectedTable.sampleRows[0]).map((header) => (
                                <th key={header} className="py-2.5 px-3 whitespace-nowrap">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1a1a1a] font-mono text-[#e5e5e5]">
                            {selectedTable.sampleRows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-[#111111] border-b border-[#1a1a1a]">
                                {Object.values(row).map((val: any, vIdx) => (
                                  <td key={vIdx} className="py-2 px-3 whitespace-nowrap">
                                    {val !== null && val !== undefined ? String(val) : <span className="text-[#555555] italic">null</span>}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-xs text-[#888888] italic">No sample rows available for this table.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'erd' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-[#888888] uppercase tracking-wider">
                        Relationships for {selectedTable.name}
                      </h4>
                      {(() => {
                        const tableRelationships = schema.relationships.filter(
                          rel => rel.sourceTable === selectedTable.name || rel.targetTable === selectedTable.name
                        );
                        return tableRelationships.length > 0 ? (
                          <div className="space-y-2">
                            {tableRelationships.map((rel, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded bg-[#111111] border border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-2 sm:gap-0"
                              >
                                <div className="flex items-center space-x-2 text-[#c5a059] font-bold">
                                  <span>{rel.sourceTable}</span>
                                  <span className="text-[#666666]">({rel.sourceColumn})</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-[#555555] hidden sm:block" />
                                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                                  <span>{rel.targetTable}</span>
                                  <span className="text-[#666666]">({rel.targetColumn})</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[#888888] italic">No explicit foreign key relationships detected for this table.</p>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#555555] text-xs">
                Select a table from the sidebar to view details.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

