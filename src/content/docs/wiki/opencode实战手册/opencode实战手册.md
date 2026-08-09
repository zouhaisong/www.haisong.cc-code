---
title: OpenCode 实战手册
date: 2026-05-01
tags: ["OpenCode", "AI编程", "Agent"]
summary: 基于 OpenCode 官方文档与 GitHub 仓库编写的全面使用指南，涵盖安装、配置、核心功能到高级配置与最佳实践。
publish: true
type: wiki
---

# OpenCode 实战手册

> 本手册基于 OpenCode 官方文档 ([opencode.ai/docs](https://opencode.ai/docs)) 和 GitHub 仓库编写，全面介绍 OpenCode 的安装、配置、使用方法和高级技巧。

## 目录

1. [概述](#1-概述)
2. [安装指南](#2-安装指南)
3. [快速开始](#3-快速开始)
4. [配置详解](#4-配置详解)
5. [核心功能使用](#5-核心功能使用)
6. [Provider 配置](#6-provider-配置)
7. [Agent 系统](#7-agent-系统)
8. [MCP 服务器](#8-mcp-服务器)
9. [LSP 语言服务器](#9-lsp-语言服务器)
10. [Rules 自定义指令](#10-rules-自定义指令)
11. [Skills 技能系统](#11-skills-技能系统)
12. [IDE 扩展](#12-ide-扩展)
13. [GitHub 集成](#13-github-集成)
14. [桌面应用](#14-桌面应用)
15. [高级配置](#15-高级配置)
16. [最佳实践](#16-最佳实践)
17. [常见问题](#17-常见问题)

---

## 1. 概述

### 1.1 什么是 OpenCode

**OpenCode** 是一款开源的 AI 编程助手（AI Coding Agent），由 Anomaly Innovations（原 SST 团队）开发。它提供终端界面（TUI）、桌面应用和 IDE 扩展三种使用方式，帮助开发者完成代码编写、调试、重构等任务。

| 项目信息 | |
|---|---|
| **GitHub** | [github.com/anomalyco/opencode](https://github.com/anomalyco/opencode) |
| **Stars** | 160,000+ |
| **Contributors** | 900+ |
| **月活开发者** | 7,500,000+ |
| **License** | MIT |
| **核心语言** | Go（CLI）/ TypeScript（TUI） |

### 1.2 核心特点

- **100% 开源**：MIT 许可证，代码完全开放
- **多 Provider 支持**：支持 75+ LLM 提供商，包括 Claude、GPT-4、Gemini、DeepSeek 等
- **开箱即用的 LSP**：内置语言服务器支持，自动加载正确的 LSP
- **多端适配**：终端 TUI、桌面应用、VS Code/IDE 扩展
- **客户端/服务器架构**：支持远程控制，可从手机驱动桌面上的 OpenCode
- **MCP 协议支持**：可扩展外部工具和服务
- **隐私优先**：默认不存储代码和对话上下文

### 1.3 与 Claude Code 的对比

| 对比项 | OpenCode | Claude Code |
|---|---|---|
| 开源性 | ✅ 100% 开源 | ❌ 闭源 |
| Provider | ✅ 不绑定任何提供商 | ❌ 仅限 Anthropic |
| LSP 支持 | ✅ 开箱即用 | ❌ 无 |
| 扩展性 | ✅ 插件/MCP/自定义工具 | 有限 |
| 增长势头 | 4.5x Claude Code 增速 | 较慢 |

---

## 2. 安装指南

### 2.1 前置要求

**终端模拟器**（推荐）：
- [WezTerm](https://wezterm.org/) - 跨平台
- [Alacritty](https://alacritty.org/) - 跨平台
- [Ghostty](https://ghostty.org/) - Linux/macOS
- [Kitty](https://sw.kovidgoyal.net/kitty/) - Linux/macOS
- Windows Terminal - Windows

**API 密钥**：至少需要一个 LLM 提供商的 API 密钥

### 2.2 通用安装（推荐）

```bash
curl -fsSL https://opencode.ai/install | bash
```

### 2.3 Node.js 生态安装

```bash
# npm
npm install -g opencode-ai

# bun
bun install -g opencode-ai

# pnpm
pnpm install -g opencode-ai

# yarn
yarn global add opencode-ai
```

### 2.4 macOS/Linux Homebrew 安装

```bash
# 推荐：官方 tap（更新最快）
brew install anomalyco/tap/opencode

# 官方 formula（更新较慢）
brew install opencode
```

### 2.5 Arch Linux 安装

```bash
sudo pacman -S opencode           # 稳定版
paru -S opencode-bin              # AUR 最新版
```

### 2.6 Windows 安装

**推荐：使用 WSL**

为获得最佳体验，Windows 用户推荐使用 WSL。

其他方式：
```bash
# Chocolatey
choco install opencode

# Scoop
scoop install opencode

# NPM
npm install -g opencode-ai

# Docker
docker run -it --rm ghcr.io/anomalyco/opencode
```

### 2.7 其他方式

- **Mise**: `mise use -g github:anomalyco/opencode`
- **二进制下载**: 从 [Releases](https://github.com/anomalyco/opencode/releases) 页面下载

---

## 3. 快速开始

### 3.1 首次配置

1. 在终端运行 `opencode`
2. 运行 `/connect` 命令进行身份验证
3. 选择 provider（推荐 OpenCode Zen）
4. 访问 [opencode.ai/auth](https://opencode.ai/auth) 登录并获取 API 密钥
5. 粘贴 API 密钥完成配置

### 3.2 初始化项目

```bash
cd /path/to/project
opencode
/init
```

执行 `/init` 后，OpenCode 会分析项目结构并在根目录创建 `AGENTS.md` 文件。

> **提示**：建议将 `AGENTS.md` 提交到 Git，它帮助 OpenCode 理解项目结构和编码模式。

### 3.3 基本使用示例

**提问**：
```
How is authentication handled in @packages/functions/src/api/index.ts
```
使用 `@` 键可以在项目中模糊搜索文件。

**添加功能**：
```
When a user deletes a note, we'd like to flag it as deleted in the database.
Then create a screen that shows all the recently deleted notes.
From this screen, the user can undelete a note or permanently delete it.
```

**Tab 键切换模式**：
- **Plan 模式**：禁用修改功能，仅建议实现方案
- **Build 模式**：允许实际修改代码

**撤销修改**：
```
/undo    # 撤销
/redo    # 重做
```

**分享会话**：
```
/share   # 创建分享链接
```

---

## 4. 配置详解

### 4.1 配置文件

OpenCode 使用 JSONC（带注释的 JSON）配置文件，支持多级配置优先级。

**配置优先级**（从高到低）：

| 优先级 | 位置 | 说明 |
|---|---|---|
| 1 | `--config` 标志 | 通过命令行指定 |
| 2 | `.opencode/opencode.json` | 项目配置 |
| 3 | `~/.config/opencode/opencode.json` | 全局配置 |
| 4 | 远程配置 | 从服务器获取 |

### 4.2 完整配置结构

```jsonc
{
  // TUI 设置
  "tui": {
    "theme": "opencode"
  },

  // 服务器设置
  "server": {
    "port": 8080
  },

  // 工具设置
  "tools": {
    "bash": {
      "enabled": true
    }
  },

  // 模型设置
  "models": {
    "default": "anthropic/claude-sonnet-4-20250514",
    "big": "anthropic/claude-sonnet-4-20250514",
    "fast": "anthropic/claude-3-5-haiku-latest"
  },

  // 代理设置
  "agents": {
    "default": "default"
  },

  // 自定义命令
  "commands": {},

  // 提供商设置
  "providers": {},

  // LSP 设置
  "lsp": {},

  // MCP 服务器
  "mcp": {
    "servers": {}
  },

  // 权限
  "permissions": {
    "auto_approve": []
  },

  // 快捷键
  "keybinds": {},

  // 其他
  "disabled_providers": [],
  "custom_instructions": ""
}
```

### 4.3 环境变量

配置值支持环境变量替换：

- `$VAR` - 引用环境变量 VAR
- `${VAR}` - 同上
- `${VAR:-default}` - 如果 VAR 未设置，使用默认值

### 4.4 命令行参数

```bash
# 指定配置文件
opencode --config /path/to/config.json

# 指定工作目录
opencode --cwd /path/to/project

# 详细输出
opencode --verbose

# 版本信息
opencode --version
```

---

## 5. 核心功能使用

### 5.1 文件引用

在提示中使用 `@` 键模糊搜索项目文件：
```
How is authentication handled in @packages/functions/src/api/index.ts
```

引用指定文件的特定行：
```
@File#L37-42
```

### 5.2 计划模式（Plan Mode）

按 **Tab** 键切换到 Plan 模式，该模式下：
- 禁用代码修改功能
- 仅生成实现计划和建议
- 适合在实施前确认方案

### 5.3 构建模式（Build Mode）

再次按 **Tab** 键切换回 Build 模式，允许实际修改代码。

### 5.4 图像支持

可以通过拖放方式将图像添加到提示中，OpenCode 会扫描图像内容并结合上下文处理。

### 5.5 会话管理

```
/undo    # 撤销上次修改
/redo    # 重做
/share   # 生成分享链接
/clear   # 清除当前会话
```

---

## 6. Provider 配置

### 6.1 主要提供商

OpenCode 支持 75+ LLM 提供商，主要包括：

| 提供商 | 模型 | 环境变量 |
|---|---|---|
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus | `ANTHROPIC_API_KEY` |
| **OpenAI** | GPT-4o, GPT-4 Turbo, GPT-3.5 | `OPENAI_API_KEY` |
| **Google** | Gemini 1.5 Pro, Gemini 1.5 Flash | `GOOGLE_API_KEY` |
| **DeepSeek** | DeepSeek Coder | `DEEPSEEK_API_KEY` |
| **AWS Bedrock** | 多种模型（IAM 认证） | `AWS_ACCESS_KEY_ID` |
| **Azure OpenAI** | Azure 托管的 GPT 模型 | `AZURE_OPENAI_API_KEY` |
| **Ollama** | 本地 LLaMA, Mistral, CodeLlama | `OLLAMA_HOST` |
| **Groq** | 高速推理 | `GROQ_API_KEY` |
| **Mistral** | Mistral Large, Codestral | `MISTRAL_API_KEY` |
| **Together AI** | 开源模型组合 | `TOGETHER_API_KEY` |
| **OpenRouter** | 多提供商统一 API | `OPENROUTER_API_KEY` |

### 6.2 配置示例

```jsonc
{
  "providers": {
    "anthropic": {
      "apiKey": "$ANTHROPIC_API_KEY"
    },
    "openai": {
      "apiKey": "$OPENAI_API_KEY",
      "baseUrl": "https://api.openai.com/v1"
    },
    "ollama": {
      "baseUrl": "http://localhost:11434"
    }
  }
}
```

### 6.3 使用 Claude Pro / ChatGPT Plus

```bash
# 使用 Anthropic 账号登录（Claude Pro/Max）
opencode auth login anthropic

# 使用 OpenAI 账号登录（ChatGPT Plus/Pro）
opencode auth login openai
```

### 6.4 OpenCode Zen

[OpenCode Zen](https://opencode.ai/zen) 是官方精选的模型列表，经过 OpenCode 团队测试和验证，专门针对编码任务优化。

---

## 7. Agent 系统

### 7.1 Agent 类型

OpenCode 预定义了 4 种 Agent：

| Agent | 用途 | 默认模型 |
|---|---|---|
| `coder` | 主编码助手 | claude-sonnet-4 |
| `summarizer` | 会话摘要 | claude-sonnet-4 |
| `task` | 子任务执行 | claude-sonnet-4 |
| `title` | 会话标题生成 | - |

### 7.2 Agent 配置

```jsonc
{
  "agents": {
    "coder": {
      "model": "anthropic/claude-sonnet-4-20250514",
      "maxTokens": 8192,
      "reasoningEffort": "high"
    }
  }
}
```

### 7.3 自定义 Agent

可以创建自定义 Agent 配置文件：

```jsonc
{
  "agents": {
    "my-agent": {
      "model": "anthropic/claude-3-5-sonnet-20241022",
      "maxTokens": 16384
    }
  }
}
```

---

## 8. MCP 服务器

### 8.1 MCP 概述

MCP（Model Context Protocol）允许 OpenCode 连接外部工具和服务。OpenCode 支持本地和远程 MCP 服务器。

### 8.2 本地 MCP 服务器

```jsonc
{
  "mcp": {
    "servers": {
      "my-server": {
        "command": "npx",
        "args": ["-y", "@my/mcp-server"],
        "env": {
          "API_KEY": "xxx"
        }
      }
    }
  }
}
```

### 8.3 远程 MCP 服务器

```jsonc
{
  "mcp": {
    "servers": {
      "remote-server": {
        "type": "http",
        "url": "https://mcp.example.com/server",
        "headers": {
          "Authorization": "Bearer xxx"
        }
      }
    }
  }
}
```

### 8.4 预置 MCP 服务器

| MCP 服务器 | 说明 |
|---|---|
| **Sentry** | 错误跟踪和监控 |
| **Context7** | 代码上下文增强 |
| **Grep by Vercel** | 代码搜索 |

### 8.5 MCP OAuth 配置

```jsonc
{
  "mcp": {
    "servers": {
      "oauth-server": {
        "type": "http",
        "url": "https://mcp.example.com",
        "auth": {
          "type": "oauth",
          "clientId": "xxx",
          "clientSecret": "xxx",
          "authUrl": "https://example.com/oauth/authorize",
          "tokenUrl": "https://example.com/oauth/token"
        }
      }
    }
  }
}
```

---

## 9. LSP 语言服务器

### 9.1 LSP 概述

OpenCode 内置对 LSP（Language Server Protocol）的支持，自动为 LLM 加载正确的语言服务器，提供：
- 智能代码补全
- 悬停文档
- 诊断信息
- 跳转到定义

### 9.2 LSP 配置

```jsonc
{
  "lsp": {
    "typescript": {
      "enabled": true,
      "command": "typescript-language-server",
      "args": ["--stdio"]
    },
    "python": {
      "enabled": true,
      "command": "pylsp"
    }
  }
}
```

### 9.3 VSCode LSP MCP

可以通过 MCP 方式访问 VSCode 的 LSP 功能：

```jsonc
{
  "mcp": {
    "servers": {
      "vsc-lsp": {
        "command": "npx",
        "args": ["-y", "vsc-lsp-mcp"]
      }
    }
  }
}
```

### 9.4 LSP 操作

通过 LSP 可以执行以下操作：

| 操作 | 说明 |
|---|---|
| `hover` | 获取悬停信息（文档、类型等） |
| `definition` | 获取符号定义位置 |
| `declaration` | 获取声明位置 |
| `implementation` | 获取实现位置 |
| `references` | 查找所有引用 |
| `completions` | 智能代码补全建议 |
| `rename` | 重命名符号 |

---

## 10. Rules 自定义指令

### 10.1 Rules 概述

Rules 允许自定义 AI 助手的行为，通过规则文件指定项目特定的编码规范、约束和指令。

### 10.2 规则文件位置

- 项目级：`.opencode/rules/` 或 `AGENTS.md` 中的 `---rules` 部分
- 全局级：`~/.opencode/rules/`

### 10.3 规则文件格式

```markdown
# 项目编码规范

## 命名规范
- 变量使用 camelCase
- 常量使用 UPPER_SNAKE_CASE
- 类名使用 PascalCase

## 代码风格
- 使用 2 空格缩进
- 总是使用 const，避免 var
- 优先使用箭头函数

## 提交规范
- 使用 Conventional Commits 格式
- 示例: feat: add login functionality
```

### 10.4 多规则组合

可以在 `AGENTS.md` 中指定多个规则文件：

```markdown
---
rules:
  - .opencode/rules/typescript.md
  - .opencode/rules/git-commits.md
---
```

---

## 11. Skills 技能系统

### 11.1 Skills 概述

Skills 允许定义专门的技能、工作流程和知识库，供 Agent 在需要时调用。这是 OpenCode 从 v1.0.190 开始内置支持的功能。

### 11.2 Skills 目录结构

```
.opencode/skills/
└── my-skill/
    ├── SKILL.md           # 必需：技能定义
    ├── scripts/          # 可选：辅助脚本
    │   └── helper.py
    └── references/        # 可选：参考文档
        └── api-docs.md
```

### 11.3 SKILL.md 格式

```yaml
---
name: my-skill
description: A custom skill that helps with specific tasks (min 20 chars)
license: MIT
allowed-tools:
  - read
  - write
metadata:
  version: "1.0"
---

# My Custom Skill

This skill helps you accomplish specific tasks.

## Instructions

1. First, do this
2. Then, do that
3. Finally, verify the results
```

### 11.4 全局 Skills

将技能放在 `~/.opencode/skills/` 或 `~/.config/opencode/skills/` 可在所有项目中全局使用。

### 11.5 技能调用

Agent 会根据上下文自动调用相关技能，也可以手动触发：

```
Use the @skills_my-skill to accomplish this task.
```

---

## 12. IDE 扩展

### 12.1 VS Code 扩展

**官方扩展**：[OpenCode - VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sst-dev.opencode)

**功能**：
- `Cmd+Esc` (Mac) / `Ctrl+Esc` (Windows/Linux)：快速启动
- `Cmd+Shift+Esc` (Mac) / `Ctrl+Shift+Esc` (Windows/Linux)：新会话
- 自动分享当前选择或标签页
- `Cmd+Option+K` (Mac) / `Alt+Ctrl+K`：插入文件引用

**安装**：
1. 在 VS Code 集成终端运行 `opencode`
2. 扩展会自动检测并安装

### 12.2 第三方扩展

| 扩展 | 说明 |
|---|---|
| [OpenCode GUI](https://marketplace.visualstudio.com/items?itemName=TanishqKancharla.opencode-vscode) | 侧边栏聊天界面 |
| [bascodes opencode](https://github.com/bascodes/vscode-opencode) | 多 Provider 支持 |

### 12.3 Cursor/Windsurf/VSCodium

官方扩展兼容所有 VS Code 分支，只需在集成终端运行 `opencode` 即可。

### 12.4 编辑器配置

如果想在 TUI 中使用 IDE 编辑器：

```bash
export EDITOR="code --wait"
```

---

## 13. GitHub 集成

### 13.1 GitHub 集成概述

OpenCode 可以集成到 GitHub 工作流中，在 Issue 和 Pull Request 中使用。

**触发方式**：在评论中提及 `/opencode` 或 `/oc`

### 13.2 功能

- **Issue Triage**：让 OpenCode 分析和解释 Issue
- **Fix and Implement**：修复 Issue 或实现功能，自动创建分支和 PR
- **安全**：OpenCode 在 GitHub Runner 内部运行

### 13.3 快速安装

```bash
opencode github install
```

这会引导完成 GitHub App 安装、workflow 创建和 secrets 配置。

### 13.4 手动配置

1. 安装 GitHub App：[github.com/apps/opencode-agent](https://github.com/apps/opencode-agent)

2. 添加 Workflow 文件到 `.github/workflows/opencode.yml`：

```yaml
name: opencode

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  opencode:
    if: |
      contains(github.event.comment.body, '/oc') ||
      contains(github.event.comment.body, '/opencode')
    runs-on: ubuntu-latest
    permissions:
      id-token: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v6
        with:
          fetch-depth: 1
          persist-credentials: false

      - name: Run OpenCode
        uses: anomalyco/opencode/github@latest
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        with:
          model: anthropic/claude-sonnet-4-20250514
```

3. 在仓库 Settings 中添加 API 密钥到 Secrets

### 13.5 支持的事件

| 事件 | 说明 |
|---|---|
| `schedule` | 定时任务 |
| `pull_request` | PR 事件 |
| `issues` | Issue 事件 |

### 13.6 自定义 Prompt

可以通过环境变量自定义 OpenCode 的行为：

```yaml
env:
  OPENCODE_INSTRUCTIONS: |
    You are a code review bot.
    Always check for security issues.
```

---

## 14. 桌面应用

### 14.1 概述

OpenCode 桌面应用已推出 Beta 版，支持 macOS、Windows 和 Linux。

### 14.2 安装

从 [opencode.ai/download](https://opencode.ai/download) 下载对应平台的安装包。

### 14.3 功能

- 原生桌面体验
- 独立窗口管理
- 与终端版功能一致
- 支持所有 Provider 和配置

---

## 15. 高级配置

### 15.1 主题配置

```jsonc
{
  "tui": {
    "theme": "catppuccin_mocha"
  }
}
```

可用主题：
- `opencode`（默认）
- `breeze`
- `catppuccin_mocha`
- `catppuccin_latte`
- `dracula`
- `nord`
- `tokyo_night`
- `one_dark`
- `solarized_dark`
- `solarized_light`
- `gruvbox_dark`

### 15.2 快捷键配置

```jsonc
{
  "keybinds": {
    "toggle-plan": "tab",
    "undo": "cmd+u",
    "share": "cmd+s"
  }
}
```

### 15.3 Formatter 配置

```jsonc
{
  "formatter": {
    "enabled": true,
    "config": {
      "prettier": {
        "semi": false,
        "singleQuote": true
      }
    }
  }
}
```

### 15.4 权限配置

```jsonc
{
  "permissions": {
    "auto_approve": [
      "bash:git status",
      "bash:npm test"
    ]
  }
}
```

### 15.5 网络配置

**代理设置**：
```bash
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
export NO_PROXY=localhost,127.0.0.1
```

**自定义 CA 证书**：
```bash
export NODE_EXTRA_CA_CERTS=/path/to/ca-certificates.crt
```

### 15.6 企业配置

```jsonc
{
  "enterprise": {
    "sso": {
      "enabled": true,
      "provider": "saml"
    },
    "audit": {
      "enabled": true,
      "endpoint": "https://audit.example.com"
    }
  }
}
```

---

## 16. 最佳实践

### 16.1 项目初始化

1. 进入项目目录并运行 `opencode`
2. 执行 `/init` 让 OpenCode 分析项目结构
3. 将生成的 `AGENTS.md` 提交到 Git
4. 根据需要创建 `.opencode/rules/` 规则文件

### 16.2 有效提问

**好示例**：
```
我正在开发一个电商网站，需要在购物车页面添加一个"一键清空"功能。
参考 @src/components/Cart.tsx 的现有代码结构，
参考 @src/api/cart.ts 的 API 调用方式，
实现一个功能：点击后弹出确认对话框，确认后清空购物车。
```

**避免**：
- 过于模糊："帮我写个购物车功能"
- 缺少上下文："清空购物车怎么做"

### 16.3 Plan/Build 模式使用

- **Plan 模式**：适合复杂功能、架构调整、需要确认的场景
- **Build 模式**：适合简单修改、小功能、你已经清楚要什么的情况

### 16.4 文件组织

```
project/
├── .opencode/
│   ├── opencode.json      # 项目配置
│   ├── rules/            # 规则文件
│   │   ├── coding-style.md
│   │   └── git-commits.md
│   └── skills/           # 技能文件
│       └── my-skill/
│           └── SKILL.md
└── AGENTS.md             # 项目说明（提交到 Git）
```

### 16.5 安全建议

- 不将 API 密钥直接写在配置文件中，使用环境变量
- 生产环境考虑使用本地模型或私有 Provider
- 敏感项目使用 `--cwd` 明确指定工作目录

### 16.6 性能优化

- 大型项目使用 `.opencodeignore` 排除无关目录
- 定期清理会话历史：`/clear`
- 合理使用上下文窗口，避免一次性加载过多内容

---

## 17. 常见问题

### Q1: OpenCode 是免费的吗？

OpenCode 本身是开源且免费的，但你需要支付所使用的 LLM Provider 的 API 费用。OpenCode Zen 提供精选模型的订阅服务。

### Q2: 支持哪些操作系统？

- macOS（推荐）
- Linux
- Windows（推荐使用 WSL）
- Docker

### Q3: 如何切换模型？

使用 `/model` 命令或修改配置文件：
```
/model anthropic/claude-3-5-sonnet-20241022
```

### Q4: 如何禁用某些 Provider？

```jsonc
{
  "disabled_providers": ["openai"]
}
```

### Q5: 遇到问题如何反馈？

- GitHub Issues: [github.com/anomalyco/opencode/issues](https://github.com/anomalyco/opencode/issues)
- 官方 Discord: 加入 OpenCode 社区

### Q6: 如何更新 OpenCode？

```bash
# 使用安装脚本
curl -fsSL https://opencode.ai/install | bash

# 使用 npm
npm install -g opencode-ai

# 使用 Homebrew
brew upgrade anomalyco/tap/opencode
```

### Q7: 支持本地模型吗？

是的，通过 Ollama 支持本地模型：
```bash
# 配置 Ollama
export OLLAMA_HOST=localhost:11434

# 在 OpenCode 中使用
/model ollama/llama3
```

### Q8: 如何查看调试信息？

```bash
opencode --verbose
```

或在配置中启用：
```jsonc
{
  "debug": true
}
```

---

## 参考资源

- 官方网站：[opencode.ai](https://opencode.ai)
- 官方文档：[opencode.ai/docs](https://opencode.ai/docs)
- GitHub 仓库：[github.com/anomalyco/opencode](https://github.com/anomalyco/opencode)
- OpenCode Zen：[opencode.ai/zen](https://opencode.ai/zen)
- VS Code 扩展：[marketplace.visualstudio.com/items?itemName=sst-dev.opencode](https://marketplace.visualstudio.com/items?itemName=sst-dev.opencode)
