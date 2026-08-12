import React, { useState, useEffect } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { QueryResult } from '../types';

interface ResultTableProps {
  result: QueryResult;
}

export const ResultTable: React.FC<ResultTableProps> = ({ result }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [result]);

  if (result.error) {
    return (
      <div className="p-4 rounded-lg bg-red-950/30 border border-red-800/40 text-red-300 my-3 text-xs font-mono">
        <div className="font-bold mb-1">Database Execution Error:</div>
        <div>{result.error}</div>
      </div>
    );
  }

  const { columns, rows, executionTimeMs } = result;

  if (!rows || rows.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-[#0c0c0c] border border-[#1a1a1a] text-[#888888] text-xs my-3 flex items-center justify-between">
        <span>Query executed successfully. 0 rows returned.</span>
        <span className="font-mono text-[10px] text-[#555555]">{executionTimeMs} ms</span>
      </div>
    );
  }

  // Search filtering
  const filteredRows = rows.filter((r) =>
    columns.some((col) => String(r[col] ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sorting
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortColumn) return 0;
    const valA = a[sortColumn];
    const valB = b[sortColumn];

    if (valA === valB) return 0;
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    }

    return sortDirection === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  // Pagination
  const totalPages = Math.ceil(sortedRows.length / rowsPerPage) || 1;
  const paginatedRows = sortedRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const handleDownloadCSV = () => {
    const csvHeader = columns.join(',');
    const csvBody = rows
      .map((r) => columns.map((c) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const fullCsv = `${csvHeader}\n${csvBody}`;

    const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'luminasql_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-lg overflow-hidden my-3">
      
      {/* Table Toolbar */}
      <div className="px-4 py-3 bg-[#111111] border-b border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#555555]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter result rows..."
              className="pl-8 pr-3 py-1 rounded bg-[#080808] border border-[#222222] text-[#e5e5e5] text-xs focus:outline-none focus:border-[#c5a059] w-48 font-mono"
            />
          </div>

          <span className="text-[10px] font-mono text-[#888888] flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-[#080808] border border-[#222222] text-[#cccccc]">
              {rows.length} rows
            </span>
            <span className="px-2 py-0.5 rounded bg-[#080808] border border-[#222222] text-[#cccccc]">
              {columns.length} columns
            </span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {executionTimeMs} ms
          </span>

          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#080808] hover:bg-[#1a1a1a] text-[#cccccc] hover:text-[#c5a059] text-xs font-semibold border border-[#222222] transition-colors"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#222222] bg-[#111111]">
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  aria-sort={sortColumn === col ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className="p-3 text-[10px] uppercase tracking-wider text-[#666666] font-bold whitespace-nowrap cursor-pointer hover:text-[#c5a059] transition-colors select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>{col}</span>
                    {sortColumn === col && (
                      <span className="text-[#c5a059] font-bold">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a] font-mono text-[#e5e5e5]">
            {paginatedRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#111111]/80 transition-colors border-b border-[#1a1a1a]">
                {columns.map((col, colIdx) => {
                  const val = row[col];
                  const isKeyCol = colIdx === 0 || col.toLowerCase().includes('id');
                  return (
                    <td
                      key={col}
                      className={`p-3 whitespace-nowrap text-xs ${
                        isKeyCol ? 'text-[#c5a059] font-semibold' : 'text-[#e5e5e5]'
                      }`}
                    >
                      {val !== null && val !== undefined ? (
                        String(val)
                      ) : (
                        <span className="text-[#555555] italic font-sans">null</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-4 py-2 border-t border-[#222222] bg-[#111111] flex items-center justify-between text-xs text-[#888888]">
          <span>
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex items-center space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-1 rounded bg-[#080808] disabled:opacity-30 hover:bg-[#1a1a1a] text-white border border-[#222222]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-1 rounded bg-[#080808] disabled:opacity-30 hover:bg-[#1a1a1a] text-white border border-[#222222]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

