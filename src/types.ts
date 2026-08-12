/**
 * LuminaSQL Data & Component Types
 */

export interface ColumnInfo {
  name: string;
  type: string; // e.g., 'INT', 'VARCHAR', 'DECIMAL', 'DATETIME', 'BOOLEAN'
  primaryKey?: boolean;
  foreignKey?: {
    targetTable: string;
    targetColumn: string;
  };
  nullable?: boolean;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  rowCount: number;
  sampleRows: Record<string, any>[];
}

export interface RelationshipInfo {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
}

export interface DatabaseSchema {
  name: string;
  type: 'SQLite' | 'MySQL' | 'PostgreSQL' | 'Custom';
  tables: TableInfo[];
  relationships: RelationshipInfo[];
}

export type SQLOperation = 
  | 'SELECT' 
  | 'INSERT' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'CREATE' 
  | 'ALTER' 
  | 'DROP' 
  | 'TRUNCATE'
  | 'OTHER';

export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  executionTimeMs: number;
  affectedRows?: number;
  error?: string;
}

export interface AIGeneratedSQLResponse {
  operation: SQLOperation;
  sql: string;
  explanation: string;
  requires_confirmation: boolean;
  suggested_visualization?: 'bar' | 'line' | 'pie' | 'table' | 'metric';
  logic_steps?: string[];
  warning?: string;
}

export interface AIExplanationResponse {
  answer: string;
  keyInsights: string[];
  summaryMetric?: {
    label: string;
    value: string | number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sql?: string;
  explanation?: string;
  operation?: SQLOperation;
  requiresConfirmation?: boolean;
  isConfirmed?: boolean;
  queryResult?: QueryResult;
  error?: string;
  correctedCount?: number;
  logicSteps?: string[];
  suggestedVisualization?: 'bar' | 'line' | 'pie' | 'table' | 'metric';
  answerInterpretation?: AIExplanationResponse;
}

export interface AISettings {
  model: 'gemini-3.6-flash' | 'gemini-3.5-pro' | 'gemini-3.5-flash' | string;
  responseStyle: 'beginner' | 'developer' | 'analyst';
  autoCorrection: boolean;
  showSQL: boolean;
  showExplanation: boolean;
  defaultChart: 'auto' | 'bar' | 'line' | 'pie' | 'table';
}

export interface SampleDatabase {
  id: string;
  name: string;
  category: string;
  description: string;
  type: 'SQLite' | 'MySQL';
  suggestedQuestions: string[];
  sqlDump: string;
}
