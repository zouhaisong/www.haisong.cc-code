---
title: 编程智能体 Pi 实战手册
date: 2026-05-01
tags: ["Pi", "AI编程", "Agent", "终端Agent"]
summary: 极简主义终端编程智能体 Pi 的全维度使用指南，涵盖四种运行模式、扩展系统、Skills、上下文工程及实战技巧。
publish: true
type: wiki
---

# 编程智能体 Pi 实战手册

## 目录

1. [概述](#1-概述)
2. [核心设计理念](#2-核心设计理念)
3. [安装与配置](#3-安装与配置)
4. [核心功能详解](#4-核心功能详解)
5. [四种运行模式](#5-四种运行模式)
6. [会话管理](#6-会话管理)
7. [扩展系统](#7-扩展系统)
8. [Skills 技能系统](#8-skills-技能系统)
9. [上下文工程](#9-上下文工程)
10. [项目级配置](#10-项目级配置)
11. [模型与提供商](#11-模型与提供商)
12. [与其他工具对比](#12-与其他工具对比)
13. [实战技巧与最佳实践](#13-实战技巧与最佳实践)
14. [OpenClaw 集成](#14-openclaw-集成)
15. [常见问题](#15-常见问题)

---

## 1. 概述

### 1.1 什么是 Pi

Pi 是一个极简主义的终端编程智能体（Agent），由 libGDX 创始人 Mario Zechner（@badlogic）开发。它是 GitHub 史上增长最快的开源项目 OpenClaw 的核心引擎。

Pi 的核心哲学可以用一句话概括：**"An autonomous agent is just an LLM + tools + a loop"**——一个自主智能体就是大语言模型 + 工具 + 循环。

### 1.2 关键数据

| 指标 | 数值 |
|------|------|
| GitHub Stars | ~14.4K (pi-mono) / 250K+ (OpenClaw) |
| NPM 周下载量 | 1.3M+ (2026年1月) |
| 系统提示大小 | ~200-500 tokens（行业平均：2000-5000） |
| 核心工具数 | 4 个（read/write/edit/bash） |
| 支持模型数 | 324+ |
| 支持提供商 | 15+ |
| 许可协议 | MIT |

### 1.3 核心特点

- **极简核心**：仅有 4 个核心工具，系统提示词极短
- **无限扩展**：通过 TypeScript 扩展、Skills、Prompt Templates 实现无限定制
- **多模型支持**：支持 15+ 提供商，包括 OpenAI、Anthropic、Google、本地 Ollama 等
- **树形会话**：会话历史以树状结构存储，支持分支和回溯
- **四种运行模式**：交互模式、打印/JSON 模式、RPC 模式、SDK 模式

---

## 2. 核心设计理念

### 2.1 极简主义的合理性

Mario Zechner 认为，前沿的 LLM 模型经过强化学习训练后，已经足够理解"编程智能体"是什么。你不需要 10000 token 的系统提示词来"教"它如何工作。

这一观点在 Terminal-Bench 2.0 基准测试中得到了验证——使用极简系统提示的 Pi 与拥有复杂工具链的 Agent 同台竞技，表现毫不逊色。

### 2.2 与"功能膨胀"的对立

大多数 Agent 框架走向"加法思维"：
- 更多内置工具
- 更长的系统提示词
- 更复杂的规划链路
- 多个子智能体协同

Pi 反其道而行，用"减法重构"：
- 最小工具集（4个）
- 最短系统提示（~200 tokens）
- 无内置 Plan Mode（用文件代替）
- 无 MCP 支持（用 CLI 工具代替）

### 2.3 工具即原子能力

Pi 的 4 个核心工具：
- **read**：读取文件内容
- **write**：写入文件
- **edit**：修改已有文件
- **bash**：执行 shell 命令

这 4 个工具覆盖了编程任务的所有核心需求。通过 bash，Pi 可以调用任何其他工具（grep、find、ls 等），形成无限的扩展能力。

### 2.4 与其他 Agent 的对比

| 对比维度 | Claude Code | Pi |
|---------|-----------|-----|
| 系统提示词 | ~10000+ tokens | < 1000 tokens |
| 内置工具数 | 18+ | 4 个 |
| Plan Mode | 有 | 无（用文件代替） |
| MCP 支持 | 有 | 无（用 CLI 工具代替） |
| 子智能体 | 有（不可观测） | 无（通过 bash 自我调用） |
| 多模型支持 | Claude 系列为主 | 15+ 提供商 |
| 扩展方式 | Shell hooks + MCP | TypeScript 原生扩展 |

---

## 3. 安装与配置

### 3.1 安装方式

#### 通过 npm（推荐）

```bash
npm install -g @earendil-works/pi-coding-agent
# 或使用 pnpm
pnpm add -g @earendil-works/pi-coding-agent
# 或使用 bun
bun add -g @earendil-works/pi-coding-agent
```

#### 通过安装脚本

```bash
curl -fsSL https://pi.dev/install.sh | sh
```

#### 从源码构建

```bash
git clone https://github.com/badlogic/pi-mono.git
cd pi-mono && npm install && npm run build
cd packages/coding-agent && npm run build:binary
./dist/pi
```

### 3.2 前置要求

- Node.js 18+ (LTS)
- npm / pnpm / bun 其一
- AI 提供商的 API Key

### 3.3 配置 API Key

#### 使用环境变量

```bash
# Anthropic (Claude)
export ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (GPT)
export OPENAI_API_KEY=sk-...

# 或在启动时指定
pi --provider anthropic
```

#### 使用交互式登录

```bash
pi
/login
# 然后选择提供商并完成 OAuth 认证
```

### 3.4 配置本地模型（Ollama）

```bash
# 安装 Ollama
# 然后在 ~/.pi/agent/models.json 中配置
```

---

## 4. 核心功能详解

### 4.1 内置工具

#### read

读取文件内容和图片。

```
特性：
- 支持 offset/limit 分页
- 自动调整图片大小
- 文本截断至 2000 行 / 50KB
```

#### write

写入文件内容。

```
特性：
- 自动创建父目录
- 覆盖或新建
```

#### edit

精确文本替换。

```
特性：
- oldText 必须完全匹配（包括空格）
- 返回统一 diff
```

#### bash

执行 shell 命令。

```
特性：
- 流式输出
- 支持超时和中断
- 返回 stdout/stderr
```

### 4.2 可选工具

| 工具 | 功能 |
|------|------|
| grep | 正则/字面搜索，基于 ripgrep |
| find | 文件 glob 搜索 |
| ls | 目录列表 |

### 4.3 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Enter` | 发送引导消息（当前工具完成后中断剩余工具） |
| `Alt+Enter` | 发送后续消息（等待智能体完成） |
| `Ctrl+L` | 切换模型 |
| `Ctrl+P` | 快速切换常用模型 |
| `Ctrl+C` | 中断当前操作 |
| `/tree` | 查看会话树 |
| `/model <name>` | 切换模型 |
| `/help` | 显示帮助 |

### 4.4 命令

| 命令 | 功能 |
|------|------|
| `/new` | 开始新会话 |
| `/name <name>` | 设置会话显示名 |
| `/session` | 显示会话信息 |
| `/fork` | 从当前点创建分支 |
| `/export` | 导出会话为 HTML |
| `/share` | 分享会话到 GitHub Gist |
| `/compact` | 手动压缩上下文 |
| `/reload` | 重新加载扩展 |

---

## 5. 四种运行模式

### 5.1 Interactive 模式（默认）

启动方式：`pi` 或 `pi -i`

```
特性：
- 完整 TUI 界面（基于 pi-tui）
- 差异渲染（differential rendering）
- 同步输出（几乎无闪烁）
- Markdown 渲染
- 实时 token/成本显示
```

### 5.2 Print/JSON 模式

用于脚本和 CI/CD 流水线。

```bash
# 非交互式查询
pi -p "Summarize this codebase"

# JSON 输出模式
pi -p "List all .ts files" --mode json

# 管道输入
cat README.md | pi -p "Summarize this text"
```

### 5.3 RPC 模式

JSON-over-STDIO，用于非 Node 环境集成。

```bash
pi --rpc
```

### 5.4 SDK 模式

嵌入到应用程序中。

```typescript
import { createAgentSession } from '@earendil-works/pi-coding-agent';

const session = await createAgentSession({
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
});

session.on('event', (event) => {
  console.log(event);
});

await session.run('Write a hello world program');
```

---

## 6. 会话管理

### 6.1 树状会话结构

Pi 的会话历史以 JSONL 格式存储，每个交互记录包含 `id` 和 `parentId`，构成树状结构。

```
main session
├── 尝试方案 A
├── 尝试方案 B
└── 从某条消息重新 fork
```

### 6.2 会话分支

```bash
# 查看会话树
/tree

# 从当前点创建分支
/fork

# 跳转到指定分支
/tree 0ea51497613daf7e1de28ee99950b074
```

### 6.3 会话导出与分享

```bash
# 导出为 HTML
/export

# 上传到 GitHub Gist 并获取分享链接
/share
```

### 6.4 上下文压缩（Compaction）

当对话长度接近上下文窗口限制时，Pi 会自动压缩较早的对话内容。

```
特性：
- 自动总结旧消息
- 保留关键上下文
- 可通过扩展自定义压缩策略
```

---

## 7. 扩展系统

### 7.1 扩展简介

Pi 的扩展系统是其强大定制能力的基础。通过 TypeScript 编写扩展，可以：

- 注册自定义工具
- 拦截或修改工具调用
- 自定义用户交互界面
- 实现上下文注入

### 7.2 可用事件钩子

| 事件类别 | 事件名称 | 功能 |
|---------|---------|------|
| 会话事件 | session_start | 会话开始时 |
| | session_before_switch | 切换会话前 |
| | session_before_fork | 分支会话前 |
| | session_before_compact | 压缩上下文前 |
| 智能体事件 | before_agent_start | 智能体启动前 |
| | agent_start / agent_end | 智能体开始/结束 |
| | turn_start / turn_end | 轮次开始/结束 |
| | tool_execution_start | 工具执行开始 |
| 模型事件 | model_select | 模型选择时 |
| 工具事件 | tool_call | 工具调用时 |
| | tool_result | 工具结果返回时 |
| 输入事件 | input | 用户输入时 |

### 7.3 扩展示例

```typescript
// ~/.pi/agent/extensions/my-extension.ts
import { ExtensionContext } from '@earendil-works/pi-coding-agent';

export default (ctx: ExtensionContext) => {
  // 注册自定义工具
  ctx.registerTool({
    name: 'greet',
    description: 'Say hello to the user',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' }
      }
    },
    async execute({ name }) {
      return `Hello, ${name}!`;
    }
  });

  // 拦截工具调用
  ctx.on('tool_call', async (event, next) => {
    if (event.tool === 'bash' && event.input.command.includes('rm -rf')) {
      const confirmed = await ctx.ui.confirm('Dangerous command detected. Proceed?');
      if (!confirmed) return;
    }
    return next();
  });
};
```

### 7.4 扩展安装

```bash
# 从 npm 安装
pi install npm:@foo/bar

# 从 Git 安装
pi install git:github.com/user/repo

# 本地路径
pi install ./my-extension
```

### 7.5 官方扩展

| 扩展名 | 功能 |
|--------|------|
| permission-gate | 危险命令（如 rm -rf）执行前确认 |
| protected-paths | 保护敏感路径（.env, .git/） |
| confirm-destructive | 清除或切换会话前确认 |
| dirty-repo-guard | 未提交代码时警告 |
| questionnaire | 结构化提问界面 |
| git-checkpoint | 每次操作前创建 git stash |
| plan-mode | 只读探索模式 |
| subagent | 子智能体委托 |

---

## 8. Skills 技能系统

### 8.1 Skills 简介

Skills 是 Pi 的渐进式披露机制，通过 Markdown 文件定义技能，按需加载，不浪费上下文空间。

### 8.2 SKILL.md 格式

```markdown
---
name: code-review
description: Perform a structured code review. Use when asked to review code, suggest improvements, or analyze code quality.
---

# Code Review Skill

## When to Use
- User asks to review code
- User wants improvement suggestions
- Analyzing code quality

## Process
1. Read the relevant files
2. Check for common issues:
   - Security vulnerabilities
   - Performance problems
   - Code style inconsistencies
3. Provide actionable feedback

## Output Format
- P0: Critical issues
- P1: Important issues
- P2: Nice-to-have improvements
```

### 8.3 目录结构

```
my-skill/
├── SKILL.md          # 必需：技能定义
├── README.md         # 可选：人类可读说明
├── scripts/          # 可选：可执行脚本
├── references/       # 可选：参考文档
└── assets/          # 可选：模板/资源
```

### 8.4 官方 Skills

| Skill | 功能 |
|-------|------|
| code-review | 结构化代码审查 |
| debug | 系统化调试流程 |
| refactor | 安全重构方法论 |
| plan | 预实施规划 |
| spec | 技术规范撰写 |
| test | 测试编写方法 |

---

## 9. 上下文工程

### 9.1 AGENTS.md

项目级指令文件，启动时自动加载。

**位置**：`~/.pi/agent/`、`~/.agents/`、父目录、当前目录

```markdown
# Project Guidelines

## Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Maximum line length: 100 characters

## Commands
- Install: npm install
- Dev: npm run dev
- Test: npm run test
- Build: npm run build

## Rules
- Do not modify public API without explanation
- Prefer small incremental edits
- Run tests after changing business logic
```

### 9.2 SYSTEM.md

自定义系统提示，替换或追加默认提示。

**位置**：项目根目录或 `~/.pi/agent/SYSTEM.md`

```markdown
# Custom System Prompt

You are a senior backend engineer specializing in Node.js and PostgreSQL.
- Always use async/await
- Prefer functional programming patterns
- Include error handling for all async operations
```

### 9.3 追加系统提示

使用 `APPEND_SYSTEM.md` 可以在不替换默认提示的情况下追加内容。

### 9.4 动态上下文

通过扩展可以实现：

- 每次轮次前注入消息
- 过滤消息历史
- 实现 RAG（检索增强生成）
- 构建长期记忆

---

## 10. 项目级配置

### 10.1 项目结构示例

```
my-project/
├── .pi/
│   ├── skills/          # 项目级 Skills
│   │   └── my-project-skill/
│   │       └── SKILL.md
│   ├── SYSTEM.md        # 项目级系统提示
│   └── AGENTS.md        # 项目级指令
├── src/
├── tests/
└── package.json
```

### 10.2 配置本地模型（models.json）

```json
{
  "providers": {
    "ollama": {
      "type": "openai",
      "baseURL": "http://localhost:11434/v1",
      "apiKey": "ollama"
    }
  },
  "models": {
    "qwen": {
      "provider": "ollama",
      "model": "qwen3.5:35b-a3b"
    }
  }
}
```

### 10.3 Prompt Templates

可复用的 Markdown 提示模板。

```
~/.pi/agent/prompts/
├── code-review.md
├── explain-code.md
└── translate-comment.md
```

---

## 11. 模型与提供商

### 11.1 支持的提供商

| 提供商 | 认证方式 |
|--------|----------|
| Anthropic | API Key / OAuth |
| OpenAI | API Key / OAuth |
| Google (Gemini) | API Key |
| Azure | API Key |
| Bedrock | AWS Credentials |
| Mistral | API Key |
| Groq | API Key |
| Cerebras | API Key |
| xAI | API Key |
| Hugging Face | API Key |
| Kimi | API Key |
| MiniMax | API Key |
| OpenRouter | API Key |
| Ollama | 本地 (无 API Key) |
| LM Studio | 本地 |
| vLLM | 本地 |

### 11.2 模型切换

```bash
# 交互式选择
/model

# 指定模型
/model claude-sonnet-4-20250514

# 快捷切换
Ctrl+P  # 在常用模型间轮换
Ctrl+L  # 打开模型选择器
```

### 11.3 本地模型推荐

| VRAM | 推荐模型 | 说明 |
|------|----------|------|
| 8GB | Qwen 2.5 7B Coder | 预算入门级 |
| 12GB | Qwen 2.5 14B | 性价比之选 |
| 16GB | Qwen 3.6-35B-A3B + --cpu-moe | MoE 架构 |
| 24GB | Qwen 3.6-27B / Gemma 4 26B-A4B | 高性能选项 |

### 11.4 本地模型配置注意事项

**Qwen 3.6 问题**：
```bash
# 必须使用正确的格式（冒号后无空格）
--chat-template-kwargs '{"enable_thinking":false}'
```

**Gemma 4 问题**：
```bash
# 需要禁用 thinking 模式
llama-server --jinja --chat-template-kwargs '{"enable_thinking":false}'
```

---

## 12. 与其他工具对比

### 12.1 Pi vs Claude Code

| 维度 | Pi | Claude Code |
|------|-----|-------------|
| 定位 | 极简可扩展终端 Agent | 全功能终端编程 Agent |
| 系统提示 | ~200 tokens | ~10000+ tokens |
| 内置工具 | 4 个 | 18+ 个 |
| 订阅费用 | 免费（自付 API） | $20/月起 |
| 多模型支持 | 15+ 提供商 | Claude 系列为主 |
| 扩展方式 | TypeScript 原生 | Shell hooks + MCP |
| 子智能体 | 通过 bash 自调用 | 内置 |
| Plan Mode | 无（用文件代替） | 有 |
| 上手难度 | 较高 | 较低 |

### 12.2 选型建议

| 场景 | 推荐 |
|------|------|
| 高阶开发者、极简主义者 | **Pi** |
| 本地模型、隐私敏感 | **Pi** |
| 大型复杂项目重构 | Claude Code |
| 新手入门 | Claude Code / Trae |
| 团队协作、企业级 | Claude Code |
| 日常业务开发 | Codex / Trae |
| 国产化、私有化部署 | Qwen Code |

### 12.3 双持策略

最佳实践是结合使用两者：

- **Pi + 本地模型**：处理 80% 的常规任务（成本为零）
- **Claude Code**：处理 20% 的复杂问题（需要最强推理能力）

---

## 13. 实战技巧与最佳实践

### 13.1 高效使用建议

#### 1. 明确任务描述
```
❌ "帮我看看这个"
✅ "分析 src/auth/login.ts 中的 JWT 验证逻辑，指出潜在的安全问题"
```

#### 2. 利用分支探索
```
# 主任务进行中，可以 fork 一个分支尝试另一种方案
/fork

# 验证后可以合并或放弃
```

#### 3. 渐进式上下文
```
# 不要一次性加载整个代码库
# 而是让 Pi 按需读取
pi "先看 src/index.ts 的结构"
pi "现在看 src/auth/ 模块"
```

### 13.2 常见工作流

#### 快速代码生成
```bash
pi "为 User 模型创建 CRUD 控制器，遵循 NestJS 约定"
```

#### Git 提交信息生成
```bash
pi "分析我的更改，生成符合 Conventional Commits 的提交信息"
```

#### 代码审查
```bash
pi "审查 src/api/v2/ 目录下的所有文件，给出结构化报告"
```

#### Bug 调试
```bash
pi "查看最近 10 条 git commit，然后分析为什么用户登录会失败"
```

### 13.3 AGENTS.md 最佳实践

```markdown
# Project Agent Guide

## 项目信息
- 框架: Next.js 14 + TypeScript
- 样式: Tailwind CSS
- 数据库: PostgreSQL + Prisma

## 开发命令
- npm run dev     # 开发服务器
- npm run build   # 生产构建
- npm run test    # 运行测试
- npm run lint    # 代码检查

## 编码规范
- 组件放在 components/
- API 路由放在 app/api/
- 使用 App Router 而非 Pages Router

## 注意事项
- 不要在客户端直接访问数据库
- 所有 API 都需要认证
- 图片使用 next/image 优化
```

### 13.4 性能优化技巧

1. **使用合适的模型**
   - 简单任务用小模型（如 Haiku、Sonnet 4）
   - 复杂任务用大模型（如 Opus）
   - 中途切换模型不影响上下文

2. **避免上下文膨胀**
   - 大型项目使用 `.piignore` 排除无关文件
   - 及时压缩会话 `/compact`
   - 定期开启新会话

3. **利用本地模型**
   - 隐私敏感代码使用 Ollama
   - 降低成本使用免费额度

---

## 14. OpenClaw 集成

### 14.1 OpenClaw 简介

OpenClaw 是 GitHub 史上增长最快的开源项目之一（250K+ stars），使用 Pi 作为其核心编码引擎。

### 14.2 集成方式

OpenClaw 通过 SDK 模式直接导入和实例化 Pi 的 `AgentSession`：

```typescript
import { createAgentSession } from '@earendil-works/pi-coding-agent';

const session = await createAgentSession({
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
});
```

### 14.3 OpenClaw 添加的额外能力

| 能力 | 说明 |
|------|------|
| 消息渠道集成 | 消息、邮件、Discord 等 |
| 工具治理 | 工具的白名单/黑名单策略 |
| Prompt 注入 | 按渠道定制系统提示 |
| 故障恢复 | 模型降级和重试机制 |
| 多账户轮换 | 认证配置轮换 |

---

## 15. 常见问题

### Q1: Pi 和 oh-my-pi 是什么关系？

**oh-my-pi** 是 Pi 的一个社区分叉版本，由 can1357 维护。它基于 `badlogic/pi-mono` 但进行了深度改造和扩展，增加了如 LSP 集成、任务分解等高级功能。

### Q2: 如何处理权限安全问题？

Pi 默认采用 YOLO（"执行即信任"）模式，不会在执行命令前弹窗确认。

如需安全防护，可以安装官方扩展：
```bash
pi install npm:pi-agent-config
```

这会添加：
- `permission-gate`：危险命令确认
- `protected-paths`：敏感路径保护
- `dirty-repo-guard`：未提交代码警告

### Q3: 模型调用失败怎么办？

1. **检查 API Key**：确认环境变量或配置文件中的 key 正确
2. **检查网络**：确认可以访问模型提供商的 API
3. **切换模型**：使用 `/model` 尝试其他模型
4. **查看日志**：`~/.pi/logs/` 目录下的日志可能有线索

### Q4: 如何让 Pi 理解我的代码库？

1. **创建 AGENTS.md**：描述项目结构和技术栈
2. **使用 SYSTEM.md**：添加项目特定的指令
3. **安装相关 Skill**：如代码审查、调试等技能
4. **渐进式加载**：不要一次性让 Pi 读完所有文件

### Q5: 可以使用中文吗？

可以。Pi 本身没有语言限制，但：
- 模型对中文的理解能力取决于模型本身
- 建议使用对中文优化良好的模型（如 Qwen、Kimi）
- AGENTS.md 可以使用中文编写

### Q6: 如何报告问题或贡献代码？

```bash
# GitHub Issues
https://github.com/badlogic/pi-mono/issues

# Discord 社区
https://discord.gg/pi

# 贡献指南
https://github.com/badlogic/pi-mono/blob/main/CONTRIBUTING.md
```

---

## 附录

### A. 配置清单

```bash
# ~/.pi/agent/
├── settings.json        # 全局设置
├── models.json         # 自定义模型
├── SYSTEM.md           # 全局系统提示
├── AGENTS.md          # 全局指令
├── extensions/        # 扩展目录
├── skills/           # Skills 目录
└── prompts/          # Prompt Templates 目录
```

### B. 环境变量

| 变量 | 说明 |
|------|------|
| `ANTHROPIC_API_KEY` | Anthropic API Key |
| `OPENAI_API_KEY` | OpenAI API Key |
| `GOOGLE_API_KEY` | Google API Key |
| `PI_PROVIDER` | 默认提供商 |
| `PI_MODEL` | 默认模型 |
| `PI_SESSION_DIR` | 会话存储目录 |

### C. 相关资源

- 官网: https://pi.dev
- 文档: https://pi.dev/docs/latest
- GitHub: https://github.com/badlogic/pi-mono
- Discord: https://discord.gg/pi
- HuggingFace 数据集: https://huggingface.co/datasets/badlogicgames/pi-mono

---

*本手册基于 Pi v0.75+ 版本编写，最后更新于 2026 年 5 月。*
