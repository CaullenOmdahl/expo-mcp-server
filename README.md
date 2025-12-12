# Expo MCP Server

[![npm version](https://badge.fury.io/js/expo-mcp-server.svg)](https://badge.fury.io/js/expo-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io/)

**Model Context Protocol server for Expo.dev** — programmatically manage Expo projects and EAS services through AI assistants like Claude.

## What It Does

This MCP server gives AI assistants full control over Expo/React Native development workflows:

| Category | Capabilities |
|----------|-------------|
| **Project Setup** | Initialize projects, install packages, configure apps, generate native code |
| **Cloud Builds** | Trigger iOS/Android builds, monitor progress, view logs, cancel builds |
| **OTA Updates** | Publish updates to branches, manage channels, instant deployments |
| **App Submission** | Submit to App Store Connect and Google Play Console |
| **Diagnostics** | Run health checks, validate configurations |

## Quick Start

### Install via Smithery

```bash
npx @smithery/cli install expo-mcp-server
```

### Or Add to MCP Config

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

Get your token at [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens)

## Tools

### Project Management
- `expo_init_project` — Create new Expo projects with templates
- `expo_install_packages` — Install packages with version validation
- `expo_get_config` — View and validate app configuration
- `expo_prebuild` — Generate native iOS/Android directories

### EAS Build
- `eas_build_create` — Trigger cloud builds (iOS, Android, or both)
- `eas_build_list` — List builds with filtering
- `eas_build_status` — Get build status and logs
- `eas_build_cancel` — Cancel in-progress builds

### EAS Update (OTA)
- `eas_update_publish` — Publish over-the-air updates
- `eas_update_list` — List published updates
- `eas_channel_create` — Create update channels

### EAS Submit
- `eas_submit_ios` — Submit to App Store Connect/TestFlight
- `eas_submit_android` — Submit to Google Play Console

### Utilities
- `expo_doctor` — Run project diagnostics
- `expo_whoami` — Check authentication status
- `eas_project_info` — Get EAS project metadata

## Resources

The server exposes documentation as MCP resources:

```
expo://docs/llms           # Complete Expo docs (LLM-optimized)
expo://docs/eas-build      # EAS Build guide
expo://docs/eas-update     # EAS Update guide
expo://docs/eas-submit     # EAS Submit guide
expo://docs/cli-reference  # Expo CLI reference
```

## Example Workflows

**"Build my app for both platforms"**
```
→ eas_build_create(platform: "all", profile: "production")
```

**"Push a hotfix to production"**
```
→ eas_update_publish(branch: "production", message: "Fix auth bug")
```

**"Submit the latest build to TestFlight"**
```
→ eas_submit_ios(buildId: "abc-123")
```

## Output Formats

All tools support:
- **`markdown`** (default) — Human-readable tables
- **`json`** — Structured data for processing

## Development

```bash
git clone https://github.com/CaullenOmdahl/expo-mcp-server
cd expo-mcp-server
npm install
npm run build
npm run dev  # Run with Smithery playground
```

## Architecture

```
src/
├── index.ts              # Server entry point
├── types.ts              # Shared schemas
├── resources/            # Documentation resources
├── tools/                # Tool implementations
│   ├── project.ts        # Project management
│   ├── build.ts          # EAS Build
│   ├── update.ts         # EAS Update
│   └── submit.ts         # EAS Submit
└── utils/                # CLI execution, formatting
```

Built with TypeScript, MCP SDK, and Zod validation.

## Requirements

- Node.js 18+
- Expo account with access token

## Links

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Documentation](https://docs.expo.dev/eas/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Smithery Registry](https://smithery.ai/)

## License

MIT
