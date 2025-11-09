import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ExpoServerConfig, FormatSchema } from '../types.js';
import { executeEasCommand } from '../utils/cli.js';
import { createSuccessResponse } from '../utils/format.js';
import { formatErrorResponse, ExpoError } from '../utils/errors.js';
import { extractUpdateId } from '../utils/parse.js';

/**
 * Registers EAS Update tools with the MCP server
 */
export function registerUpdateTools(server: McpServer, config?: ExpoServerConfig): void {

  // eas_update_publish - Publish OTA update
  server.registerTool(
    'eas_update_publish',
    {
      title: 'Publish EAS Update',
      description: `Publish an over-the-air (OTA) update to specific branch/channel.

EAS Update enables you to push bug fixes and small updates directly to users without
requiring a full app store review and download.

**When to use:**
- Fixing critical bugs quickly
- Pushing non-native code changes
- A/B testing different versions
- Rolling out features gradually

**How it works:**
1. Publish update to a branch (e.g., "production", "preview")
2. Updates automatically delivered to compatible builds
3. Users get update on next app launch/check

**Limitations:**
- Cannot update native code (requires new build)
- Cannot change app version or native dependencies
- Users must have compatible runtime version

**Example usage:**
- Publish to production: branch="production", message="Fix login bug"
- Preview update: branch="preview", message="Test new feature"
- Specific channel: channel="beta-testers"

**Returns:** Update ID, group ID, and deployment information.

**Errors:**
- Not in an Expo project
- Authentication required
- No compatible builds found
- Bundle errors`,
      inputSchema: z.object({
        branch: z.string()
          .min(1)
          .describe('Branch name to publish to. Common: "production", "preview", "development". Example: "production"'),
        message: z.string()
          .min(1)
          .describe('Update message describing the changes. Example: "Fix authentication bug"'),
        channel: z.string()
          .optional()
          .describe('Specific channel to publish to. If omitted, uses branch default channel'),
        projectPath: z.string()
          .optional()
          .describe('Path to the Expo project. Default: current directory'),
        format: FormatSchema.default('markdown')
          .describe('Output format: "json" or "markdown"')
      }).strict(),
      outputSchema: z.object({
        updateId: z.string().optional(),
        branch: z.string(),
        message: z.string(),
        link: z.string().optional()
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    async ({ branch, message, channel, projectPath, format }) => {
      try {
        const args = ['update', '--branch', branch, '--message', message];
        if (channel) args.push('--channel', channel);

        const output = await executeEasCommand(args, config, projectPath);

        const updateId = extractUpdateId(output);
        const result = {
          updateId: updateId || undefined,
          branch,
          channel,
          message,
          link: updateId ? `https://expo.dev/updates/${updateId}` : undefined,
          output: `Update published successfully to branch "${branch}"${channel ? ` (channel: ${channel})` : ''}\n\nMessage: ${message}\n\nUpdate ID: ${updateId}`
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

  // eas_update_list - List recent updates
  server.registerTool(
    'eas_update_list',
    {
      title: 'List EAS Updates',
      description: `List recent published updates with optional branch filtering.

View update history to see what has been published, when, and to which branches.

**When to use:**
- Reviewing recent deployments
- Finding update IDs for rollback
- Checking update deployment status
- Auditing update history

**Example usage:**
- All recent updates: (use defaults)
- Production branch only: branch="production"
- Limit results: limit=20

**Returns:** Array of updates with ID, branch, message, and publish time.

**Errors:**
- Authentication required
- Project not found`,
      inputSchema: z.object({
        branch: z.string()
          .optional()
          .describe('Filter by branch name. Example: "production"'),
        projectPath: z.string()
          .optional()
          .describe('Path to the Expo project. Default: current directory'),
        limit: z.number()
          .min(1)
          .max(50)
          .default(10)
          .describe('Maximum number of updates to return. Default: 10, Max: 50'),
        format: FormatSchema.default('markdown')
          .describe('Output format: "json" or "markdown"')
      }).strict(),
      outputSchema: z.object({
        updates: z.array(z.any())
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async ({ branch, projectPath, limit, format }) => {
      try {
        const args = ['update:list', '--limit', limit.toString(), '--json'];
        if (branch) args.push('--branch', branch);

        const output = await executeEasCommand(args, config, projectPath);

        const updates = JSON.parse(output);

        return createSuccessResponse({ updates }, format, {
          title: 'Recent EAS Updates',
          structuredContent: { updates }
        });
      } catch (error) {
        if (error instanceof ExpoError) {
          return formatErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // eas_channel_create - Create update channel
  server.registerTool(
    'eas_channel_create',
    {
      title: 'Create EAS Update Channel',
      description: `Create a new update channel for distributing updates to specific user groups.

Channels allow you to control which updates reach which users. Different builds can
subscribe to different channels, enabling:
- Staged rollouts
- Beta testing
- A/B testing
- Environment-specific updates

**Channel Strategy:**
- production: Stable releases for all users
- preview/staging: Pre-release testing
- development: Active development updates
- beta: Beta tester group
- Custom channels: Feature flags, regions, etc.

**Example usage:**
- Create channel: channelName="beta-testers"
- Create with branch: channelName="staging", branchMapping="preview"

**Returns:** Confirmation of channel creation.

**Errors:**
- Channel already exists
- Invalid channel name
- Authentication required`,
      inputSchema: z.object({
        channelName: z.string()
          .min(1)
          .describe('Name of the channel to create. Example: "beta-testers", "production", "staging"'),
        branchMapping: z.string()
          .optional()
          .describe('Map channel to a specific branch. Example: "production"'),
        projectPath: z.string()
          .optional()
          .describe('Path to the Expo project. Default: current directory'),
        format: FormatSchema.default('markdown')
          .describe('Output format: "json" or "markdown"')
      }).strict(),
      outputSchema: z.object({
        success: z.boolean(),
        channelName: z.string(),
        message: z.string()
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async ({ channelName, branchMapping, projectPath, format }) => {
      try {
        const args = ['channel:create', channelName];
        if (branchMapping) args.push('--branch', branchMapping);

        await executeEasCommand(args, config, projectPath);

        const result = {
          success: true,
          channelName,
          branchMapping,
          message: `Channel "${channelName}" created successfully.${branchMapping ? ` Mapped to branch: ${branchMapping}` : ''}`
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
