# Privacy · 隐私

Created and maintained by akashmahedy / 由 akashmahedy 创建和维护。

The plugin has no telemetry or maintainer-operated server. Your token is read locally and sent only to Tencent's official MCP HTTPS endpoint. macOS uses Keychain; Windows uses per-user DPAPI encryption; Linux stores the token in a private file without plugin-level encryption. Tokens are not included in the repository, release files or logs. Never include a token in a GitHub issue or chat message.

Codex and Tencent process the document requests and responses you authorize. Their policies apply. Deleting the local credential does not revoke it at Tencent; revoke it through Tencent when required. Keychain/DPAPI protection does not prevent other programs running as your logged-in user from accessing credentials.

本插件没有遥测或开发者服务器。个人令牌在本机读取，仅发送到腾讯官方 MCP HTTPS 地址。macOS 使用钥匙串；Windows 使用当前用户的 DPAPI 加密；Linux 使用私有文件，插件不提供文件加密。仓库、发布包和日志不包含令牌，切勿把令牌附在 GitHub 问题或聊天中。

您授权的文档请求和响应由 Codex 与腾讯处理，相关平台政策适用。删除本机凭据不会在腾讯撤销令牌，必要时请通过腾讯撤销。钥匙串或 DPAPI 不能阻止以您当前用户身份运行的其他程序访问凭据。

Support / 支持：https://github.com/akashmahedy/tencent-docs-codex-plugin/issues
