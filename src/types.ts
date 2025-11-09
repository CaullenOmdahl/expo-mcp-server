import { z } from 'zod';

// Configuration schema for the MCP server
export const configSchema = z.object({
  expoToken: z.string().optional()
    .describe("Expo access token for authentication (can also use EXPO_TOKEN env var)"),
  defaultFormat: z.enum(["json", "markdown"]).default("markdown")
    .describe("Default output format for tool responses")
});

export type ExpoServerConfig = z.infer<typeof configSchema>;

// Common schemas used across tools
export const PlatformSchema = z.enum(['ios', 'android', 'all']);
export const BuildProfileSchema = z.enum(['development', 'preview', 'production']);
export const FormatSchema = z.enum(['json', 'markdown']);
export const DetailLevelSchema = z.enum(['concise', 'detailed']);

export type Platform = z.infer<typeof PlatformSchema>;
export type BuildProfile = z.infer<typeof BuildProfileSchema>;
export type Format = z.infer<typeof FormatSchema>;
export type DetailLevel = z.infer<typeof DetailLevelSchema>;

// Constants
export const CHARACTER_LIMIT = 25000;
