import { execa } from 'execa';
import { ExpoServerConfig } from '../types.js';
import { handleCliError } from './errors.js';

/**
 * Executes Expo CLI commands with proper environment configuration
 */
export async function executeExpoCommand(
  args: string[],
  config?: ExpoServerConfig,
  cwd?: string
): Promise<string> {
  try {
    const env = { ...process.env };

    // Add EXPO_TOKEN if provided in config
    if (config?.expoToken) {
      env.EXPO_TOKEN = config.expoToken;
    }

    const result = await execa('npx', ['expo', ...args], {
      env,
      cwd: cwd || process.cwd(),
      shell: false
    });

    return result.stdout;
  } catch (error) {
    throw handleCliError(error, `npx expo ${args.join(' ')}`);
  }
}

/**
 * Executes EAS CLI commands with proper environment configuration
 */
export async function executeEasCommand(
  args: string[],
  config?: ExpoServerConfig,
  cwd?: string
): Promise<string> {
  try {
    const env = { ...process.env };

    // Add EXPO_TOKEN if provided in config
    if (config?.expoToken) {
      env.EXPO_TOKEN = config.expoToken;
    }

    const result = await execa('npx', ['eas-cli', ...args], {
      env,
      cwd: cwd || process.cwd(),
      shell: false
    });

    return result.stdout;
  } catch (error) {
    throw handleCliError(error, `npx eas-cli ${args.join(' ')}`);
  }
}

/**
 * Checks if a command is available in the system
 */
export async function checkCommandAvailable(command: string): Promise<boolean> {
  try {
    await execa('which', [command]);
    return true;
  } catch {
    return false;
  }
}
