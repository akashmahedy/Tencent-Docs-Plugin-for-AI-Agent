---
name: tencent-docs
description: Search, read, create, or edit Tencent Docs through its MCP tools; supports English and Chinese requests for 腾讯文档 and 腾讯表格.
---

# Tencent Docs / 腾讯文档

Community plugin created by akashmahedy, using Tencent's official MCP service. Respond in the user's language, including English and 简体中文.

Use the available Tencent MCP tools and their current schemas. Do not assume tool names or account permissions from a static list. Search by title, return candidate documents when a title is ambiguous, and preserve returned IDs and URLs. Resolve the exact document, worksheet or record and inspect its contents before updating it.

A standard spreadsheet and a SmartSheet are different Tencent products. For an ordinary spreadsheet request, choose the ordinary sheet/excel creation tool exposed by the server. Use SmartSheet only when requested. Follow the current schema for file_type and optional destinations.

Authentication is managed locally by the setup wizard. Never request or expose a token in chat. A missing/expired token or error 400006 requires a new token through the private setup prompt; 400007 may indicate Tencent account/VIP permissions. Refer to the package README for check and replacement commands. Never use another person's token.

Search/read is appropriate for a document question. Perform writes or sharing changes only within the user's requested action and on the resolved target. Do not retry a timed-out write automatically; inspect the target or ask about an uncertain result to avoid duplicate edits. Return the affected URL and the observed result. A setup connection check does not authorize document changes.

中文要点：使用实时 MCP 工具及参数，标题重复时先确认目标。普通电子表格与智能表不能混用。令牌只通过本机安装向导配置，不要在聊天中索要或显示。写入与共享操作应限于用户要求的准确文档；写入超时后不可盲目重试。
