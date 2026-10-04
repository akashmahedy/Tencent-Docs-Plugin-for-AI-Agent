# 进阶安装与常见问题

[返回快速安装](../README.zh-CN.md) | [English](advanced.en.md)

## 自动准备 Node

启动器会复用已有的 Node.js 22+；否则从 nodejs.org 下载固定版本 Node.js 22.23.3，用发布包内的官方 SHA-256 校验值验证，再保存在本机用户专属目录。无需管理员权限，也不会修改系统 PATH。首次下载需要联网和受支持的系统。运行时位置：macOS `~/Library/Application Support/akashmahedy/tencent-docs/runtime`，Windows `%LOCALAPPDATA%/akashmahedy/tencent-docs/runtime`，Linux `${XDG_DATA_HOME:-~/.local/share}/akashmahedy/tencent-docs/runtime`。Linux 需要 bash、curl、tar 和 shasum/sha256sum。下方 `node setup.mjs` 的参数也可以传给安装启动器，无需系统安装 Node。

## 更新

请将解压目录保存在固定位置，它是本地插件市场的数据源。更新时，将最新发布包解压到该目录，再运行安装启动器。使用 Git 时，可拉取最新版本后重新运行启动器。已有凭据会被复用。

向导通过 Codex CLI 安装和检查插件，不会整体覆盖已有 Codex 配置，也不会在安装过程中编辑腾讯文档。如果 CLI 无法报告安装路径，Codex 的 PATH 中需提供 Node。

## 仓库目录

- `setup.mjs`、`setup.command`、`setup.cmd`：安装入口。
- `plugins/tencent-docs/`：插件、本机桥接及凭据存储。
- `docs/`：网站与详细说明。
- `tests/`、`scripts/`、`.github/`：开发检查。

## 手动添加 GitHub 插件市场

```bash
codex plugin marketplace add akashmahedy/Tencent-Docs-Plugin-for-AI-Agent
codex plugin add tencent-docs@akashmahedy-plugins
```

然后下载或克隆仓库，运行带 `--skip-install` 的安装向导来配置令牌和检查连接。如果当前客户端不支持该插件，请更新到支持仓库市场的桌面或 CLI 版本。仓库市场不会自动把插件上架到 OpenAI 公共插件目录。

## 使用示例

- “查找名为‘周报’的腾讯文档，并总结主要内容。”
- “用这些列名和数据创建一个普通电子表格。”
- “将这些数据行追加到这份指定的腾讯文档表格。”

插件会区分普通电子表格与智能表，并在编辑前确认准确的目标文档。所有操作受您自己的腾讯权限约束；请在授权写入前查看操作内容。

## 检查连接、更换令牌和卸载

在仓库目录运行（macOS/Linux；Windows 使用 `setup.cmd`，参数相同）：

```bash
bash setup.command --check --lang=zh
bash setup.command --replace-token --skip-install --lang=zh
bash setup.command --uninstall --lang=zh
bash setup.command --forget-token --lang=zh
```

卸载只移除 `tencent-docs@akashmahedy-plugins`，不会移除旧的个人安装。若需停止所有腾讯文档访问，也请禁用或移除其他已安装的腾讯插件。删除令牌是独立操作，避免误卸载时丢失本地登录信息。

## 常见问题

| 问题 | 解决方法 |
|---|---|
| 找不到 Node | 使用 setup.command 或 setup.cmd 自动准备 Node。 |
| Codex CLI 不可用 | 更新 Codex，必要时使用 `--codex "/完整路径/codex"`。macOS 内置路径会自动检测。 |
| `400006` 或认证失败 | 重新生成有效令牌，再运行 `--replace-token --skip-install`。 |
| `400007` 或权限检查失败 | 在腾讯网站检查账户或会员权限。 |
| 安装后没有工具 | 重启 Codex，新建聊天并确认插件已启用。 |
| 无法连接腾讯服务 | 检查网络是否可访问 `docs.qq.com`。本插件不提供网络绕过服务。 |
| 出现两个插件版本 | 选择一个安装版本使用；新版不会自动移除旧的个人插件。 |

## 隐私与凭据

发布包不包含任何账户令牌。令牌保存在 **macOS 钥匙串**，或您的用户专属 **Windows DPAPI 加密文件**中。Linux 使用私有文件（文件权限 `600`，目录权限 `700`），插件本身不会加密该文件。请保护您的系统账户。

本机桥接程序直接连接 `https://docs.qq.com/openapi/mcp`，不经过开发者代理服务器，也没有遥测或分析追踪。文档请求和响应会经过 Codex 和腾讯，相关平台政策同样适用。详见 [隐私说明](../PRIVACY.md)。

## 兼容性与验证

需要 Node 22 或更高版本。主要安装目标是 macOS 和 Windows，并提供 Linux 终端模式。GitHub Actions 在三个系统上运行传输、凭据存储和发布包检查。已在 macOS 验证隔离的 Codex CLI 安装、钥匙串保存，以及腾讯服务实时只读认证和工具发现。新桌面聊天与 Windows 桌面应用属于另外的检查，CI 结果不代表已完成这些验证。

桥接程序支持腾讯 MCP 请求/响应操作及 JSON、SSE 响应，不支持主动服务器推送、sampling 或 elicitation。请求超时后不会自动重试文档操作。

## 开发与署名

```bash
npm test
npm run validate
```

无需安装 npm 依赖。[提交问题](https://github.com/akashmahedy/Tencent-Docs-Plugin-for-AI-Agent/issues) 时请勿附带令牌或私人文档。

插件打包、本地桥接、安装向导及双语文档：**akashmahedy**。远程 MCP 服务及腾讯文档产品：**腾讯**。本仓库代码采用 [MIT 许可证](../LICENSE)；腾讯服务、商标及使用条款仍归腾讯所有。

官方资料：[Codex 插件文档](https://developers.openai.com/plugins/build/plugins)、[腾讯 MCP 指南](https://developer.cloud.tencent.com/mcp/server/11803)。
