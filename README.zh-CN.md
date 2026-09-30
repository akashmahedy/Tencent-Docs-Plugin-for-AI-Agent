# 腾讯文档 Codex 插件 · Tencent Docs for Codex

[English](README.md) | [简体中文](README.zh-CN.md) · [使用文档](https://akashmahedy.github.io/tencent-docs-codex-plugin/zh/) · [下载](https://github.com/akashmahedy/tencent-docs-codex-plugin/releases/latest)

**由 [akashmahedy](https://github.com/akashmahedy) 创建和维护。** 本社区插件连接腾讯官方腾讯文档 MCP 服务，由独立开发者维护，并非腾讯或 OpenAI 官方插件。

在 Codex 中搜索、读取、创建和编辑受支持的腾讯文档及电子表格。可用功能以腾讯服务实时提供的工具和您的账户权限为准。

## 快速安装

需要支持 `codex plugin` 的最新版 Codex 桌面应用或 CLI、**Node.js 22 或更高版本**，以及您自己的腾讯文档账户和个人令牌。缺少 Node 时请从 [nodejs.org](https://nodejs.org/) 安装。部分操作可能需要符合条件的腾讯会员权限；您的网络必须能访问腾讯服务。

1. 在 [Releases](https://github.com/akashmahedy/tencent-docs-codex-plugin/releases/latest) 下载 **tencent-docs-codex-plugin-1.1.0.zip**，完整解压。
2. 在解压后的文件夹打开终端，运行：

   ```bash
   node plugins/tencent-docs/scripts/setup.mjs --lang=zh
   ```

   macOS 也可运行 `bash setup.command --lang=zh`；Windows 可双击 `setup.cmd` 后选择中文。如 macOS 阻止下载的启动器，请先查看源代码，再使用上面的终端命令。

3. 在 [腾讯令牌页面](https://docs.qq.com/open/auth/mcp.html) 获取个人令牌，在安装向导的**隐藏输入框**中粘贴，完成后重启 Codex 并新建聊天。

向导会查找可用的 CLI（包括 macOS 桌面应用内置 CLI）、注册插件市场、安装插件、检查认证及工具发现，并在本机保存令牌。检查只调用初始化、工具发现和可用时的 `get_user_info`，不会创建或修改文档。检查失败不会保存新输入的令牌。已有 Codex 配置通过 CLI 管理，不会被整体覆盖。

使用 Git 克隆时，请保留仓库目录，它是本地市场的数据源。更新时将新版本解压到固定目录并重新运行向导。如果 CLI 无法报告安装路径，Codex 的 PATH 中需提供 Node。

## 让 Codex 协助安装

把仓库链接和以下提示词交给 Codex，**不要把令牌写进聊天消息**：

> 请安装 akashmahedy 的腾讯文档插件：https://github.com/akashmahedy/tencent-docs-codex-plugin。先阅读 START_HERE_FOR_CODEX.md 并查看安装脚本。请在交互式终端运行中文安装向导，让我私下输入令牌。检查连接，并告诉我何时重启 Codex。

## 手动添加 GitHub 插件市场

```bash
codex plugin marketplace add akashmahedy/tencent-docs-codex-plugin
codex plugin add tencent-docs@akashmahedy-plugins
```

然后下载或克隆仓库，运行带 `--skip-install` 的安装向导来配置令牌和检查连接。如果当前客户端不支持该插件，请更新到支持仓库市场的桌面或 CLI 版本。仓库市场不会自动把插件上架到 OpenAI 公共插件目录。

## 使用示例

- “查找名为‘周报’的腾讯文档，并总结主要内容。”
- “用这些列名和数据创建一个普通电子表格。”
- “将这些数据行追加到这份指定的腾讯文档表格。”

插件会区分普通电子表格与智能表，并在编辑前确认准确的目标文档。所有操作受您自己的腾讯权限约束；请在授权写入前查看操作内容。

## 检查连接、更换令牌和卸载

在仓库目录运行：

```bash
node plugins/tencent-docs/scripts/setup.mjs --check --lang=zh
node plugins/tencent-docs/scripts/setup.mjs --replace-token --skip-install --lang=zh
node plugins/tencent-docs/scripts/setup.mjs --uninstall --lang=zh
node plugins/tencent-docs/scripts/setup.mjs --forget-token --lang=zh
```

卸载只移除 `tencent-docs@akashmahedy-plugins`，不会移除旧的个人安装。若需停止所有腾讯文档访问，也请禁用或移除其他已安装的腾讯插件。删除令牌是独立操作，避免误卸载时丢失本地登录信息。

## 常见问题

| 问题 | 解决方法 |
|---|---|
| 找不到 Node | 安装 Node.js 22 或更高版本，再重新打开终端。 |
| Codex CLI 不可用 | 更新 Codex，必要时使用 `--codex "/完整路径/codex"`。macOS 内置路径会自动检测。 |
| `400006` 或认证失败 | 重新生成有效令牌，再运行 `--replace-token --skip-install`。 |
| `400007` 或权限检查失败 | 在腾讯网站检查账户或会员权限。 |
| 安装后没有工具 | 重启 Codex，新建聊天并确认插件已启用。 |
| 无法连接腾讯服务 | 检查网络是否可访问 `docs.qq.com`。本插件不提供网络绕过服务。 |
| 出现两个插件版本 | 选择一个安装版本使用；新版不会自动移除旧的个人插件。 |

## 隐私与凭据

发布包不包含任何账户令牌。令牌保存在 **macOS 钥匙串**，或您的用户专属 **Windows DPAPI 加密文件**中。Linux 使用私有文件（文件权限 `600`，目录权限 `700`），插件本身不会加密该文件。请保护您的系统账户。

本机桥接程序直接连接 `https://docs.qq.com/openapi/mcp`，不经过开发者代理服务器，也没有遥测或分析追踪。文档请求和响应会经过 Codex 和腾讯，相关平台政策同样适用。详见 [隐私说明](PRIVACY.md)。

## 兼容性与验证

需要 Node 22 或更高版本。主要安装目标是 macOS 和 Windows，并提供 Linux 终端模式。GitHub Actions 在三个系统上运行传输、凭据存储和发布包检查。已在 macOS 验证隔离的 Codex CLI 安装、钥匙串保存，以及腾讯服务实时只读认证和工具发现。新桌面聊天与 Windows 桌面应用属于另外的检查，CI 结果不代表已完成这些验证。

桥接程序支持腾讯 MCP 请求/响应操作及 JSON、SSE 响应，不支持主动服务器推送、sampling 或 elicitation。请求超时后不会自动重试文档操作。

## 开发与署名

```bash
npm test
npm run validate
```

无需安装 npm 依赖。[提交问题](https://github.com/akashmahedy/tencent-docs-codex-plugin/issues) 时请勿附带令牌或私人文档。

插件打包、本地桥接、安装向导及双语文档：**akashmahedy**。远程 MCP 服务及腾讯文档产品：**腾讯**。本仓库代码采用 [MIT 许可证](LICENSE)；腾讯服务、商标及使用条款仍归腾讯所有。

官方资料：[Codex 插件文档](https://developers.openai.com/plugins/build/plugins)、[腾讯 MCP 指南](https://developer.cloud.tencent.com/mcp/server/11803)。
