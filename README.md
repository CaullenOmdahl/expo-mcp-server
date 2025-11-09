# Expo MCP Server

Model Context Protocol (MCP) server for Expo.dev that enables programmatic interaction with Expo projects and EAS (Expo Application Services).

## Overview

This MCP server provides comprehensive tools for managing Expo/React Native projects, including:

- **Project Management**: Initialize projects, install packages, configure apps
- **Development Workflow**: Run diagnostics and health checks
- **EAS Build**: Create, monitor, and manage cloud builds for iOS and Android
- **EAS Update**: Publish over-the-air updates and manage update channels
- **EAS Submit**: Submit builds to App Store and Google Play
- **Documentation Access**: Direct links to official Expo and React Native documentation

## Features

### Tools

**Project Management:**
- `expo_init_project` - Create new Expo projects with templates
- `expo_install_packages` - Install packages with automatic version validation
- `expo_get_config` - View and validate app configuration
- `expo_prebuild` - Generate native iOS/Android project directories

**Development:**
- `expo_doctor` - Run comprehensive project diagnostics

**EAS Build:**
- `eas_build_create` - Trigger cloud builds for iOS, Android, or both
- `eas_build_list` - List recent builds with filtering
- `eas_build_status` - Get detailed build status and logs
- `eas_build_cancel` - Cancel in-progress builds

**EAS Update (OTA):**
- `eas_update_publish` - Publish over-the-air updates to branches/channels
- `eas_update_list` - List published updates
- `eas_channel_create` - Create update channels for distribution

**EAS Submit:**
- `eas_submit_ios` - Submit iOS builds to App Store Connect/TestFlight
- `eas_submit_android` - Submit Android builds to Google Play Console

**Information:**
- `expo_whoami` - Check authentication status
- `eas_project_info` - Get EAS project configuration and metadata

### Resources

The server exposes documentation resources that link to official Expo and React Native docs:

**Expo Documentation:**
- `expo://docs/llms` - Complete Expo documentation (LLM-optimized)
- `expo://docs/eas-build` - EAS Build guide
- `expo://docs/eas-update` - EAS Update guide
- `expo://docs/eas-submit` - EAS Submit guide
- `expo://docs/cli-reference` - Expo CLI reference
- `expo://docs/development-builds` - Development builds guide
- `expo://docs/programmatic-access` - Authentication and API access
- `expo://docs/config-plugins` - Config plugins guide
- `expo://docs/debugging` - Debugging guide

**React Native Documentation:**
- `expo://docs/react-native/llms` - React Native docs (LLM-optimized)
- `expo://docs/react-native/troubleshooting` - Troubleshooting guide
- `expo://docs/react-native/debugging` - Debugging guide

## Installation

### Using Smithery (Recommended)

```bash
npx @smithery/cli install expo-mcp-server
```

### From Source

```bash
git clone <repository-url>
cd expo-mcp-server
npm install
npm run build
```

## Configuration

### Authentication

The server requires an Expo access token for EAS operations. You can provide it in two ways:

1. **Environment Variable** (recommended):
```bash
export EXPO_TOKEN=your_token_here
```

2. **Server Configuration**:
```json
{
  "expoToken": "your_token_here",
  "defaultFormat": "markdown"
}
```

To create an access token:
1. Visit https://expo.dev/settings/access-tokens
2. Create a new token
3. Set it as `EXPO_TOKEN` environment variable

### MCP Client Configuration

Add to your MCP client settings (e.g., Claude Code):

```json
{
  "mcpServers": {
    "expo-dev": {
      "command": "npx",
      "args": ["-y", "expo-mcp-server"],
      "env": {
        "EXPO_TOKEN": "your_token_here"
      }
    }
  }
}
```

## Usage Examples

### Create a New Expo Project

```typescript
// Use the expo_init_project tool
{
  "projectName": "my-awesome-app",
  "template": "blank-typescript",
  "format": "markdown"
}
```

### Trigger a Production Build

```typescript
// Use the eas_build_create tool
{
  "platform": "all",
  "profile": "production",
  "format": "markdown"
}
```

### Publish an OTA Update

```typescript
// Use the eas_update_publish tool
{
  "branch": "production",
  "message": "Fix critical authentication bug",
  "format": "markdown"
}
```

### Check Build Status

```typescript
// Use the eas_build_status tool
{
  "buildId": "abc-123-def-456",
  "format": "markdown"
}
```

## Output Formats

All tools support two output formats:

- **`markdown`** (default): Human-readable tables and formatted text
- **`json`**: Structured data for programmatic processing

## Error Handling

The server provides actionable error messages with:
- Clear descriptions of what went wrong
- Suggested next steps for resolution
- Links to relevant documentation resources
- Context-specific troubleshooting guidance

Common errors include:
- **Authentication errors**: Points to programmatic access documentation
- **Build failures**: Links to EAS Build troubleshooting
- **Configuration errors**: Suggests config validation steps
- **React Native errors**: Links to RN troubleshooting guides

## Requirements

- **Node.js**: 18.0.0 or higher
- **Expo Account**: Required for EAS operations
- **Access Token**: For programmatic API access

## Development

```bash
# Install dependencies
npm install

# Build the server
npm run build

# Run in development mode with Smithery playground
npm run dev
```

## Architecture

The server is built with:
- **TypeScript**: Type-safe implementation
- **MCP SDK**: Official Model Context Protocol SDK
- **Zod**: Runtime schema validation
- **execa**: CLI command execution

### Project Structure

```
src/
├── index.ts              # Main server entry point
├── types.ts              # Shared types and schemas
├── resources/
│   └── documentation.ts  # Documentation resource registrations
├── tools/
│   ├── project.ts        # Project management tools
│   ├── development.ts    # Development workflow tools
│   ├── build.ts          # EAS Build tools
│   ├── update.ts         # EAS Update tools
│   ├── submit.ts         # EAS Submit tools
│   └── info.ts           # Information tools
└── utils/
    ├── cli.ts            # CLI execution utilities
    ├── format.ts         # Response formatting
    ├── parse.ts          # Output parsing
    └── errors.ts         # Error handling
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Documentation](https://docs.expo.dev/eas/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Smithery Registry](https://smithery.ai/)

## Support

For issues and questions:
- GitHub Issues: [Create an issue]
- Expo Forums: https://forums.expo.dev/
- Expo Discord: https://chat.expo.dev/
