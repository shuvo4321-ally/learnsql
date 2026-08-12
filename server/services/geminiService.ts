import { GoogleGenAI, Type } from '@google/genai';
import { AISettings, DatabaseSchema } from '../../src/types';

// Shared Gemini Client
// We no longer strictly cache a single instance because we need to support dynamic keys per-request
function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not defined and no custom key provided.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

function formatSqlString(sql: string): string {
  if (!sql) return '';
  let cleaned = sql.trim();
  const existingLines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);
  if (existingLines.length > 2) {
    return existingLines.join('\n');
  }

  cleaned = cleaned.replace(/\s+/g, ' ');

  const majorKeywords = [
    'SELECT',
    'FROM',
    'INNER JOIN',
    'LEFT OUTER JOIN',
    'RIGHT OUTER JOIN',
    'FULL OUTER JOIN',
    'LEFT JOIN',
    'RIGHT JOIN',
    'CROSS JOIN',
    'JOIN',
    'ON',
    'WHERE',
    'GROUP BY',
    'HAVING',
    'ORDER BY',
    'LIMIT',
    'OFFSET',
    'UNION ALL',
    'UNION',
    'INSERT INTO',
    'VALUES',
    'UPDATE',
    'SET',
    'DELETE FROM'
  ];

  for (const kw of majorKeywords) {
    const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
    cleaned = cleaned.replace(regex, (match) => `\n${match.toUpperCase()}`);
  }

  cleaned = cleaned.replace(/\b(AND|OR)\b/gi, (match) => `\n  ${match.toUpperCase()}`);

  const rawLines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);
  const formattedLines: string[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const upper = line.toUpperCase();

    if (
      upper.startsWith('JOIN') ||
      upper.startsWith('INNER') ||
      upper.startsWith('LEFT') ||
      upper.startsWith('RIGHT') ||
      upper.startsWith('ON') ||
      upper.startsWith('AND ') ||
      upper.startsWith('OR ')
    ) {
      formattedLines.push('  ' + line);
    } else {
      formattedLines.push(line);
    }
  }

  return formattedLines.join('\n');
}

export interface SQLGenerationOutput {
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'ALTER' | 'DROP' | 'TRUNCATE' | 'OTHER';
  sql: string;
  explanation: string;
  requires_confirmation: boolean;
  suggested_visualization?: 'bar' | 'line' | 'pie' | 'table' | 'metric';
  logic_steps?: string[];
  warning?: string;
}

