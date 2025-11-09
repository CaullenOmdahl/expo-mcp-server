import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ExpoServerConfig, FormatSchema } from '../types.js';
import { executeEasCommand } from '../utils/cli.js';
import { createSuccessResponse } from '../utils/format.js';
import { formatErrorResponse, ExpoError } from '../utils/errors.js';

/**
 * Registers EAS Submit tools with the MCP server
 */
export function registerSubmitTools(server: McpServer, config?: ExpoServerConfig): void {

  // eas_submit_ios - Submit iOS build to App Store
  server.registerTool(
    'eas_submit_ios',
    {
      title: 'Submit iOS Build to App Store',
      description: `Submit an iOS build to App Store Connect for TestFlight or App Store review.

Automates the iOS submission process, uploading your build to App Store Connect and
making it available in TestFlight. For production release, manual submission from
App Store Connect is still required.

**Submission Process:**
1. Build is uploaded to App Store Connect
2. Processing begins (typically 10-30 min)
3. Build becomes available in TestFlight
4. Manually submit for App Review for production release

**Requirements:**
- Valid Apple Developer account
- App Store Connect API key or Apple ID credentials
- Completed build ID

**Example usage:**
- Submit latest build: (use defaults to auto-select latest)
- Submit specific build: buildId="abc-123-def"
- With ASC API key: ascApiKeyPath="/path/to/key.p8"

**Returns:** Submission status and App Store Connect link.

**Errors:**
- Authentication/credentials missing
- Build not compatible (wrong bundle ID, etc.)
- App Store Connect API errors
- Build already submitted`,
      inputSchema: z.object({
        buildId: z.string()
          .optional()
          .describe('Specific build ID to submit. If omitted, uses latest successful iOS build'),
        ascApiKeyPath: z.string()
          .optional()
          .describe('Path to App Store Connect API Key (.p8 file) for authentication'),
        ascApiKeyId: z.string()
          .optional()
          .describe('App Store Connect API Key ID (required if using API key)'),
        ascApiKeyIssuerId: z.string()
          .optional()
          .describe('App Store Connect API Key Issuer ID (required if using API key)'),
        projectPath: z.string()
          .optional()
          .describe('Path to the Expo project. Default: current directory'),
        format: FormatSchema.default('markdown')
          .describe('Output format: "json" or "markdown"')
      }).strict(),
      outputSchema: z.object({
        success: z.boolean(),
        buildId: z.string().optional(),
        message: z.string()
      })
    },
    {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true
    },
    async ({ buildId, ascApiKeyPath, ascApiKeyId, ascApiKeyIssuerId, projectPath, format }) => {
      try {
        const args = ['submit', '--platform', 'ios', '--non-interactive'];

        if (buildId) args.push('--id', buildId);
        if (ascApiKeyPath) args.push('--asc-api-key-path', ascApiKeyPath);
        if (ascApiKeyId) args.push('--asc-api-key-id', ascApiKeyId);
        if (ascApiKeyIssuerId) args.push('--asc-api-key-issuer-id', ascApiKeyIssuerId);

        const output = await executeEasCommand(args, config, projectPath);

        const result = {
          success: true,
          buildId,
          message: `iOS build submitted to App Store Connect successfully.\n\nThe build will be available in TestFlight after processing (typically 10-30 minutes).\n\nFor production release, go to App Store Connect and manually submit for App Review.`
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

  // eas_submit_android - Submit Android build to Google Play
  server.registerTool(
    'eas_submit_android',
    {
      title: 'Submit Android Build to Google Play',
      description: `Submit an Android build to Google Play Console for distribution.

Automates the Android submission process, uploading your build to Google Play Console
and placing it in the specified track (internal, alpha, beta, or production).

**Submission Tracks:**
- internal: Internal testing (up to 100 testers)
- alpha: Closed alpha testing
- beta: Closed or open beta testing
- production: Public release (requires manual publish after review)

**Requirements:**
- Google Play Console account
- Service account JSON key with proper permissions
- Completed build ID

**Note:** Production track builds do not automatically go live. You must manually
publish from Google Play Console after upload.

**Example usage:**
- Submit to internal track: track="internal"
- Submit specific build: buildId="abc-123-def", track="beta"
- With service account: serviceAccountKeyPath="/path/to/key.json"

**Returns:** Submission status and Google Play Console link.

**Errors:**
- Authentication/credentials missing
- Build not compatible (wrong package name, etc.)
- Google Play API errors
- Version code already exists`,
      inputSchema: z.object({
        track: z.enum(['internal', 'alpha', 'beta', 'production'])
          .default('internal')
          .describe('Google Play track for submission. Default: "internal"'),
        buildId: z.string()
          .optional()
          .describe('Specific build ID to submit. If omitted, uses latest successful Android build'),
        serviceAccountKeyPath: z.string()
          .optional()
          .describe('Path to Google Play service account JSON key file'),
        projectPath: z.string()
          .optional()
          .describe('Path to the Expo project. Default: current directory'),
        format: FormatSchema.default('markdown')
          .describe('Output format: "json" or "markdown"')
      }).strict(),
      outputSchema: z.object({
        success: z.boolean(),
        buildId: z.string().optional(),
        track: z.string(),
        message: z.string()
      })
    },
    {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true
    },
    async ({ track, buildId, serviceAccountKeyPath, projectPath, format }) => {
      try {
        const args = ['submit', '--platform', 'android', '--track', track, '--non-interactive'];

        if (buildId) args.push('--id', buildId);
        if (serviceAccountKeyPath) args.push('--key', serviceAccountKeyPath);

        const output = await executeEasCommand(args, config, projectPath);

        const result = {
          success: true,
          buildId,
          track,
          message: `Android build submitted to Google Play Console successfully (${track} track).\n\n${track === 'production' ? 'Note: Production builds require manual publish from Google Play Console after review.' : 'Build is now available in the specified track.'}`
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
