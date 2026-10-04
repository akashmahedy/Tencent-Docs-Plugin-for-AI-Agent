# 腾讯文档 Codex 插件 · Tencent Docs

在 Codex 中查找和总结腾讯文档，并处理电子表格。

**由 [akashmahedy](https://github.com/akashmahedy) 创建。** 本社区插件连接腾讯官方 MCP 服务。

[English](README.md) · **[下载插件](https://github.com/akashmahedy/Tencent-Docs-Plugin-for-AI-Agent/releases/latest)** · [网站](https://akashmahedy.github.io/Tencent-Docs-Plugin-for-AI-Agent/zh/)

## 三步安装

需要支持插件的 Codex 和腾讯文档账户。需要时，启动器会自动准备 Node.js。部分腾讯功能可能需要会员权限。

1. 在 [Releases](https://github.com/akashmahedy/Tencent-Docs-Plugin-for-AI-Agent/releases/latest) **下载并完整解压**插件 ZIP。请将文件夹保存在固定位置。
2. **打开安装启动器：** macOS 使用 `setup.command`，Windows 使用 `setup.cmd`。Linux 或 macOS 阻止启动器时，在解压目录打开终端运行：

   ```sh
   bash setup.command --lang=zh
   ```

   无需单独安装 Node.js；首次下载需要联网。

3. **连接您的账户。** 在[腾讯页面](https://docs.qq.com/open/auth/mcp.html)获取个人令牌，粘贴到向导的隐藏终端输入中。安装成功后，重启 Codex、新建聊天并启用插件。

向导会安装插件、在本机保存令牌并检查连接。**不要把令牌粘贴到聊天或 GitHub。**

## 想让 Codex 帮您安装？

点击代码块右上角的复制图标，再粘贴到 Codex：

```text
请安装 https://github.com/akashmahedy/Tencent-Docs-Plugin-for-AI-Agent。按 START_HERE_FOR_CODEX.md 操作。不要假设电脑已安装 Node.js。新电脑请先用安装启动器：macOS/Linux 运行 setup.command，Windows 运行 setup.cmd；缺少 Node.js 或版本过旧时会自动下载并校验。在 Node 就绪前不要直接运行 node setup.mjs。在交互式终端让我私下输入腾讯令牌。
```

## 试着提问

- “查找我的周报并总结主要内容。”
- “用这些数据创建一个电子表格。”
- “将这些行追加到这份指定的表格。”

## 需要帮助？

[安装、更新与常见问题](docs/advanced.zh-CN.md) · [反馈问题](https://github.com/akashmahedy/Tencent-Docs-Plugin-for-AI-Agent/issues)

令牌保存在自己的电脑上，并直接发送给腾讯。没有开发者代理或遥测。[隐私说明](PRIVACY.md)。

[MIT 许可证](LICENSE) · 由 **akashmahedy** 维护 · 独立社区插件，非腾讯或 OpenAI 官方产品。