export class GeminiService {
  public static async generateSQL(
    userQuery: string,
    schema: DatabaseSchema,
    conversationHistory: any[] = [],
    settings?: Partial<AISettings & { geminiApiKey?: string }>
  ): Promise<SQLGenerationOutput> {
    const ai = getGeminiClient(settings?.geminiApiKey);

    // Format schema into clean string
    const schemaFormatted = schema.tables
      .map((t) => {
        const cols = t.columns
          .map((c) => {
            let desc = `  - ${c.name} ${c.type}`;
            if (c.primaryKey) desc += ' PRIMARY KEY';
            if (c.foreignKey) desc += ` REFERENCES ${c.foreignKey.targetTable}(${c.foreignKey.targetColumn})`;
            return desc;
          })
          .join('\n');
        return `TABLE ${t.name} (${t.rowCount} rows)\n${cols}`;
      })
      .join('\n\n');

    const relationshipsFormatted = schema.relationships
      .map((r) => `${r.sourceTable}.${r.sourceColumn} -> ${r.targetTable}.${r.targetColumn}`)
      .join('\n');

    const stylePrompt = settings?.responseStyle === 'developer'
      ? 'Technical with precise indexing and join considerations.'
      : settings?.responseStyle === 'analyst'
      ? 'Business metric oriented with clear aggregation logic.'
      : 'Beginner-friendly with simple step-by-step explanations.';

    const systemInstruction = `You are LSQL, an expert AI Database & SQL Assistant powered by Gemini.
Your job is to translate natural language questions into precise, standard SQL queries (compatible with MySQL/SQLite) based strictly on the provided database schema.

DATABASE SCHEMA:
${schemaFormatted}

RELATIONSHIPS:
${relationshipsFormatted || 'None explicitly defined'}

CRITICAL RULES:
1. Only reference tables and columns that exist in the schema above. Do NOT invent columns or tables.
2. For aggregate queries (SUM, COUNT, AVG, MIN, MAX), ensure proper GROUP BY clauses.
3. Mark destructive operations (DELETE, UPDATE, DROP, TRUNCATE, ALTER) as requiring confirmation (requires_confirmation: true).
4. For SELECT queries, default requires_confirmation to false.
5. Provide a clear, step-by-step explanation of the query logic.
6. Suggest the best data visualization type ('bar', 'line', 'pie', 'table', or 'metric') for rendering the query output.
7. Style guidance: ${stylePrompt}
8. ALWAYS format the SQL statement line by line on multiple lines with proper line breaks before SELECT, FROM, JOIN, WHERE, GROUP BY, ORDER BY, and LIMIT clauses. Never output single-line SQL.
9. Always output STRICT valid JSON with no extra commentary outside JSON.`;

    const prompt = `User Question: "${userQuery}"

Recent Conversation Context:
${JSON.stringify(conversationHistory.slice(-3))}

Generate the appropriate SQL query and metadata strictly as JSON.`;

    try {
      const response = await ai.models.generateContent({
        model: settings?.model || 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              operation: {
                type: Type.STRING,
                description: 'The primary SQL operation (SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, etc.)'
              },
              sql: {
                type: Type.STRING,
                description: 'The clean, executable SQL statement'
              },
              explanation: {
                type: Type.STRING,
                description: 'A clear natural language explanation of how the SQL query works'
              },
              requires_confirmation: {
                type: Type.BOOLEAN,
                description: 'True if the operation mutates or deletes data'
              },
              suggested_visualization: {
                type: Type.STRING,
                description: 'Visual representation type: bar, line, pie, table, or metric'
              },
              logic_steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Sequential logical steps executed by the query'
              },
              warning: {
                type: Type.STRING,
                description: 'Optional warning if the request is ambiguous or high impact'
              }
            },
            required: ['operation', 'sql', 'explanation', 'requires_confirmation']
          }
        }
      });

      const text = response.text || '';
      const parsed = JSON.parse(text) as SQLGenerationOutput;
      if (parsed.sql) {
        parsed.sql = formatSqlString(parsed.sql);
      }
      return parsed;
    } catch (err: any) {
      console.error('Gemini generateSQL error:', err);
      // Fallback
      return {
        operation: 'SELECT',
        sql: `SELECT * FROM ${schema.tables[0]?.name || 'table'} LIMIT 10;`,
        explanation: 'Fallback query generated due to processing error: ' + (err.message || String(err)),
        requires_confirmation: false,
        suggested_visualization: 'table',
        logic_steps: ['Select rows from primary table']
      };
    }
  }

  public static async correctSQL(
    failedSql: string,
    errorMessage: string,
    userQuery: string,
    schema: DatabaseSchema,
    settings?: Partial<AISettings & { geminiApiKey?: string }>
  ): Promise<SQLGenerationOutput> {
    const ai = getGeminiClient(settings?.geminiApiKey);

    const schemaFormatted = schema.tables
      .map((t) => `${t.name}: ${t.columns.map((c) => `${c.name} (${c.type})`).join(', ')}`)
      .join('\n');

    const prompt = `The following SQL query failed during execution against the database:

Failed SQL:
${failedSql}

Database Error Message:
"${errorMessage}"

Original User Request:
"${userQuery}"

Actual Database Schema:
${schemaFormatted}

Correct the SQL query to fix the database error while preserving user intent. Return strict JSON.`;

    try {
      const response = await ai.models.generateContent({
        model: settings?.model || 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert SQL debugger. Correct the query to fix the database execution error based on the exact schema provided.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              operation: { type: Type.STRING },
              sql: { type: Type.STRING },
              explanation: { type: Type.STRING },
              requires_confirmation: { type: Type.BOOLEAN },
              suggested_visualization: { type: Type.STRING },
              logic_steps: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['operation', 'sql', 'explanation', 'requires_confirmation']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}') as SQLGenerationOutput;
      if (parsed.sql) {
        parsed.sql = formatSqlString(parsed.sql);
      }
      return parsed;
    } catch (e: any) {
      return {
        operation: 'SELECT',
        sql: failedSql,
        explanation: 'Could not auto-correct SQL: ' + (e.message || String(e)),
        requires_confirmation: false
      };
    }
  }

  public static async explainResult(
    userQuery: string,
    sql: string,
    queryResult: { columns: string[]; rows: any[]; executionTimeMs: number },
    schema: DatabaseSchema,
    settings?: Partial<AISettings & { geminiApiKey?: string }>
  ): Promise<{ answer: string; keyInsights: string[]; summaryMetric?: { label: string; value: string | number } }> {
    const ai = getGeminiClient(settings?.geminiApiKey);

    // Summarize rows without sending massive payload
    const rowCount = queryResult.rows.length;
    const sampleRows = queryResult.rows.slice(0, 5);

    const prompt = `User asked: "${userQuery}"
Executed SQL: ${sql}
Returned Results Summary:
- Total rows returned: ${rowCount}
- Columns: ${queryResult.columns.join(', ')}
- Sample Rows (up to 5): ${JSON.stringify(sampleRows)}

IMPORTANT:
1. Base your answer strictly on the ACTUAL returned query results above. DO NOT fabricate or invent numbers or names.
2. Provide a clear natural language answer addressing the user's question directly.
3. List 2-3 key insights derived from the data.
4. Extract a primary headline metric (e.g., Highest Spender: "Rahim Ahmed ($245,800)").`;

    try {
      const response = await ai.models.generateContent({
        model: settings?.model || 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are LSQL AI Assistant. Interpret database execution results accurately and succinctly in natural language.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: { type: Type.STRING, description: 'Direct natural language answer based on the real dataset result' },
              keyInsights: { type: Type.ARRAY, items: { type: Type.STRING }, description: '2-3 key data insights' },
              summaryMetric: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING }
                }
              }
            },
            required: ['answer', 'keyInsights']
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (err: any) {
      return {
        answer: `Execution complete. The query returned ${rowCount} record(s).`,
        keyInsights: [`Returned ${rowCount} rows in ${queryResult.executionTimeMs} ms.`]
      };
    }
  }
}
