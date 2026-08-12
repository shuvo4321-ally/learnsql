import alasql from 'alasql';
import { ColumnInfo, DatabaseSchema, QueryResult, RelationshipInfo, TableInfo } from '../types';

let currentDbName = 'luminadb';

// Helper: Parse CSV line respecting quotes & escaped quotes
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      if (inQuotes && line[i + 1] === char) {
        current += char;
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^["']|["']$/g, ''));
  return result;
}

// Helper: Split SQL dump statements respecting string literals & multi-line comments
function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inString: string | null = null;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1];

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && nextChar === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    if (!inString) {
      if (char === '-' && nextChar === '-') {
        inLineComment = true;
        i++;
        continue;
      }
      if (char === '/' && nextChar === '*') {
        inBlockComment = true;
        i++;
        continue;
      }
      if (char === "'" || char === '"' || char === '`') {
        inString = char;
        current += char;
        continue;
      }
      if (char === ';') {
        const trimmed = current.trim();
        if (trimmed) statements.push(trimmed);
        current = '';
        continue;
      }
    } else {
      if (char === inString) {
        if (sql[i - 1] !== '\\') {
          inString = null;
        }
      }
    }

    current += char;
  }

  const trimmed = current.trim();
  if (trimmed) statements.push(trimmed);

  return statements;
}

export class SQLEngine {
  private static initialized = false;

  public static initializeDatabase(): void {
    try {
      const cleanDb = currentDbName.replace(/[^a-z0-9_]/gi, '_') || 'luminadb';
      alasql(`DROP DATABASE IF EXISTS ${cleanDb}`);
      alasql(`CREATE DATABASE ${cleanDb}`);
      alasql(`USE ${cleanDb}`);
      this.initialized = true;
    } catch (e) {
      console.error('Error initializing SQL Engine:', e);
    }
  }

  public static loadSQLDump(dbName: string, sqlDump: string): DatabaseSchema {
    currentDbName = dbName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!currentDbName) currentDbName = 'luminadb';

    this.initializeDatabase();

    const statements = splitSqlStatements(sqlDump);

    for (const stmt of statements) {
      try {
        alasql(stmt);
      } catch (err) {
        console.warn('Failed executing statement during load:', stmt, err);
      }
    }

