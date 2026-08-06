---
title: LLM Prompt 结构模板
date: 2026-07-20
tags: ["LLM","Prompt","AI Coding"]
summary: 将系统提示词拆分为 01-role / 02-task 等结构化模块，避免硬编码长字符串。
publish: true
type: wiki-aicoding
seealso: ["2-solutions/blog-wiki-toolchain.md"]
---

# LLM Prompt 结构模板

## 分层模板结构

| 序号 | 模块 | 说明 |
| ---- | ---- | ---- |
| 01 | 角色 | 定义 Agent 角色 |
| 02 | 任务 | 明确任务描述 |
| 03 | 输出格式 | JSON / Markdown 约束 |
| 04 | 约束与容错 | 失败重试 / 异常降级策略 |

相关工作流见：[[2-solutions/blog-wiki-toolchain.md|博客与 Wiki 工具链解决方案]]
