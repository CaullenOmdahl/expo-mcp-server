import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ExpoServerConfig, FormatSchema, PlatformSchema } from '../types.js';
import { executeExpoCommand } from '../utils/cli.js';
import { createSuccessResponse } from '../utils/format.js';
import { formatErrorResponse, ExpoError } from '../utils/errors.js';

/**
 * Registers development workflow tools with the MCP server
 */
export function registerDevelopmentTools(server: McpServer, config?: ExpoServerConfig): void {

  // expo_doctor - Run project diagnostics
  server.registerTool(
    'expo_doctor',
    {
      title: 'Run Expo Project Diagnostics',
      description: `Run comprehensive diagnostics on an Expo project to identify issues.

This tool checks for common problems including:
- Package version mismatches
- Configuration errors
- Missing dependencies
- Environment setup issues
- Compatibility problems

**When to use:**
- Troubleshooting build or runtime errors
- After upgrading SDK versions
- Setting up a project on a new machine
- Before starting development

**What it checks:**
- Expo SDK compatibility
- Package versions alignment
- Configuration validity
- Required native dependencies

**Example usage:**
- Check current project: projectPath="."
- Fix issues automatically: fixIssues=true

**Returns:** List of issues found and suggestions for fixes.

**Errors:**
- Not an Expo project
- Unable to read configuration`,
      inputSchema: {
        projectPath: z.string()
          .optional()
          .describe('Path to the Expo project. Default: current directory'),
        fixIssues: z.boolean()
          .default(false)
          .describe('Attempt to automatically fix found issues. Default: false'),
        format: FormatSchema.default('markdown')
          .describe('Output format: "json" or "markdown"')
      },
      outputSchema: {
        issues: z.array(z.any()),
        fixed: z.array(z.string()).optional()
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ projectPath, fixIssues, format }) => {
      try {
        const args = ['doctor'];
        if (fixIssues) args.push('--fix-dependencies');

        const output = await executeExpoCommand(args, config, projectPath);

        const result = {
          issues: [],
          message: output || 'No issues found. Project looks healthy!',
          fixed: fixIssues ? ['Automatically fixed dependency issues'] : undefined
        };

        return createSuccessResponse(result, format, { structuredContent: result });
      } catch (error) {
        if (error instanceof ExpoError) {
          return formatErrorResponse(error);
        }
        throw error;
      }
    }
  );
}
