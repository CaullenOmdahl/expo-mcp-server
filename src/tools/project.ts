import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ExpoServerConfig, FormatSchema } from '../types.js';
import { executeExpoCommand } from '../utils/cli.js';
import { createSuccessResponse, formatOutput } from '../utils/format.js';
import { formatErrorResponse, ExpoError } from '../utils/errors.js';

/**
 * Registers project management tools with the MCP server
 */
export function registerProjectTools(server: McpServer, config?: ExpoServerConfig): void {

  // expo_init_project - Create a new Expo project
  server.registerTool(
    'expo_init_project',
    {
      title: 'Initialize Expo Project',
      description: `Create a new Expo project with a selected template.

This tool creates a new Expo project directory with all necessary files and dependencies.
It's the first step in creating a new Expo application.

**When to use:** Starting a new Expo/React Native project from scratch.

**Templates available:**
- blank: Minimal template with just the essential dependencies
- tabs: Template with tab-based navigation using Expo Router
- blank-typescript: Blank template with TypeScript configured
- navigation: Template with React Navigation pre-configured

**Example usage:**
- Create a blank TypeScript project: projectName="my-app", template="blank-typescript"
- Create app with tabs: projectName="my-app", template="tabs"

**Returns:** Success message with project path and next steps.

**Errors:**
- Directory already exists
- Invalid template name
- Network errors during package installation`,
      inputSchema: z.object({
        projectName: z.string()
          .min(1)
          .describe('Name of the project directory to create. Example: "my-awesome-app"'),
        template: z.enum(['blank', 'tabs', 'blank-typescript', 'navigation'])
          .default('blank-typescript')
          .describe('Project template to use. Default: "blank-typescript"'),
        directory: z.string()
          .optional()
          .describe('Parent directory where the project should be created. Default: current directory'),
        format: FormatSchema.default('markdown')
          .describe('Output format: "json" or "markdown"')
      }).strict(),
      outputSchema: z.object({
        success: z.boolean(),
        projectPath: z.string(),
        message: z.string()
      })
    },
    {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true
    },
    async ({ projectName, template, directory, format }) => {
      try {
        const args = ['init', projectName, '--template', template];

        const output = await executeExpoCommand(args, config, directory);

        const result = {
          success: true,
          projectPath: directory ? `${directory}/${projectName}` : projectName,
          message: `Project "${projectName}" created successfully using ${template} template.\n\nNext steps:\n1. cd ${projectName}\n2. npx expo start`
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

  // expo_install_packages - Install packages with version validation
  server.registerTool(
    'expo_install_project',
    {
      title: 'Install Expo Packages',
      description: `Install packages with automatic version validation for React Native compatibility.

This tool uses Expo's smart package installer which automatically selects compatible versions
of packages based on your Expo SDK version.

**When to use:** Installing new dependencies in an Expo project.

**Benefits over npm/yarn:**
- Automatic version compatibility checking
- Warns about incompatible versions
- Suggests correct versions for your SDK

**Example usage:**
- Install single package: packages=["expo-camera"]
- Install multiple: packages=["expo-camera", "expo-location", "expo-sensors"]

**Returns:** Installation results with package versions installed.

**Errors:**
- Package not found
- Version incompatibility
- Network errors
- Must be run in an Expo project directory`,
      inputSchema: z.object({
        packages: z.array(z.string())
          .min(1)
          .describe('Array of package names to install. Examples: ["expo-camera"], ["react-native-maps", "expo-location"]'),
        projectPath: z.string()
          .optional()
          .describe('Path to the Expo project. Default: current directory'),
        format: FormatSchema.default('markdown')
          .describe('Output format: "json" or "markdown"')
      }).strict(),
      outputSchema: z.object({
        success: z.boolean(),
        installedPackages: z.array(z.string()),
        message: z.string()
      })
    },
    {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    },
    async ({ packages, projectPath, format }) => {
      try {
        const args = ['install', ...packages];

        const output = await executeExpoCommand(args, config, projectPath);

        const result = {
          success: true,
          installedPackages: packages,
          message: `Successfully installed: ${packages.join(', ')}`
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

  // expo_get_config - View app configuration
  server.registerTool(
    'expo_get_config',
    {
      title: 'Get Expo Configuration',
      description: `View the evaluated Expo app configuration (app.json/app.config.js).

This tool reads and evaluates your app's configuration, showing the final computed values
including all dynamic values from app.config.js.

**When to use:**
- Debugging configuration issues
- Verifying config values before builds
- Understanding current app settings

**Configuration includes:**
- App name, slug, and version
- Platform-specific settings (iOS, Android, web)
- Build configuration
- Asset and icon paths
- Permissions and capabilities

**Example usage:**
- View current config: projectPath="." (or omit for current directory)
- View another project: projectPath="/path/to/project"

**Returns:** Complete app configuration in JSON or Markdown format.

**Errors:**
- No app.json or app.config.js found
- Invalid configuration syntax
- Missing required fields`,
      inputSchema: z.object({
        projectPath: z.string()
          .optional()
          .describe('Path to the Expo project. Default: current directory'),
        full: z.boolean()
          .default(false)
          .describe('Include full configuration including defaults. Default: false'),
        format: FormatSchema.default('json')
          .describe('Output format: "json" or "markdown". Default: "json" for configs')
      }).strict(),
      outputSchema: z.object({
        config: z.any()
      })
    },
    {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    },
    async ({ projectPath, full, format }) => {
      try {
        const args = ['config', '--type', 'public'];
        if (full) args.push('--full');

        const output = await executeExpoCommand(args, config, projectPath);

        const configData = JSON.parse(output);

        return createSuccessResponse(configData, format, {
          title: 'Expo Configuration',
          structuredContent: configData
        });
      } catch (error) {
        if (error instanceof ExpoError) {
          return formatErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // expo_prebuild - Generate native directories
  server.registerTool(
    'expo_prebuild',
    {
      title: 'Generate Native Project Directories',
      description: `Generate native iOS and Android project directories for customization.

This tool runs "prebuild" which generates native project folders (ios/ and android/) from
your app.json configuration and config plugins. This is necessary when you need to:
- Add custom native code
- Modify native project files
- Use libraries requiring manual linking
- Debug native build issues

**When to use:**
- Need to add custom native code
- Library requires manual native configuration
- Debugging native build issues
- Migrating from bare workflow

**Important:** Generated folders should generally be gitignored and regenerated as needed,
unless you're committing native code modifications.

**Example usage:**
- Generate both platforms: (use defaults)
- Clean regenerate: clean=true
- Specific platform: platform="ios"

**Returns:** Success message indicating which platforms were generated.

**Errors:**
- Invalid configuration
- Missing dependencies
- Platform-specific errors`,
      inputSchema: z.object({
        projectPath: z.string()
          .optional()
          .describe('Path to the Expo project. Default: current directory'),
        platform: z.enum(['ios', 'android', 'all'])
          .default('all')
          .describe('Platform to generate: "ios", "android", or "all". Default: "all"'),
        clean: z.boolean()
          .default(false)
          .describe('Delete existing native folders before generating. Default: false'),
        format: FormatSchema.default('markdown')
          .describe('Output format: "json" or "markdown"')
      }).strict(),
      outputSchema: z.object({
        success: z.boolean(),
        platforms: z.array(z.string()),
        message: z.string()
      })
    },
    {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    },
    async ({ projectPath, platform, clean, format }) => {
      try {
        const args = ['prebuild'];

        if (platform !== 'all') {
          args.push('--platform', platform);
        }

        if (clean) {
          args.push('--clean');
        }

        const output = await executeExpoCommand(args, config, projectPath);

        const platforms = platform === 'all' ? ['ios', 'android'] : [platform];
        const result = {
          success: true,
          platforms,
          message: `Native project directories generated for: ${platforms.join(', ')}`
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
