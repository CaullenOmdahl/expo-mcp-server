import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

/**
 * Registers workflow prompts with the MCP server
 * These prompts help users accomplish common Expo development tasks
 */
export function registerWorkflowPrompts(server: McpServer): void {

  // Create and deploy app workflow
  server.registerPrompt(
    'create-and-deploy-app',
    {
      title: 'Create and Deploy Expo App',
      description: 'Complete workflow for creating a new Expo app and deploying it to app stores',
      argsSchema: {
        appName: z.string()
          .describe('Name of the app to create'),
        platform: z.enum(['ios', 'android', 'both'])
          .default('both')
          .describe('Target platform(s)')
      }
    },
    ({ appName, platform }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `I want to create and deploy a new Expo app named "${appName}" for ${platform === 'both' ? 'both iOS and Android' : platform}.

Please help me with the following steps:

1. Create a new Expo project with TypeScript template
2. Set up the project configuration (app.json)
3. Run diagnostics to ensure everything is set up correctly
4. Create production builds for ${platform === 'both' ? 'both platforms' : platform}
5. Submit the builds to the app stores

Before starting, verify I'm authenticated with expo_whoami.

For each step, explain what you're doing and wait for my confirmation before proceeding to the next step.`
          }
        }
      ]
    })
  );

  // Deploy update workflow
  server.registerPrompt(
    'deploy-ota-update',
    {
      title: 'Deploy Over-the-Air Update',
      description: 'Publish an OTA update to fix bugs or add features without app store review',
      argsSchema: {
        branch: z.string()
          .default('production')
          .describe('Branch to publish update to'),
        description: z.string()
          .describe('Description of what this update contains')
      }
    },
    ({ branch, description }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `I need to publish an over-the-air update to the "${branch}" branch.

Update description: ${description}

Please help me:
1. Verify I'm in an Expo project and authenticated
2. Show me recent updates on the "${branch}" branch
3. Publish the update with the description provided
4. Confirm the update was published successfully

Explain each step as we go.`
          }
        }
      ]
    })
  );

  // Troubleshoot build workflow
  server.registerPrompt(
    'troubleshoot-build',
    {
      title: 'Troubleshoot Build Issues',
      description: 'Debug and fix common build problems',
      argsSchema: {
        buildId: z.string()
          .optional()
          .describe('Build ID to investigate (optional)')
      }
    },
    ({ buildId }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: buildId
              ? `I'm having issues with build ${buildId}.

Please help me:
1. Check the build status and details
2. If it failed, analyze the error logs
3. Run project diagnostics (expo_doctor)
4. Suggest specific fixes based on the errors found
5. Point me to relevant documentation`
              : `I'm experiencing build failures.

Please help me:
1. Show my recent builds and their statuses
2. Run project diagnostics (expo_doctor)
3. Check my project configuration
4. Identify common issues (dependencies, SDK version, etc.)
5. Suggest fixes and relevant documentation`
          }
        }
      ]
    })
  );

  // Setup CI/CD workflow
  server.registerPrompt(
    'setup-cicd',
    {
      title: 'Set Up CI/CD Pipeline',
      description: 'Guide for setting up automated builds and deployments',
      argsSchema: {
        platform: z.enum(['github-actions', 'gitlab-ci', 'other'])
          .default('github-actions')
          .describe('CI/CD platform to use')
      }
    },
    ({ platform }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `I want to set up automated builds and deployments using ${platform}.

Please guide me through:
1. Getting my project information and configuration
2. Explaining what environment variables I need (EXPO_TOKEN, etc.)
3. Providing example commands for automated builds
4. Explaining how to automate OTA updates
5. Showing how to automate app store submissions
6. Pointing me to relevant CI/CD documentation

Let's go step by step.`
          }
        }
      ]
    })
  );

  // Check project health workflow
  server.registerPrompt(
    'check-project-health',
    {
      title: 'Check Project Health',
      description: 'Run comprehensive checks on your Expo project',
      argsSchema: {}
    },
    () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please perform a comprehensive health check on my Expo project:

1. Verify authentication status
2. Check project configuration
3. Run project diagnostics (expo_doctor)
4. Review recent builds and their statuses
5. Check for recent updates
6. Summarize any issues found and suggest fixes

Provide a clear summary at the end.`
          }
        }
      ]
    })
  );
}
