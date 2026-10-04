# Advanced setup and troubleshooting

[Back to the quick start](../README.md) | [简体中文](advanced.zh-CN.md)

## Automatic Node setup

The launchers reuse Node.js 22+ when available; otherwise they download pinned Node.js 22.23.3 from nodejs.org, verify SHA-256 against the bundled official checksums, and save a private per-user runtime. No administrator access or system PATH change is required. Internet access and a supported OS are required. Runtime: macOS `~/Library/Application Support/akashmahedy/tencent-docs/runtime`, Windows `%LOCALAPPDATA%/akashmahedy/tencent-docs/runtime`, Linux `${XDG_DATA_HOME:-~/.local/share}/akashmahedy/tencent-docs/runtime`. Linux needs bash, curl, tar and shasum/sha256sum. Once prepared, the `node setup.mjs` commands below can be run using the cached Node executable, or pass the same flags to the launcher.

## Updating

Keep the extracted repository in a stable folder: it is the local marketplace source. To update, extract the latest release into that folder and run the setup launcher again. Git users can pull the latest changes and rerun the launcher. Saved credentials are reused.

The wizard installs and checks the plugin using the Codex CLI. It does not overwrite your whole Codex configuration or edit Tencent documents during setup. Setup pins the installed plugin to the Node executable it prepared. If Codex cannot report the installed plugin location, setup asks you to update Codex rather than reporting success.

## Repository guide

- `setup.mjs`, `setup.command`, `setup.cmd`: setup entry points.
- `plugins/tencent-docs/`: the plugin, local bridge and credential storage.
- `docs/`: website and detailed guides.
- `tests/`, `scripts/`, `.github/`: development checks.

## Add the GitHub marketplace manually

```bash
codex plugin marketplace add akashmahedy/Tencent-Docs-Plugin-for-AI-Agent
codex plugin add tencent-docs@akashmahedy-plugins
```

Then download or clone the repository and run the wizard with `--skip-install` to configure your token and check the connection. If the plugin is unavailable in a client, use a current desktop/CLI release supporting repository marketplaces. A repository marketplace does not place this plugin in OpenAI's public Plugins Directory.

## Examples

- "Find my Tencent Docs document named Weekly Report and summarize it."
- "Create a standard spreadsheet with these columns and rows."
- "Append these rows to this specific Tencent Docs spreadsheet."

The plugin includes guidance to distinguish standard spreadsheets from SmartSheets and to resolve the exact document before editing. Operations run under your own Tencent permissions. Review writes before allowing them.

## Check, replace token and uninstall

From the repository folder on macOS/Linux (on Windows, use `setup.cmd` with the same flags):

```bash
bash setup.command --check --lang=en
bash setup.command --replace-token --skip-install --lang=en
bash setup.command --uninstall --lang=en
bash setup.command --forget-token --lang=en
```

Uninstall removes only `tencent-docs@akashmahedy-plugins`; an older personal installation is not removed. To stop all Tencent Docs access, disable/remove any older Tencent plugin too. Token deletion is separate so an accidental uninstall does not erase your saved login.

## Troubleshooting

| Symptom | What to do |
|---|---|
| Node not found | On Windows, use setup.cmd; on macOS/Linux, use setup.command to prepare Node automatically. |
| Broken or missing Codex CLI | Update Codex; use `--codex "/absolute/path/to/codex"` if needed. macOS desktop paths are detected automatically. |
| `400006` / authentication failed | Generate a valid token, then run `--replace-token --skip-install`. |
| `400007` / permission check failed | Check Tencent account/VIP eligibility on Tencent's own site. |
| No tools after setup | Restart Codex and open a new chat; enable the plugin. |
| Tencent connection fails | Check network access to `docs.qq.com`. No bypass service is included. |
| Two copies appear | Choose one installation; this release never removes your older personal plugin automatically. |

## Privacy and storage

No credentials are shipped. The token stays in **macOS Keychain** or in a **Windows DPAPI-encrypted file** owned by your user. On Linux, it is a private file (`600`, directory `700`); it is not encrypted by this plugin. Keep your OS account secure.

The local bridge sends the token directly to `https://docs.qq.com/openapi/mcp`. There is no maintainer-operated proxy, telemetry or analytics. Document requests/responses flow through Codex and Tencent; their policies also apply. See [Privacy](../PRIVACY.md).

## Compatibility and verification

Windows is the primary setup target, with macOS support, with a Linux terminal fallback. GitHub Actions runs transport, credential-storage and package checks on macOS, Windows and Linux. Isolated Codex CLI installation, macOS Keychain persistence, and live Tencent read-only authentication/tool discovery are verified on macOS. A fresh desktop chat and Windows desktop application are separate checks; CI results do not claim those were tested.

The bridge supports Tencent request/response MCP operations with JSON and SSE responses. It does not support unsolicited server-push, sampling or elicitation. It never automatically retries a document request after a timeout.

## Development and credit

```bash
npm test
npm run validate
```

No npm dependencies are needed. [Report a bug](https://github.com/akashmahedy/Tencent-Docs-Plugin-for-AI-Agent/issues) without tokens or private documents.

Plugin packaging, local bridge, setup and bilingual documentation: **akashmahedy**. Remote MCP service and Tencent Docs: **Tencent**. [MIT License](../LICENSE) applies to this repository's code; Tencent's service, brands and terms remain Tencent's.

Official references: [Codex plugin packaging](https://developers.openai.com/plugins/build/plugins), [Tencent MCP guide](https://developer.cloud.tencent.com/mcp/server/11803).
