# Tencent Docs for Codex · 腾讯文档

Use Tencent Docs inside Codex: find documents, summarize them, and work with spreadsheets.

**Created by [akashmahedy](https://github.com/akashmahedy).** Community plugin using Tencent's official MCP service.

[简体中文](README.zh-CN.md) · **[Download](https://github.com/akashmahedy/Tencent-Docs-Plugin-for-AI-Agent/releases/latest)** · [Website](https://akashmahedy.github.io/Tencent-Docs-Plugin-for-AI-Agent/)

## Install in 3 steps

You need Codex with plugin support and a Tencent Docs account. The launcher prepares Node.js automatically if needed. Some Tencent features may require VIP access.

1. **Download and extract** the plugin ZIP from [Releases](https://github.com/akashmahedy/Tencent-Docs-Plugin-for-AI-Agent/releases/latest). Keep the folder in a stable location.
2. **Open the setup launcher:** `setup.command` on macOS or `setup.cmd` on Windows. On Linux, or if macOS blocks the launcher, open a terminal in the extracted folder and run:

   ```sh
   bash setup.command
   ```

   Choose English or 简体中文. No separate Node installation is needed; internet access is required for the first download.

3. **Connect your account.** Get your token from [Tencent](https://docs.qq.com/open/auth/mcp.html) and paste it into the wizard's hidden terminal prompt. When setup succeeds, restart Codex, open a new chat and enable the plugin.

The wizard installs the plugin, saves your token locally and checks the connection. **Never paste a token into chat or GitHub.**

## Prefer asking Codex to install it?

Use the copy icon at the top-right of this block, then paste it into Codex:

```text
Install https://github.com/akashmahedy/Tencent-Docs-Plugin-for-AI-Agent. Follow START_HERE_FOR_CODEX.md. Do not assume Node.js is installed. On a fresh computer, use setup.command on macOS/Linux or setup.cmd on Windows first; the launcher downloads and verifies Node.js automatically when it is missing or too old. Do not run node setup.mjs before Node is ready. Use an interactive terminal so I can enter my Tencent token privately.
```

## Try it

- “Find my Weekly Report and summarize it.”
- “Create a spreadsheet from these rows.”
- “Append these rows to this specific spreadsheet.”

## Need help?

[Setup, updates and troubleshooting](docs/advanced.en.md) · [Report an issue](https://github.com/akashmahedy/Tencent-Docs-Plugin-for-AI-Agent/issues)

Your token stays on your computer and is sent directly to Tencent. No maintainer proxy or telemetry. [Privacy details](PRIVACY.md).

[MIT License](LICENSE) · Maintained by **akashmahedy** · Independent community plugin; not an official Tencent or OpenAI product.
