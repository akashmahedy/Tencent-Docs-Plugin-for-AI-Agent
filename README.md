# Tencent Docs for Codex · 腾讯文档

Use Tencent Docs inside Codex: find documents, summarize them, and work with spreadsheets.

**Created by [akashmahedy](https://github.com/akashmahedy).** Community plugin using Tencent's official MCP service.

[简体中文](README.zh-CN.md) · **[Download](https://github.com/akashmahedy/tencent-docs-codex-plugin/releases/latest)** · [Website](https://akashmahedy.github.io/tencent-docs-codex-plugin/)

## Install in 3 steps

You need Codex with plugin support, [Node.js 22+](https://nodejs.org/), and a Tencent Docs account. Some Tencent features may require VIP access.

1. **Download and extract** the plugin ZIP from [Releases](https://github.com/akashmahedy/tencent-docs-codex-plugin/releases/latest). Keep the folder in a stable location.
2. **Open a terminal in that folder** and run:

   ```sh
   node setup.mjs
   ```

   Choose English or 简体中文. You can also open `setup.command` on macOS or `setup.cmd` on Windows. If macOS blocks the downloaded launcher, use the terminal command above after reviewing the source.

3. **Connect your account.** Get your token from [Tencent](https://docs.qq.com/open/auth/mcp.html) and paste it into the wizard's hidden terminal prompt. When setup succeeds, restart Codex, open a new chat and enable the plugin.

The wizard installs the plugin, saves your token locally and checks the connection. **Never paste a token into chat or GitHub.**

## Prefer asking Codex to install it?

Copy this into Codex:

> Install https://github.com/akashmahedy/tencent-docs-codex-plugin. Follow START_HERE_FOR_CODEX.md and run node setup.mjs in an interactive terminal so I can enter my token privately.

## Try it

- “Find my Weekly Report and summarize it.”
- “Create a spreadsheet from these rows.”
- “Append these rows to this specific spreadsheet.”

## Need help?

[Setup, updates and troubleshooting](docs/advanced.en.md) · [Report an issue](https://github.com/akashmahedy/tencent-docs-codex-plugin/issues)

Your token stays on your computer and is sent directly to Tencent. No maintainer proxy or telemetry. [Privacy details](PRIVACY.md).

[MIT License](LICENSE) · Maintained by **akashmahedy** · Independent community plugin; not an official Tencent or OpenAI product.
