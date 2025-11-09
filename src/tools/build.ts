import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ExpoServerConfig, FormatSchema, PlatformSchema, BuildProfileSchema } from '../types.js';
import { executeEasCommand } from '../utils/cli.js';
import { createSuccessResponse } from '../utils/format.js';
import { formatErrorResponse, ExpoError } from '../utils/errors.js';
import { extractBuildId, parseBuildStatus } from '../utils/parse.js';

/**
 * Registers EAS Build tools with the MCP server
 */
export function registerBuildTools(server: McpServer, config?: ExpoServerConfig): void {

  // eas_build_create - Trigger a new build
  server.registerTool(
    'eas_build_create',
    {
      title: 'Create EAS Build',
      description: `Trigger a new cloud build for iOS, Android, or both platforms.

EAS Build compiles your app in the cloud, handling code signing and producing app binaries
ready for distribution or submission to app stores.

**When to use:**
- Creating production builds for app store submission
- Generating preview builds for testing
- Creating development builds for team distribution

**Build Profiles:**
- development: Debug builds with dev client for testing
- preview: Release builds for internal testing (TestFlight, internal tracks)
- production: Production builds for app store release

**Workflow:**
1. Trigger build with this tool
2. Build runs in cloud (typically 10-30 minutes)
3. Use eas_build_status to monitor progress
4. Download or submit completed build

**Example usage:**
- Production build both platforms: platform="all", profile="production"
- Preview iOS only: platform="ios", profile="preview"
- Development Android: platform="android", profile="development"

**Returns:** Build ID, status, and monitoring link.

**Errors:**
- Authentication required (set EXPO_TOKEN)
- Invalid profile name (check eas.json)
- Configuration errors
- Insufficient quota/credits`,
      inputSchema: {
        platform: PlatformSchema
          .describe('Platform to build: "ios", "android", or "all" (both)'),
        profile: BuildProfileSchema
          .default('production')
          .describe('Build profile from eas.json. Common: "development", "preview", "production". Default: "production"'),
        projectPath: z.string()
          .optional()
          .describe('Path to the Expo project. Default: current directory'),
        nonInteractive: z.boolean()
          .default(true)
          .describe('Run in non-interactive mode. Default: true'),
        format: FormatSchema.default('markdown')
          .describe('Output format: "json" or "markdown"')
      },
      outputSchema: {
        buildId: z.string().optional(),
        platform: z.string(),
        profile: z.string(),
        status: z.string(),
        link: z.string().optional()
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    async ({ platform, profile, projectPath, nonInteractive, format }) => {
      try {
        const args = ['build', '--platform', platform, '--profile', profile];
        if (nonInteractive) args.push('--non-interactive');

        const output = await executeEasCommand(args, config, projectPath);

        const buildId = extractBuildId(output);
        const result = {
          buildId: buildId || undefined,
          platform,
          profile,
          status: 'in-queue',
          link: buildId ? `https://expo.dev/builds/${buildId}` : undefined,
          message: `Build ${buildId ? `#${buildId}` : ''} created for ${platform} (${profile} profile).\n\nMonitor progress: Use eas_build_status with buildId="${buildId}"`
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

  // eas_build_list - List recent builds
  server.registerTool(
    'eas_build_list',
    {
      title: 'List EAS Builds',
      description: `List recent builds with optional filtering by platform, status, or profile.

View build history to monitor progress, check statuses, and retrieve build IDs for
further operations.

**When to use:**
- Checking recent build history
- Finding build IDs for status checks
- Monitoring build pipeline
- Reviewing failed builds

**Filter options:**
- Platform: ios, android, or all
- Status: in-queue, in-progress, finished, errored, canceled
- Profile: development, preview, production

**Example usage:**
- Recent builds: (use defaults for all recent builds)
- Failed iOS builds: platform="ios", status="errored"
- Production builds only: profile="production"
- Limit results: limit=5

**Returns:** Array of builds with ID, platform, status, profile, and creation time.

**Errors:**
- Authentication required
- Project not found`,
      inputSchema: {
        projectPath: z.string()
          .optional()
          .describe('Path to the Expo project. Default: current directory'),
        platform: PlatformSchema
          .optional()
          .describe('Filter by platform: "ios", "android", or "all"'),
        status: z.enum(['in-queue', 'in-progress', 'finished', 'errored', 'canceled'])
          .optional()
          .describe('Filter by build status'),
        profile: BuildProfileSchema
          .optional()
          .describe('Filter by build profile'),
        limit: z.number()
          .min(1)
          .max(50)
          .default(10)
          .describe('Maximum number of builds to return. Default: 10, Max: 50'),
        format: FormatSchema.default('markdown')
          .describe('Output format: "json" or "markdown"')
      },
      outputSchema: {
        builds: z.array(z.any())
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async ({ projectPath, platform, status, profile, limit, format }) => {
      try {
        const args = ['build:list', '--limit', limit.toString(), '--json'];
        if (platform && platform !== 'all') args.push('--platform', platform);
        if (status) args.push('--status', status);
        if (profile) args.push('--profile', profile);

        const output = await executeEasCommand(args, config, projectPath);

        const builds = JSON.parse(output);

        return createSuccessResponse({ builds }, format, {
          title: 'Recent EAS Builds',
          structuredContent: { builds }
        });
      } catch (error) {
        if (error instanceof ExpoError) {
          return formatErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // eas_build_status - Get specific build status
  server.registerTool(
    'eas_build_status',
    {
      title: 'Get EAS Build Status',
      description: `Get detailed status and information for a specific build by ID.

Retrieve comprehensive build information including current status, platform, profile,
logs, and download links for completed builds.

**When to use:**
- Monitoring an in-progress build
- Checking if a build completed successfully
- Retrieving build artifacts/download links
- Debugging failed builds

**Build Statuses:**
- in-queue: Waiting to start
- in-progress: Currently building
- finished: Completed successfully
- errored: Failed with errors
- canceled: Manually canceled

**Example usage:**
- Check build: buildId="abc-123-def"
- Include logs: buildId="abc-123-def" (logs automatically included on error)

**Returns:** Detailed build information including status, timestamps, and links.

**Errors:**
- Build ID not found
- Authentication required`,
      inputSchema: {
        buildId: z.string()
          .min(1)
          .describe('Build ID to check status for. Example: "abc-123-def-456"'),
        format: FormatSchema.default('markdown')
          .describe('Output format: "json" or "markdown"')
      },
      outputSchema: {
        build: z.any()
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async ({ buildId, format }) => {
      try {
        const args = ['build:view', buildId, '--json'];

        const output = await executeEasCommand(args, config);

        const build = JSON.parse(output);

        return createSuccessResponse({ build }, format, {
          title: `Build Status: ${buildId}`,
          structuredContent: { build }
        });
      } catch (error) {
        if (error instanceof ExpoError) {
          return formatErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // eas_build_cancel - Cancel a running build
  server.registerTool(
    'eas_build_cancel',
    {
      title: 'Cancel EAS Build',
      description: `Cancel a build that is currently in-queue or in-progress.

Use this tool to cancel builds that are no longer needed, freeing up build queue slots
and stopping unnecessary resource usage.

**When to use:**
- Started wrong build configuration
- Need to make changes before build completes
- Build taking too long/stuck
- Build no longer needed

**Note:** Can only cancel builds with status "in-queue" or "in-progress".
Completed or errored builds cannot be canceled.

**Example usage:**
- Cancel build: buildId="abc-123-def"

**Returns:** Confirmation of cancellation.

**Errors:**
- Build ID not found
- Build already completed/errored
- Not authorized to cancel build`,
      inputSchema: {
        buildId: z.string()
          .min(1)
          .describe('Build ID to cancel. Example: "abc-123-def-456"'),
        format: FormatSchema.default('markdown')
          .describe('Output format: "json" or "markdown"')
      },
      outputSchema: {
        success: z.boolean(),
        buildId: z.string(),
        message: z.string()
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async ({ buildId, format }) => {
      try {
        const args = ['build:cancel', buildId];

        await executeEasCommand(args, config);

        const result = {
          success: true,
          buildId,
          message: `Build ${buildId} has been canceled.`
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
