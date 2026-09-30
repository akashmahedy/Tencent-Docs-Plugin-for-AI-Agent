# Tencent Docs for Codex · 腾讯文档 Codex 插件

[English](README.md) | [简体中文](README.zh-CN.md) · [Documentation](https://akashmahedy.github.io/tencent-docs-codex-plugin/) · [Download](https://github.com/akashmahedy/tencent-docs-codex-plugin/releases/latest)

**Created and maintained by [akashmahedy](https://github.com/akashmahedy).** A community Codex plugin that connects to Tencent's official Tencent Docs MCP service. This plugin is independently maintained and is not an official Tencent or OpenAI product.

Search, read, create and edit supported Tencent Docs documents and spreadsheets from Codex. The live Tencent tool inventory determines which operations your account can use.

## Quick setup

Requires a current Codex desktop app or CLI supporting `codex plugin`, Node.js **22+**, and your own Tencent Docs account/token. Install Node from [nodejs.org](https://nodejs.org/) if it is missing. Tencent may require an eligible VIP plan for some operations. Internet access to Tencent is required.

1. Download the latest **tencent-docs-codex-plugin-1.1.0.zip** from [Releases](https://github.com/akashmahedy/tencent-docs-codex-plugin/releases/latest), then extract the entire ZIP.
2. Open a terminal in the extracted folder and run:

   ```bash
   node plugins/tencent-docs/scripts/setup.mjs --lang=en
   ```

   On macOS you may also run `bash setup.command`; on Windows double-click `setup.cmd`. If macOS blocks a downloaded launcher, use the terminal command above after reviewing the source.

3. Get a personal token from [Tencent's token page](https://docs.qq.com/open/auth/mcp.html), paste it into the installer's **hidden terminal prompt**, and restart Codex. Start a new chat.

The wizard locates a working CLI (including the macOS desktop application's bundled CLI), registers this marketplace, installs the plugin, checks authentication/tool discovery, and saves your token locally. It calls only initialization, tool discovery and `get_user_info` when available; setup does not create or edit documents. A failed check does not save a newly entered token. Existing Codex configuration is managed through its CLI, not overwritten.

If using a Git clone, keep the checkout in place because it is your local marketplace source. Updates: download/extract a new release into a stable folder and rerun setup. If a CLI cannot report the installed plugin location, Node must be available on Codex's PATH.

## Let Codex help you install

Give Codex the repository link and this prompt. **Do not include your token in the message.**

> Install akashmahedy's Tencent Docs plugin from https://github.com/akashmahedy/tencent-docs-codex-plugin. Read START_HERE_FOR_CODEX.md and inspect the setup scripts. Run the setup wizard in an interactive terminal so I can enter my token privately. Check the connection and tell me when to restart Codex.

## Add the GitHub marketplace manually

```bash
codex plugin marketplace add akashmahedy/tencent-docs-codex-plugin
codex plugin add tencent-docs@akashmahedy-plugins
```

Then download or clone the repository and run the wizard with `--skip-install` to configure your token and check the connection. If the plugin is unavailable in a client, use a current desktop/CLI release supporting repository marketplaces. A repository marketplace does not place this plugin in OpenAI's public Plugins Directory.

## Examples

- "Find my Tencent Docs document named Weekly Report and summarize it."
- "Create a standard spreadsheet with these columns and rows."
- "Append these rows to this specific Tencent Docs spreadsheet."

The plugin includes guidance to distinguish standard spreadsheets from SmartSheets and to resolve the exact document before editing. Operations run under your own Tencent permissions. Review writes before allowing them.

## Check, replace token and uninstall

From the repository folder:

```bash
node plugins/tencent-docs/scripts/setup.mjs --check --lang=en
node plugins/tencent-docs/scripts/setup.mjs --replace-token --skip-install --lang=en
node plugins/tencent-docs/scripts/setup.mjs --uninstall --lang=en
node plugins/tencent-docs/scripts/setup.mjs --forget-token --lang=en
```

Uninstall removes only `tencent-docs@akashmahedy-plugins`; an older personal installation is not removed. To stop all Tencent Docs access, disable/remove any older Tencent plugin too. Token deletion is separate so an accidental uninstall does not erase your saved login.

## Troubleshooting

| Symptom | What to do |
|---|---|
| Node not found | Install Node.js 22+ and reopen the terminal. |
| Broken or missing Codex CLI | Update Codex; use `--codex "/absolute/path/to/codex"` if needed. macOS desktop paths are detected automatically. |
| `400006` / authentication failed | Generate a valid token, then run `--replace-token --skip-install`. |
| `400007` / permission check failed | Check Tencent account/VIP eligibility on Tencent's own site. |
| No tools after setup | Restart Codex and open a new chat; enable the plugin. |
| Tencent connection fails | Check network access to `docs.qq.com`. No bypass service is included. |
| Two copies appear | Choose one installation; this release never removes your older personal plugin automatically. |

## Privacy and storage

No credentials are shipped. The token stays in **macOS Keychain** or in a **Windows DPAPI-encrypted file** owned by your user. On Linux, it is a private file (`600`, directory `700`); it is not encrypted by this plugin. Keep your OS account secure.

The local bridge sends the token directly to `https://docs.qq.com/openapi/mcp`. There is no maintainer-operated proxy, telemetry or analytics. Document requests/responses flow through Codex and Tencent; their policies also apply. See [Privacy](PRIVACY.md).

## Compatibility and verification

Node 22+; macOS and Windows are primary setup targets, with a Linux terminal fallback. GitHub Actions runs transport, credential-storage and package checks on macOS, Windows and Linux. Isolated Codex CLI installation, macOS Keychain persistence, and live Tencent read-only authentication/tool discovery are verified on macOS. A fresh desktop chat and Windows desktop application are separate checks; CI results do not claim those were tested.

The bridge supports Tencent request/response MCP operations with JSON and SSE responses. It does not support unsolicited server-push, sampling or elicitation. It never automatically retries a document request after a timeout.

## Development and credit

```bash
npm test
npm run validate
```

No npm dependencies are needed. [Report a bug](https://github.com/akashmahedy/tencent-docs-codex-plugin/issues) without tokens or private documents.

Plugin packaging, local bridge, setup and bilingual documentation: **akashmahedy**. Remote MCP service and Tencent Docs: **Tencent**. [MIT License](LICENSE) applies to this repository's code; Tencent's service, brands and terms remain Tencent's.

Official references: [Codex plugin packaging](https://developers.openai.com/plugins/build/plugins), [Tencent MCP guide](https://developer.cloud.tencent.com/mcp/server/11803).
