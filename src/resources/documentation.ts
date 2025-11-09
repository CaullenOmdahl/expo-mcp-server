import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Documentation resources that link to official Expo and React Native documentation
 * These enable LLMs to access up-to-date documentation on-demand
 */

interface DocResource {
  uri: string;
  title: string;
  description: string;
  url: string;
  mimeType?: string;
}

const EXPO_DOCS: DocResource[] = [
  {
    uri: 'expo://docs/llms',
    title: 'Expo Documentation Index (LLM-optimized)',
    description: 'Complete Expo documentation in LLM-optimized format with all major topics and guides',
    url: 'https://docs.expo.dev/llms.txt',
    mimeType: 'text/plain'
  },
  {
    uri: 'expo://docs/eas-build',
    title: 'EAS Build Documentation',
    description: 'Complete guide to EAS Build - cloud-based app compilation and signing for iOS and Android',
    url: 'https://docs.expo.dev/build/introduction/'
  },
  {
    uri: 'expo://docs/eas-update',
    title: 'EAS Update Documentation',
    description: 'Guide to EAS Update - over-the-air updates for React Native apps',
    url: 'https://docs.expo.dev/eas-update/introduction/'
  },
  {
    uri: 'expo://docs/eas-submit',
    title: 'EAS Submit Documentation',
    description: 'Guide to EAS Submit - automated app store submission for iOS and Android',
    url: 'https://docs.expo.dev/submit/introduction/'
  },
  {
    uri: 'expo://docs/cli-reference',
    title: 'Expo CLI Reference',
    description: 'Complete reference for Expo CLI commands and options',
    url: 'https://docs.expo.dev/more/expo-cli/'
  },
  {
    uri: 'expo://docs/development-builds',
    title: 'Development Builds Guide',
    description: 'Creating and using development builds - custom native apps for development and testing',
    url: 'https://docs.expo.dev/develop/development-builds/introduction/'
  },
  {
    uri: 'expo://docs/programmatic-access',
    title: 'Programmatic Access Documentation',
    description: 'Guide to authentication and programmatic API access using access tokens',
    url: 'https://docs.expo.dev/accounts/programmatic-access/'
  },
  {
    uri: 'expo://docs/config-plugins',
    title: 'Config Plugins Documentation',
    description: 'Guide to Expo config plugins - extending and customizing native project configuration',
    url: 'https://docs.expo.dev/config-plugins/introduction/'
  },
  {
    uri: 'expo://docs/debugging',
    title: 'Debugging Guide',
    description: 'Comprehensive debugging guide for Expo apps - runtime issues, errors, and dev tools',
    url: 'https://docs.expo.dev/debugging/runtime-issues/'
  },
  {
    uri: 'expo://docs/eas',
    title: 'EAS Overview',
    description: 'Overview of Expo Application Services (EAS) - Build, Update, Submit, and more',
    url: 'https://docs.expo.dev/eas/'
  }
];

const REACT_NATIVE_DOCS: DocResource[] = [
  {
    uri: 'expo://docs/react-native/llms',
    title: 'React Native Documentation Index (LLM-optimized)',
    description: 'Complete React Native documentation in LLM-optimized format',
    url: 'https://reactnative.dev/llms.txt',
    mimeType: 'text/plain'
  },
  {
    uri: 'expo://docs/react-native/troubleshooting',
    title: 'React Native Troubleshooting',
    description: 'Common React Native issues and solutions',
    url: 'https://reactnative.dev/docs/troubleshooting'
  },
  {
    uri: 'expo://docs/react-native/debugging',
    title: 'React Native Debugging',
    description: 'Guide to debugging React Native applications',
    url: 'https://reactnative.dev/docs/debugging'
  }
];

/**
 * Registers all documentation resources with the MCP server
 */
export function registerDocumentationResources(server: McpServer): void {
  // Register Expo documentation resources
  for (const doc of EXPO_DOCS) {
    server.registerResource(
      extractResourceName(doc.uri),
      doc.uri,
      {
        title: doc.title,
        description: doc.description,
        mimeType: doc.mimeType || 'text/html'
      },
      async (uri) => ({
        contents: [{
          uri: doc.url,
          mimeType: doc.mimeType || 'text/html'
        }]
      })
    );
  }

  // Register React Native documentation resources
  for (const doc of REACT_NATIVE_DOCS) {
    server.registerResource(
      extractResourceName(doc.uri),
      doc.uri,
      {
        title: doc.title,
        description: doc.description,
        mimeType: doc.mimeType || 'text/html'
      },
      async (uri) => ({
        contents: [{
          uri: doc.url,
          mimeType: doc.mimeType || 'text/html'
        }]
      })
    );
  }
}

/**
 * Extracts a clean resource name from a URI
 */
function extractResourceName(uri: string): string {
  return uri.replace('expo://docs/', '').replace(/\//g, '-');
}
