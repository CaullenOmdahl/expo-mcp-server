/**
 * Converts CLI errors into actionable, LLM-friendly error messages
 * with suggestions for next steps and documentation links
 */

interface ErrorContext {
  command: string;
  stderr?: string;
  exitCode?: number;
}

export class ExpoError extends Error {
  constructor(
    message: string,
    public readonly context?: ErrorContext,
    public readonly docResource?: string
  ) {
    super(message);
    this.name = 'ExpoError';
  }
}

export function handleCliError(error: any, command: string): ExpoError {
  const stderr = error.stderr || error.message || '';
  const exitCode = error.exitCode;

  // Authentication errors
  if (stderr.includes('EXPO_TOKEN') || stderr.includes('not logged in') || stderr.includes('unauthorized')) {
    return new ExpoError(
      'Authentication required. Please set the EXPO_TOKEN environment variable with a valid Expo access token.\n\n' +
      'To create an access token:\n' +
      '1. Visit https://expo.dev/settings/access-tokens\n' +
      '2. Create a new token\n' +
      '3. Set it as EXPO_TOKEN environment variable or configure it in the server config\n\n' +
      'For more information, see the programmatic access documentation.',
      { command, stderr, exitCode },
      'expo://docs/programmatic-access'
    );
  }

  // Build errors
  if (command.includes('eas build') && stderr.includes('failed')) {
    return new ExpoError(
      'Build failed. Check the error details below and review the EAS Build documentation for troubleshooting.\n\n' +
      `Error: ${stderr}\n\n` +
      'Common issues:\n' +
      '- Missing or invalid credentials\n' +
      '- Configuration errors in eas.json\n' +
      '- Native build errors (check build logs)\n' +
      '- Insufficient resources or quota',
      { command, stderr, exitCode },
      'expo://docs/eas-build'
    );
  }

  // Configuration errors
  if (stderr.includes('app.json') || stderr.includes('app.config')) {
    return new ExpoError(
      'Configuration error detected. Please check your app.json or app.config.js file.\n\n' +
      `Error: ${stderr}\n\n` +
      'Review the configuration documentation for proper format and required fields.',
      { command, stderr, exitCode },
      'expo://docs/config-plugins'
    );
  }

  // React Native errors
  if (stderr.includes('React Native') || stderr.includes('metro') || stderr.includes('bundler')) {
    return new ExpoError(
      'React Native build or bundler error. Check the error details and review React Native troubleshooting.\n\n' +
      `Error: ${stderr}`,
      { command, stderr, exitCode },
      'expo://docs/react-native/troubleshooting'
    );
  }

  // Network/connectivity errors
  if (stderr.includes('ECONNREFUSED') || stderr.includes('ETIMEDOUT') || stderr.includes('network')) {
    return new ExpoError(
      'Network error occurred. Please check your internet connection and try again.\n\n' +
      `Error: ${stderr}`,
      { command, stderr, exitCode }
    );
  }

  // Generic error
  return new ExpoError(
    `Command failed: ${command}\n\n${stderr}`,
    { command, stderr, exitCode }
  );
}

export function formatErrorResponse(error: ExpoError): {
  content: Array<{ type: string; text: string }>;
  isError: boolean;
} {
  let errorMessage = error.message;

  if (error.docResource) {
    errorMessage += `\n\nRelevant documentation: ${error.docResource}`;
  }

  return {
    content: [{ type: 'text', text: errorMessage }],
    isError: true
  };
}
