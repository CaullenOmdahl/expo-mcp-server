#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { configSchema, type ExpoServerConfig } from './types.js';
import { registerDocumentationResources } from './resources/documentation.js';
import { registerProjectTools } from './tools/project.js';
import { registerDevelopmentTools } from './tools/development.js';
import { registerBuildTools } from './tools/build.js';
import { registerUpdateTools } from './tools/update.js';
import { registerSubmitTools } from './tools/submit.js';
import { registerInfoTools } from './tools/info.js';
import { registerWorkflowPrompts } from './prompts/workflows.js';

/**
 * Creates and configures the Expo MCP server
 */
export default function createServer(config?: ExpoServerConfig) {
  const server = new McpServer({
    name: 'expo-dev',
    version: '1.0.0'
  });

  // Register documentation resources
  registerDocumentationResources(server);

  // Register workflow prompts
  registerWorkflowPrompts(server);

  // Register all tool categories
  registerProjectTools(server, config);
  registerDevelopmentTools(server, config);
  registerBuildTools(server, config);
  registerUpdateTools(server, config);
  registerSubmitTools(server, config);
  registerInfoTools(server, config);

  return server;
}

/**
 * Export the config schema for Smithery
 */
export { configSchema };

/**
 * Export stateless flag for Smithery
 * This server is stateless - each request is independent
 */
export const stateless = true;

/**
 * Main entry point when run as a standalone server
 */
async function main() {
  // Create the server with config from environment
  const config: ExpoServerConfig = {
    expoToken: process.env.EXPO_TOKEN,
    defaultFormat: 'markdown'
  };

  const server = createServer(config);

  // Connect to stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log server start (to stderr so it doesn't interfere with stdio)
  console.error('Expo MCP Server running on stdio');
  console.error('Available tools:');
  console.error('  - Project Management: expo_init_project, expo_install_packages, expo_get_config, expo_prebuild');
  console.error('  - Development: expo_doctor');
  console.error('  - EAS Build: eas_build_create, eas_build_list, eas_build_status, eas_build_cancel');
  console.error('  - EAS Update: eas_update_publish, eas_update_list, eas_channel_create');
  console.error('  - EAS Submit: eas_submit_ios, eas_submit_android');
  console.error('  - Info: expo_whoami, eas_project_info');
  console.error('\nWorkflow prompts:');
  console.error('  - create-and-deploy-app: Complete app creation and deployment workflow');
  console.error('  - deploy-ota-update: Publish over-the-air updates');
  console.error('  - troubleshoot-build: Debug build issues');
  console.error('  - setup-cicd: Set up CI/CD pipeline');
  console.error('  - check-project-health: Comprehensive project health check');
  console.error('\nDocumentation resources available via expo://docs/* URIs');
}

// Run main if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