    return this.extractSchema(dbName, sqlDump);
  }

  public static loadCSV(tableName: string, csvContent: string): DatabaseSchema {
    this.initializeDatabase();
    const cleanTableName = tableName.toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'custom_table';
    
    const lines = csvContent.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 1) {
      throw new Error('CSV file is empty');
    }

    const headers = parseCsvLine(lines[0]);
    const dataRows = lines.slice(1).map((line) => {
      const values = parseCsvLine(line);
      const row: Record<string, any> = {};
      headers.forEach((h, idx) => {
        const val = values[idx];
        if (val !== undefined && val !== '') {
          if (!isNaN(Number(val))) {
            row[h] = Number(val);
          } else {
            row[h] = val;
          }
        } else {
          row[h] = null;
        }
      });
      return row;
    });

    alasql(`CREATE TABLE ${cleanTableName}`);
    dataRows.forEach((row) => {
      alasql(`INSERT INTO ${cleanTableName} VALUES ?`, [row]);
    });

    return this.extractSchema(tableName);
  }

  public static extractSchema(dbName: string, rawSqlDump?: string): DatabaseSchema {
    const tables: TableInfo[] = [];
    const relationships: RelationshipInfo[] = [];

    // Extract table definitions from raw SQL dump if available
    const tableDDLs: Record<string, string> = {};
    if (rawSqlDump) {
      const createMatches = rawSqlDump.match(/CREATE\ TABLE\s+([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi);
      if (createMatches) {
        createMatches.forEach((createSql) => {
          const tableNameMatch = createSql.match(/CREATE\ TABLE\s+([a-zA-Z0-9_]+)/i);
          if (tableNameMatch) {
            tableDDLs[tableNameMatch[1].toLowerCase()] = createSql;
          }
        });
      }
    }

    try {
      const tableList = alasql(`SHOW TABLES`) as { tableid: string }[];
      const existingTableNames = tableList.map((t) => t.tableid.toLowerCase());

      for (const tObj of tableList) {
        const tableName = tObj.tableid;
        const cleanTable = tableName.replace(/[^a-z0-9_]/gi, '_');
        const countRes = alasql(`SELECT COUNT(*) AS cnt FROM ${cleanTable}`) as { cnt: number }[];
        const rowCount = countRes[0]?.cnt || 0;

        const sampleRows = (alasql(`SELECT * FROM ${cleanTable} LIMIT 5`) || []) as Record<string, any>[];

        const columns: ColumnInfo[] = [];
        const ddl = tableDDLs[tableName.toLowerCase()] || '';

        // Extract columns from sample rows, or fallback to alasql table metadata/DDL if row count is 0
        let columnMap: Record<string, string> = {};

        if (sampleRows.length > 0) {
          const keys = Object.keys(sampleRows[0]);
          keys.forEach((colName) => {
            const val = sampleRows[0][colName];
            let inferredType = 'VARCHAR';
            if (typeof val === 'number') {
              inferredType = Number.isInteger(val) ? 'INT' : 'DECIMAL';
            } else if (typeof val === 'boolean') {
              inferredType = 'BOOLEAN';
            } else if (val instanceof Date || (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val))) {
              inferredType = 'DATETIME';
            }
            columnMap[colName] = inferredType;
          });
        } else {
          // Fallback 1: alasql internal schema definition
          const alaTable = (alasql.tables as any)[tableName];
          if (alaTable && alaTable.columns && Array.isArray(alaTable.columns)) {
            alaTable.columns.forEach((c: any) => {
              const cName = c.columnid || c.name;
              if (cName) columnMap[cName] = c.dbtypeid || 'VARCHAR';
            });
          }
          // Fallback 2: Parse DDL string
          if (Object.keys(columnMap).length === 0 && ddl) {
            const ddlColMatches = Array.from(ddl.matchAll(/([a-zA-Z0-9_]+)\s+(VARCHAR|TEXT|INT|INTEGER|DECIMAL|FLOAT|DOUBLE|BOOLEAN|DATE|DATETIME|TIMESTAMP|BIGINT)/gi));
            ddlColMatches.forEach((m) => {
              columnMap[m[1]] = m[2].toUpperCase();
            });
          }
        }

        Object.keys(columnMap).forEach((colName) => {
          const inferredType = columnMap[colName];
          const isPK = colName.toLowerCase() === 'id' || ddl.toLowerCase().includes(`${colName.toLowerCase()} int primary key`);
          
          let fkInfo: ColumnInfo['foreignKey'] | undefined = undefined;
          if (colName.toLowerCase().endsWith('_id') && colName.toLowerCase() !== 'id') {
            const baseName = colName.substring(0, colName.length - 3).toLowerCase();
            // Match against actual table names before guessing
            let targetTable = existingTableNames.find(
              (t) => t === baseName || t === baseName + 's' || t === baseName + 'es'
            );
            if (!targetTable) {
              targetTable = baseName.endsWith('y') ? baseName.slice(0, -1) + 'ies' : baseName + 's';
            }

            fkInfo = { targetTable, targetColumn: 'id' };
            relationships.push({
              sourceTable: tableName,
              sourceColumn: colName,
              targetTable,
              targetColumn: 'id'
            });
          }

          columns.push({
            name: colName,
            type: inferredType,
            primaryKey: isPK,
            foreignKey: fkInfo,
            nullable: !isPK
          });
        });

        tables.push({
          name: tableName,
          columns,
          rowCount,
          sampleRows
        });
      }
    } catch (e) {
      console.error('Error extracting schema:', e);
    }

    return {
      name: dbName,
      type: 'MySQL',
      tables,
      relationships
    };
  }

  public static executeQuery(sql: string): QueryResult {
    const startTime = performance.now();
    try {
      const cleanSql = sql.trim().replace(/;+$/, '');
      const res = alasql(cleanSql);
      const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

      if (Array.isArray(res)) {
        if (res.length === 0) {
          return {
            columns: [],
            rows: [],
            executionTimeMs,
            affectedRows: 0
          };
        }

        const columns = Object.keys(res[0] || {});
        return {
          columns,
          rows: res as Record<string, any>[],
          executionTimeMs,
          affectedRows: res.length
        };
      } else if (typeof res === 'number') {
        return {
          columns: ['affected_rows'],
          rows: [{ affected_rows: res }],
          executionTimeMs,
          affectedRows: res
        };
      } else {
        return {
          columns: ['status'],
          rows: [{ status: 'Query executed successfully' }],
          executionTimeMs,
          affectedRows: 1
        };
      }
    } catch (err: any) {
      const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
      return {
        columns: [],
        rows: [],
        executionTimeMs,
        error: err?.message || String(err)
      };
    }
  }

  public static isDestructiveOperation(sql: string): boolean {
    const normalized = sql.trim().toUpperCase();
    return (
      normalized.startsWith('DELETE') ||
      normalized.startsWith('UPDATE') ||
      normalized.startsWith('DROP') ||
      normalized.startsWith('TRUNCATE') ||
      normalized.startsWith('ALTER')
    );
  }
}
