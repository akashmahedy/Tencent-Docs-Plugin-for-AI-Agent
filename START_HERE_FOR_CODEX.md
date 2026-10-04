# Install Tencent Docs for Codex / 安装腾讯文档插件

Read README.md or README.zh-CN.md and inspect plugins/tencent-docs/scripts/setup.mjs before installation. Install only when the user requested setup. Requires Node 22+ and a working Codex CLI with plugin support. The macOS wizard finds the desktop bundled CLI when the PATH shim is broken.

Run from this repository:

```sh
node setup.mjs --lang=en
# 中文：
node setup.mjs --lang=zh
```

The user enters their own Tencent token in an interactive hidden terminal prompt. Never ask for the token in chat, pass it as a command argument, read it into your messages, or include it in a package. If your executor cannot provide private terminal input, open a terminal and ask the user to run the command there. Do not claim setup complete until the connection check succeeds; restart Codex and verify tool availability in a fresh chat. Setup checks do not prove document-write workflows. Do not create or edit a document solely for installation verification.

请先阅读中文 README 并检查安装脚本。仅在用户要求安装时执行。让用户在交互式终端的隐藏输入中提供自己的令牌；不要在聊天中索要令牌，不要将令牌作为命令参数，也不要把令牌写入发布包。连接检查通过后再报告成功，重启 Codex 并在新聊天中确认工具可用。安装验证无需创建或修改文档。
