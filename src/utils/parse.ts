/**
 * Parses CLI output into structured data
 */

/**
 * Parses JSON output from CLI commands
 */
export function parseJsonOutput<T = any>(output: string): T {
  try {
    return JSON.parse(output);
  } catch (error) {
    throw new Error(`Failed to parse JSON output: ${error}`);
  }
}

/**
 * Extracts build ID from EAS build output
 */
export function extractBuildId(output: string): string | null {
  const match = output.match(/Build ID:\s+([a-f0-9-]+)/i) ||
                output.match(/https:\/\/expo\.dev\/.*\/builds\/([a-f0-9-]+)/);
  return match ? match[1] : null;
}

/**
 * Extracts update ID from EAS update output
 */
export function extractUpdateId(output: string): string | null {
  const match = output.match(/Update ID:\s+([a-f0-9-]+)/i) ||
                output.match(/https:\/\/expo\.dev\/.*\/updates\/([a-f0-9-]+)/);
  return match ? match[1] : null;
}

/**
 * Parses build status from output
 */
export function parseBuildStatus(output: string): {
  status: string;
  platform?: string;
  profile?: string;
  createdAt?: string;
} {
  const lines = output.split('\n');
  const result: any = {};

  for (const line of lines) {
    if (line.includes('Status:')) {
      result.status = line.split(':')[1].trim();
    }
    if (line.includes('Platform:')) {
      result.platform = line.split(':')[1].trim();
    }
    if (line.includes('Profile:')) {
      result.profile = line.split(':')[1].trim();
    }
    if (line.includes('Created:')) {
      result.createdAt = line.split(':')[1].trim();
    }
  }

  return result;
}

/**
 * Parses table output from CLI into structured data
 */
export function parseTableOutput(output: string): any[] {
  const lines = output.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Find header line (usually contains dashes)
  const separatorIndex = lines.findIndex(line => line.includes('---'));
  if (separatorIndex === -1) return [];

  const headers = lines[separatorIndex - 1]
    .split('|')
    .map(h => h.trim())
    .filter(Boolean);

  const dataLines = lines.slice(separatorIndex + 1);

  return dataLines.map(line => {
    const values = line.split('|').map(v => v.trim()).filter(Boolean);
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    return row;
  });
}
