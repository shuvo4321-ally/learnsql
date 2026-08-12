/**
 * Formats a SQL query string so that major SQL clauses appear line-by-line.
 */
export function formatSql(sql: string): string {
  if (!sql) return '';

  let cleaned = sql.trim();

  // If already formatted with multiple lines, ensure it's clean and normalized
  const existingLines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);
  if (existingLines.length > 2) {
    return existingLines.join('\n');
  }

  // Remove duplicate whitespaces
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Protect string literals from keyword matching
  const strings: string[] = [];
  let protectedSql = cleaned.replace(/(['"])(?:\\.|[^\\])*?\1/g, (match) => {
    strings.push(match);
    return `___STR_${strings.length - 1}___`;
  });

  // List of major keywords to place on a new line
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

  // Insert a newline character before each major keyword
  for (const kw of majorKeywords) {
    const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
    protectedSql = protectedSql.replace(regex, (match) => `\n${match.toUpperCase()}`);
  }

  // Also put AND / OR sub-clauses on new lines with indent
  protectedSql = protectedSql.replace(/\b(AND|OR)\b/gi, (match) => `\n  ${match.toUpperCase()}`);

  // Restore string literals
  protectedSql = protectedSql.replace(/___STR_(\d+)___/g, (_, idx) => strings[Number(idx)] || '');

  const rawLines = protectedSql.split('\n').map((l) => l.trim()).filter(Boolean);
  const formattedLines: string[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const upper = line.toUpperCase();

    // Indent sub-clauses like JOIN, ON, AND, OR
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
