import { Format, CHARACTER_LIMIT } from '../types.js';

/**
 * Formats output in JSON or Markdown based on the format parameter
 */
export function formatOutput(
  data: any,
  format: Format,
  options?: {
    title?: string;
    truncate?: boolean;
  }
): string {
  let output: string;

  if (format === 'json') {
    output = JSON.stringify(data, null, 2);
  } else {
    // Markdown format
    output = formatAsMarkdown(data, options?.title);
  }

  // Truncate if needed
  if (options?.truncate !== false && output.length > CHARACTER_LIMIT) {
    output = output.substring(0, CHARACTER_LIMIT) +
      '\n\n[... Output truncated at 25,000 characters. Use filters or pagination to reduce output size.]';
  }

  return output;
}

/**
 * Formats data as Markdown for human-readable output
 */
function formatAsMarkdown(data: any, title?: string): string {
  let md = '';

  if (title) {
    md += `# ${title}\n\n`;
  }

  if (Array.isArray(data)) {
    // Format array as a list or table
    if (data.length === 0) {
      md += '*No items found*\n';
    } else if (typeof data[0] === 'object') {
      md += formatArrayAsMarkdownTable(data);
    } else {
      data.forEach((item, index) => {
        md += `${index + 1}. ${item}\n`;
      });
    }
  } else if (typeof data === 'object' && data !== null) {
    // Format object as key-value pairs
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && value !== null) {
        md += `**${formatKey(key)}:**\n${formatAsMarkdown(value)}\n`;
      } else {
        md += `**${formatKey(key)}:** ${value}\n`;
      }
    }
  } else {
    md += String(data);
  }

  return md;
}

/**
 * Formats an array of objects as a Markdown table
 */
function formatArrayAsMarkdownTable(data: any[]): string {
  if (data.length === 0) return '*No items found*\n';

  // Get all unique keys from all objects
  const keys = Array.from(
    new Set(data.flatMap(item => Object.keys(item)))
  );

  // Create header
  let table = `| ${keys.map(formatKey).join(' | ')} |\n`;
  table += `| ${keys.map(() => '---').join(' | ')} |\n`;

  // Create rows
  data.forEach(item => {
    const row = keys.map(key => {
      const value = item[key];
      if (value === null || value === undefined) return '-';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    });
    table += `| ${row.join(' | ')} |\n`;
  });

  return table;
}

/**
 * Formats a camelCase or snake_case key into a readable label
 */
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Creates a successful response with formatted content
 */
export function createSuccessResponse(
  data: any,
  format: Format = 'markdown',
  options?: {
    title?: string;
    structuredContent?: any;
  }
) {
  const formattedText = formatOutput(data, format, options);

  return {
    content: [{ type: 'text', text: formattedText }],
    ...(options?.structuredContent && { structuredContent: options.structuredContent })
  };
}
