import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon } from 'lucide-react';

interface ResultChartProps {
  columns: string[];
  rows: Record<string, any>[];
  suggestedType?: 'bar' | 'line' | 'pie' | 'table' | 'metric';
}

const COLORS = ['#c5a059', '#d4b570', '#eab308', '#22c55e', '#a855f7', '#64748b', '#38bdf8'];

export const ResultChart: React.FC<ResultChartProps> = ({ columns, rows, suggestedType = 'bar' }) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>(
    suggestedType === 'line' ? 'line' : suggestedType === 'pie' ? 'pie' : 'bar'
  );

  // If table visualization is requested, table is already shown above, so skip rendering chart
  if (suggestedType === 'table' || !rows || rows.length === 0) {
    return null;
  }

  // Handle single metric summary cards
  if (suggestedType === 'metric') {
    const colName = columns[0] || 'Metric';
    const rawVal = rows[0]?.[colName];
    const formattedVal = typeof rawVal === 'number'
      ? rawVal.toLocaleString()
      : String(rawVal ?? 'N/A');

    return (
      <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-lg p-5 my-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#888888] uppercase tracking-widest block mb-1">
            {colName.replace(/_/g, ' ')}
          </span>
          <div className="text-3xl font-bold font-mono text-[#c5a059]">
            {formattedVal}
          </div>
        </div>
        <div className="p-3 rounded-full bg-[#111111] text-[#c5a059] border border-[#222222]">
          <BarChart3 className="w-6 h-6" />
        </div>
      </div>
    );
  }

  if (columns.length < 2) {
    return null;
  }

  // Identify string/label column vs numeric column
  let labelKey = columns.find(
    (c) => typeof rows[0][c] === 'string' || c.toLowerCase().includes('name') || c.toLowerCase().includes('date') || c.toLowerCase().includes('category') || c.toLowerCase().includes('country')
  ) || columns[0];

  let valueKey = columns.find(
    (c) => typeof rows[0][c] === 'number' || c.toLowerCase().includes('total') || c.toLowerCase().includes('count') || c.toLowerCase().includes('spent') || c.toLowerCase().includes('price') || c.toLowerCase().includes('salary')
  ) || columns[1] || columns[0];

  const chartData = rows.slice(0, 15);

  return (
    <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-lg p-4 my-3">
      <div className="flex items-center justify-between mb-4 border-b border-[#1a1a1a] pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-3 bg-[#c5a059]" />
          <span className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">
            Visualization ({labelKey} vs {valueKey})
          </span>
        </div>

        {/* Chart Type Selector Buttons */}
        <div className="flex items-center space-x-1 bg-[#080808] p-1 rounded border border-[#222222]">
          <button
            onClick={() => setChartType('bar')}
            aria-pressed={chartType === 'bar'}
            className={`p-1.5 rounded text-xs transition-colors ${
              chartType === 'bar' ? 'bg-[#c5a059] text-black font-bold' : 'text-[#888888] hover:text-[#c5a059]'
            }`}
            title="Bar Chart"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setChartType('line')}
            aria-pressed={chartType === 'line'}
            className={`p-1.5 rounded text-xs transition-colors ${
              chartType === 'line' ? 'bg-[#c5a059] text-black font-bold' : 'text-[#888888] hover:text-[#c5a059]'
            }`}
            title="Line Chart"
          >
            <LineIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setChartType('pie')}
            aria-pressed={chartType === 'pie'}
            className={`p-1.5 rounded text-xs transition-colors ${
              chartType === 'pie' ? 'bg-[#c5a059] text-black font-bold' : 'text-[#888888] hover:text-[#c5a059]'
            }`}
            title="Pie Chart"
          >
            <PieIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" opacity={0.8} />
              <XAxis dataKey={labelKey} stroke="#666666" fontSize={10} tickLine={false} />
              <YAxis stroke="#666666" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#080808', borderColor: '#222222', borderRadius: '6px', color: '#e5e5e5', fontSize: '11px' }}
              />
              <Bar dataKey={valueKey} fill="#c5a059" radius={[2, 2, 0, 0]} />
            </BarChart>
          ) : chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" opacity={0.8} />
              <XAxis dataKey={labelKey} stroke="#666666" fontSize={10} tickLine={false} />
              <YAxis stroke="#666666" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#080808', borderColor: '#222222', borderRadius: '6px', color: '#e5e5e5', fontSize: '11px' }}
              />
              <Line type="monotone" dataKey={valueKey} stroke="#c5a059" strokeWidth={2} dot={{ fill: '#c5a059', r: 3 }} />
            </LineChart>
          ) : (
            <PieChart>
              <Tooltip
                contentStyle={{ backgroundColor: '#080808', borderColor: '#222222', borderRadius: '6px', color: '#e5e5e5', fontSize: '11px' }}
              />
              <Pie
                data={chartData}
                dataKey={valueKey}
                nameKey={labelKey}
                cx="50%"
                cy="50%"
                outerRadius={75}
                label={({ name }) => String(name).substring(0, 10)}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

