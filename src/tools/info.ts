import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ExpoServerConfig, FormatSchema } from '../types.js';
import { executeExpoCommand, executeEasCommand } from '../utils/cli.js';
import { createSuccessResponse } from '../utils/format.js';
import { formatErrorResponse, ExpoError } from '../utils/errors.js';

/**
 * Registers project information tools with the MCP server
 */
export function registerInfoTools(server: McpServer, config?: ExpoServerConfig): void {

  // expo_whoami - Check authentication status
  server.registerTool(
    'expo_whoami',
    {
      title: 'Check Expo Authentication Status',
      description: `Check the current Expo account authentication status.

Verifies which Expo account is currently authenticated and whether authentication
is working correctly.

**When to use:**
- Verifying EXPO_TOKEN is set correctly
- Troubleshooting authentication issues
- Confirming account before operations
- Checking organization access

**Example usage:**
- Check auth: (no parameters needed)

**Returns:** Authenticated username and account details.

**Errors:**
- Not authenticated (EXPO_TOKEN not set or invalid)`,
      inputSchema: z.object({
        format: FormatSchema.default('markdown')
          .describe('Output format: "json" or "markdown"')
      }).strict(),
      outputSchema: z.object({
        username: z.string(),
        authenticated: z.boolean()
      })
    },
    {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    },
    async ({ format }) => {
      try {
        const output = await executeExpoCommand(['whoami'], config);

        const username = output.trim();
        const result = {
          username,
          authenticated: !!username && username !== 'Not logged in',
          message: username ? `Authenticated as: ${username}` : 'Not authenticated'
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

  // eas_project_info - Get EAS project information
  server.registerTool(
    'eas_project_info',
    {
      title: 'Get EAS Project Information',
      description: `Get detailed information about the EAS project configuration.

Retrieves project metadata including project ID, slug, owner, and EAS configuration.

**When to use:**
- Verifying project setup
- Getting project identifiers
- Checking EAS configuration
- Troubleshooting project issues

**Example usage:**
- Get project info: projectPath="."

**Returns:** Project ID, slug, owner, and configuration details.

**Errors:**
- Not an Expo project
- Project not registered with EAS
- Authentication required`,
      inputSchema: z.object({
        projectPath: z.string()
          .optional()
          .describe('Path to the Expo project. Default: current directory'),
        format: FormatSchema.default('markdown')
          .describe('Output format: "json" or "markdown"')
      }).strict(),
      outputSchema: z.object({
        project: z.any()
      })
    },
    {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    },
    async ({ projectPath, format }) => {
      try {
        const args = ['project:info', '--json'];

        const output = await executeEasCommand(args, config, projectPath);

        const project = JSON.parse(output);

        return createSuccessResponse({ project }, format, {
          title: 'EAS Project Information',
          structuredContent: { project }
        });
      } catch (error) {
        if (error instanceof ExpoError) {
          return formatErrorResponse(error);
        }
        throw error;
      }
    }
  );
}
