---
title: 编程智能体 Codex 实战手册
date: 2026-05-01
tags: ["Codex", "AI编程", "Agent"]
summary: OpenAI 推出的云端软件工程智能体 Codex 全面指南，覆盖安装配置、核心概念、AGENTS.md 配置、MCP、Skills 到企业级集成。
publish: true
type: wiki
---

# 编程智能体 Codex 实战手册

## 目录

- [第一章 Codex 概述](#第一章-codex-概述)
  - [1.1 什么是 Codex](#11-什么是-codex)
  - [1.2 Codex 的发展历程](#12-codex-的发展历程)
  - [1.3 Codex 与传统编程工具的区别](#13-codex-与传统编程工具的区别)
- [第二章 安装与配置](#第二章-安装与配置)
  - [2.1 系统要求](#21-系统要求)
  - [2.2 CLI 安装](#22-cli-安装)
  - [2.3 IDE 插件安装](#23-ide-插件安装)
  - [2.4 认证配置](#24-认证配置)
  - [2.5 配置文件详解](#25-配置文件详解)
- [第三章 核心概念](#第三章-核心概念)
  - [3.1 Prompt 与指令](#31-prompt-与指令)
  - [3.2 Threads 线程](#32-threads-线程)
  - [3.3 Context 上下文管理](#33-context-上下文管理)
  - [3.4 Sandbox 沙箱环境](#34-sandbox-沙箱环境)
- [第四章 AGENTS.md 配置指南](#第四章-agentsmd-配置指南)
  - [4.1 AGENTS.md 简介](#41-agentsmd-简介)
  - [4.2 指令链发现机制](#42-指令链发现机制)
  - [4.3 全局配置](#43-全局配置)
  - [4.4 项目级配置](#44-项目级配置)
  - [4.5 最佳实践](#45-最佳实践)
- [第五章 Model Context Protocol (MCP)](#第五章-model-context-protocol-mcp)
  - [5.1 MCP 简介](#51-mcp-简介)
  - [5.2 MCP 服务器配置](#52-mcp-服务器配置)
  - [5.3 常用 MCP 服务器](#53-常用-mcp-服务器)
- [第六章 Skills 技能封装](#第六章-skills-技能封装)
  - [6.1 Skills 简介](#61-skills-简介)
  - [6.2 创建自定义 Skill](#62-创建自定义-skill)
  - [6.3 Skill 作用域](#63-skill-作用域)
- [第七章 Subagents 多智能体协作](#第七章-subagents-多智能体协作)
  - [7.1 Subagent 简介](#71-subagent-简介)
  - [7.2 并行工作流程](#72-并行工作流程)
  - [7.3 自定义 Agent](#73-自定义-agent)
- [第八章 实战工作流程](#第八章-实战工作流程)
  - [8.1 代码理解](#81-代码理解)
  - [8.2 Bug 修复](#82-bug-修复)
  - [8.3 重构与迁移](#83-重构与迁移)
  - [8.4 测试驱动开发](#84-测试驱动开发)
  - [8.5 代码审查](#85-代码审查)
- [第九章 最佳实践](#第九章-最佳实践)
  - [9.1 提示词编写](#91-提示词编写)
  - [9.2 复杂任务处理](#92-复杂任务处理)
  - [9.3 团队协作](#93-团队协作)
  - [9.4 安全与权限控制](#94-安全与权限控制)
- [第十章 企业级应用](#第十章-企业级应用)
  - [10.1 团队配置管理](#101-团队配置管理)
  - [10.2 CI/CD 集成](#102-cicd-集成)
  - [10.3 成功案例](#103-成功案例)

---

## 第一章 Codex 概述

### 1.1 什么是 Codex

Codex 是 OpenAI 开发的云端软件工程智能体，基于专门优化的 GPT 系列模型，能够在多种编程语言和框架中执行复杂的编码任务。[^1]

Codex 的核心定位是一个**编程智能体**，而非简单的代码补全工具。它可以：

- 读取和理解代码库结构
- 编写和修改代码文件
- 执行命令和运行测试
- 修复 Bug 和进行代码审查
- 自动化重构和迁移

Codex 有多种使用形态：
- **CLI 命令行版本**：通过终端交互
- **IDE 插件**：集成在 VS Code、Cursor 等编辑器
- **云端版本**：通过 ChatGPT Web 界面访问
- **桌面客户端**：独立的桌面应用

### 1.2 Codex 的发展历程

Codex 的发展经历了多个重要里程碑：

| 时间 | 事件 |
|------|------|
| 2021年7月 | OpenAI 发表论文 "Evaluating Large Language Models Trained on Code" |
| 2021年8月 | 发布 Codex API，驱动 GitHub Copilot |
| 2025年4月 | 发布 Codex CLI（开源，轻量级终端编码智能体） |
| 2025年5月 | 正式推出云端 AI 编程智能体 Codex |
| 2025年9月 | 发布 GPT-5-Codex 专用优化模型 |
| 2025年10月 | Codex 正式全面开放，新增 Slack 集成和 SDK |

自 2025年8月以来，Codex 日均使用量增长超过 10 倍。GPT-5-Codex 在发布后三周内已处理超过 **40 万亿个字符**，成为 OpenAI 增长最快的产品之一。[^2]

### 1.3 Codex 与传统编程工具的区别

| 特性 | 传统 IDE 补全 | GitHub Copilot | Codex |
|------|-------------|---------------|-------|
| 交互方式 | 被动补全 | 被动补全 | 主动 Agent |
| 任务执行 | 单行/函数级 | 单行/函数级 | 多文件、跨模块 |
| 上下文理解 | 当前文件 | 当前文件 | 整个代码库 |
| 工具调用 | 无 | 无 | 文件读写、命令执行、测试运行 |
| 自主能力 | 低 | 低 | 高 |
| 可配置性 | 低 | 中 | 高 |

**核心区别**：Codex 不只是"帮你写代码"的工具，而是一个能理解项目上下文、执行 Shell 命令、运行测试、自动修复 Bug 的编程 Agent。[^3]

---

## 第二章 安装与配置

### 2.1 系统要求

| 要求 | 详情 |
|------|------|
| 操作系统 | macOS 12+, Ubuntu 20.04+/Debian 10+, Windows 11 (需 WSL2) |
| Node.js | 版本 22 或更高 |
| Git | 版本 2.23+ (推荐) |
| 内存 | 最低 4GB (推荐 8GB+) |

### 2.2 CLI 安装

#### npm 全局安装（推荐）

```bash
npm install -g @openai/codex
```

#### Homebrew 安装（macOS/Linux）

```bash
brew install codex
```

#### 二进制文件安装

访问 [GitHub Releases](https://github.com/openai/codex/releases/latest) 下载对应平台的二进制文件：

| 平台 | 文件名 |
|------|--------|
| macOS (Apple Silicon) | `codex-aarch64-apple-darwin.tar.gz` |
| macOS (Intel) | `codex-x86_64-apple-darwin.tar.gz` |
| Linux (x86_64) | `codex-x86_64-unknown-linux-musl.tar.gz` |
| Linux (arm64) | `codex-aarch64-unknown-linux-musl.tar.gz` |

#### 验证安装

```bash
codex --version
```

### 2.3 IDE 插件安装

Codex 支持主流 IDE：

- **VS Code**：在扩展市场搜索 "Codex"
- **Cursor**：内置支持
- **JetBrains 系列**：通过插件市场安装

安装后，IDE 侧边栏会出现 Codex 对话窗口。

### 2.4 认证配置

#### 方式一：ChatGPT 账号登录（推荐）

运行 `codex` 后选择 **Sign in with ChatGPT**，支持以下计划：

- ChatGPT Plus
- ChatGPT Pro
- ChatGPT Team
- ChatGPT Edu
- ChatGPT Enterprise

#### 方式二：API Key 配置

```bash
# Linux/macOS
export OPENAI_API_KEY="sk-your-api-key-here"

# Windows PowerShell
$env:OPENAI_API_KEY="sk-your-api-key-here"
```

永久配置（添加到 `~/.bashrc` 或 `~/.zshrc`）：

```bash
echo 'export OPENAI_API_KEY="sk-your-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

### 2.5 配置文件详解

Codex 配置文件位于 `~/.codex/config.toml`。

#### 基础配置示例

```toml
model = "gpt-5-codex"
model_provider = "openai-chat-completions"

[model_providers.openai-chat-completions]
name = "OpenAI"
base_url = "https://api.openai.com/v1"
env_key = "OPENAI_API_KEY"
```

#### 审批模式配置

```toml
# 可选值: auto, suggest, full-auto
approval_policy = "auto"
```

| 模式 | 说明 |
|------|------|
| `auto` | 默认模式，读取文件自动执行，修改文件需确认 |
| `suggest` | 只读建议，不执行任何操作 |
| `full-auto` | 全自动模式，执行所有操作无需确认 |

#### 沙箱模式配置

```toml
# 可选值: read-only, sandboxed, danger-full-access
sandbox_mode = "sandboxed"
```

#### 子代理配置

```toml
[agents]
max_threads = 6        # 最大并发线程数
max_depth = 1          # 嵌套深度
job_max_runtime_seconds = 1800  # 单任务超时
```

---

## 第三章 核心概念

### 3.1 Prompt 与指令

Codex 的效果直接取决于给出的指令质量。一个高质量的 Prompt 应包含四个核心部分：

#### Prompt 四要素结构

```markdown
目标：明确你想要改变什么、构建什么

上下文：关联的文件、文件夹、错误信息或示例，可用 @ 符号提及特定文件

约束：必须遵守的架构规则、安全要求、编码规范

完成条件：明确判定标准
```

#### 示例对比

**较差的 Prompt：**
```
帮我优化代码。
```

**优秀的 Prompt：**
```
目标：修复订单详情页刷新后偶尔白屏的问题。

上下文：
- 相关目录可能在 apps/web/src/pages/orders 和 apps/api/src/orders
- 后端接口已经支持 status 参数
- 现有筛选组件可能在 apps/web/src/components/filters

约束：
- 不要新增 UI 库
- 不要修改数据库 schema
- 不要改变现有接口返回结构
- 优先做最小改动
- 修改前先给我计划

完成标准：
1. 用户可以按 pending / paid / canceled 筛选订单
2. 相关测试用例通过
3. 本地验证通过
```

### 3.2 Threads 线程

一个 **线程 (Thread)** 表示一个独立的会话，包括你的提示、模型输出和所有后续的工具调用。

#### 本地线程 vs 云端线程

| 特性 | 本地线程 | 云端线程 |
|------|---------|---------|
| 运行位置 | 本地机器 | 云端沙箱 |
| 文件访问 | 读取本地文件 | 读取云端环境 |
| 命令执行 | 本地终端 | 云端容器 |
| 网络访问 | 视配置而定 | 通常禁用 |

#### 线程管理命令

| 命令 | 功能 |
|------|------|
| `/new` | 新建会话 |
| `/compact` | 压缩历史，释放 Token |
| `/undo` | 撤销上一步 |

### 3.3 Context 上下文管理

#### 上下文构建

Codex 通过以下方式构建上下文：

1. **项目结构**：扫描目录树
2. **AGENTS.md**：加载项目规则
3. **对话历史**：保持连续性
4. **文件引用**：通过 `@` 符号引用

#### 推理级别选择

| 级别 | 适用场景 |
|------|---------|
| 低 | 简单任务，如生成工具函数 |
| 中/高 | 复杂代码改动、调试 Bug |
| 极高 | 长时间复杂任务，如设计分布式方案 |

### 3.4 Sandbox 沙箱环境

Codex CLI 在沙箱环境中运行，提供细粒度的安全控制。

#### 沙箱模式

| 模式 | 文件读取 | 文件写入 | 命令执行 | 网络访问 |
|------|---------|---------|---------|---------|
| `read-only` | ✅ | ❌ | 仅读命令 | ❌ |
| `sandboxed` | ✅ | ✅ | 白名单命令 | 受限 |
| `danger-full-access` | ✅ | ✅ | 所有命令 | 受限 |

#### 文件访问控制

可通过配置限制访问特定目录：

```toml
[sandbox]
allowed_directories = ["/home/user/project"]
blocked_patterns = ["**/.env", "**/secrets/**"]
```

---

## 第四章 AGENTS.md 配置指南

### 4.1 AGENTS.md 简介

`AGENTS.md` 是 Codex 的项目级指令文件，在每次启动时自动读取，用于定义项目规范、工作流程和约束条件。[^4]

#### 与普通文档的区别

- 自动加载：每次新会话都会读取
- 分层叠加：支持全局 + 项目 + 子目录配置
- 持久化：一次编写，长期生效

### 4.2 指令链发现机制

Codex 按以下优先级顺序构建指令链：

```
1. 全局层: ~/.codex/AGENTS.override.md 或 ~/.codex/AGENTS.md
2. 项目层: 从仓库根到当前目录，每层检查 AGENTS.override.md → AGENTS.md → 备用文件名
3. 合并顺序: 从根到当前目录拼接，后面的覆盖前面的
```

#### 示例目录结构

```
~/.codex/AGENTS.md              # 全局个人习惯
repo/AGENTS.md                  # 项目通用规范
repo/services/payments/
repo/services/payments/AGENTS.override.md  # 支付模块特殊规则
```

### 4.3 全局配置

#### 创建全局 AGENTS.md

```bash
mkdir -p ~/.codex
```

创建 `~/.codex/AGENTS.md`：

```markdown
# ~/.codex/AGENTS.md

## 工作约定

- 修改 JavaScript 文件后始终运行 `npm test`
- 安装依赖时优先使用 `pnpm`
- 添加新的生产依赖前先征求确认

## 个人偏好

- 使用 TypeScript strict 模式
- 提交前运行 lint 检查
```

### 4.4 项目级配置

#### 仓库根目录配置

在项目根目录创建 `AGENTS.md`：

```markdown
# AGENTS.md

## 仓库通用约定

- 打开 Pull Request 前运行 `npm run lint`
- 修改行为时在 `docs/` 中记录变化
- 使用 conventional commits 格式提交

## 构建命令

- 安装: `pnpm install`
- 开发: `pnpm dev`
- 测试: `pnpm test`
- 构建: `pnpm build`

## 架构约束

- 不允许直接操作数据库，使用 ORM 层
- API 响应遵循 RESTful 规范
- 禁止提交敏感信息到版本控制
```

#### 子目录覆盖

在 `services/payments/AGENTS.override.md`：

```markdown
# services/payments/AGENTS.override.md

## payments 服务规则

- 使用 `make test-payments`，不要使用 `npm test`
- 轮换 API key 前必须先通知安全频道
- 涉及支付逻辑的改动需要双人审查
```

### 4.5 最佳实践

#### AGENTS.md 应该写什么

**适合写入的内容：**
- 项目使用的包管理器、测试命令、构建命令
- 修改代码后必须执行的验证步骤
- 不能触碰的目录、密钥、生成文件
- 团队约定的代码风格和提交前检查
- 特定子目录的例外规则

**不适合写入的内容：**
- 一次性 bug 细节
- 当前需求独有的临时要求
- 普通项目文档（应放在 README.md）

#### 最小可用模板

```markdown
# AGENTS.md

## 项目约定

- 使用 bun 安装依赖，不要改用 npm 或 pnpm
- 修改文档后运行 `bun run docs:build`
- 不要读取或提交 `.env`、凭证文件、生成目录

## 工作方式

- 开始前先确认需求边界
- 每次只改和当前任务直接相关的文件
- 完成前说明验证命令和结果
```

#### 维护建议

1. **渐进式完善**：先写最核心的启动、测试、约束
2. **错误驱动**：当 Codex 犯同一个错误第二次，把规则补进去
3. **避免过长**：如果文件超过 32KB，把部分内容拆到独立文档

---

## 第五章 Model Context Protocol (MCP)

### 5.1 MCP 简介

Model Context Protocol (MCP) 是连接 AI 模型与外部工具和上下文的开放标准，使 Codex 能够访问第三方文档或与浏览器、Figma 等开发工具交互。[^5]

### 5.2 MCP 服务器配置

#### CLI 方式添加

```bash
# 添加 STDIO 服务器
codex mcp add context7 -- npx -y @upstash/context7-mcp

# 添加 Streamable HTTP 服务器
codex mcp add remote-server --url https://example.com/mcp --bearer-token-env-var MY_TOKEN
```

#### config.toml 配置

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]

[mcp_servers.remote_api]
url = "https://api.example.com/mcp"
bearer_token_env_var = "REMOTE_API_TOKEN"
```

#### 环境变量配置

```toml
[mcp_servers.my_server]
command = "npx"
args = ["-y", "mcp-server"]
# 转发环境变量
env_vars = ["API_KEY", "DATABASE_URL"]
```

### 5.3 常用 MCP 服务器

| 服务器 | 用途 |
|--------|------|
| @upstash/context7-mcp | 开发者文档搜索 |
| @modelcontextprotocol/server-filesystem | 文件系统操作 |
| @modelcontextprotocol/server-github | GitHub API 集成 |
| @modelcontextprotocol/server-slack | Slack 消息通知 |

---

## 第六章 Skills 技能封装

### 6.1 Skills 简介

Skills 是将可复用工作流打包的模块，包含指令、脚本和参考资料，使 Codex 能够可靠地遵循特定工作流程。[^6]

#### 核心价值

- **扩展能力**：为 Codex 注入特定领域专业知识
- **提升效率**：避免重复输入相同指令
- **保持一致性**：确保任务执行标准化

#### 渐进式加载机制

1. **启动阶段**：仅加载技能名称和描述
2. **按需加载**：实际使用时才加载完整 SKILL.md
3. **高效运行**：仅在使用时消耗 Token

### 6.2 创建自定义 Skill

#### 标准目录结构

```
my-skill/
├── SKILL.md              # 必需：指令和元数据
├── scripts/              # 可选：辅助脚本
├── references/           # 可选：参考文档
└── assets/               # 可选：资源文件
```

#### SKILL.md 模板

```yaml
---
name: systematic-debugging
description: 系统化调试流程：复现问题→缩小范围→定位根因→验证修复
---

## 触发条件

用户提到 bug、报错、异常、调试、定位问题时自动调用

## 执行步骤

1. 确认复现步骤与环境
2. 二分法缩小问题范围
3. 定位根因（日志/堆栈/依赖）
4. 给出修复方案并验证
```

#### 创建方式

**方式一：使用 Skill Creator**

```
$skill-creator
```

**方式二：直接对话创建**

```
请创建一个 Skill，以后我给你网页项目时，先检查移动端排版、按钮样式、文字层级、颜色规范，最后输出修改文件和结果。
```

### 6.3 Skill 作用域

| 作用域 | 路径 | 建议用途 |
|--------|------|---------|
| SYSTEM | Codex 内置 | 通用技能 |
| ADMIN | /etc/codex/skills | 系统级共享 |
| USER | ~/.codex/skills | 个人技能 |
| REPO | $REPO_ROOT/.codex/skills | 项目通用 |
| REPO | $CWD/.codex/skills | 当前目录专用 |

#### 同名 Skill 处理

同名 Skill 不会合并，两者都会出现在技能选择器中。

---

## 第七章 Subagents 多智能体协作

### 7.1 Subagent 简介

Subagent 是 Codex 的多智能体协作功能，能够并行启动多个专业代理同时工作，最后汇总结果返回。[^7]

#### 解决的问题

| 问题 | 解决方案 |
|------|---------|
| 上下文污染 | 中间输出隔离在子线程 |
| 串行效率低 | 任务并行处理 |
| 角色冲突 | 专职代理各司其职 |

#### 内置 Agent 类型

| Agent | 用途 |
|-------|------|
| default | 通用兜底 |
| worker | 干活型，负责实现和修复 |
| explorer | 读代码型，专注代码库探索 |

### 7.2 并行工作流程

#### 基本用法

```markdown
请帮我审查当前 PR（本分支 vs main）的以下几个方面，请为每个审查点派生一个独立的 Agent 并行工作，等待它们全部完成后，汇总每个点的审查结果：

1. 安全漏洞
2. 代码质量
3. 潜在 Bug
4. 竞态条件
5. 测试用例的稳定性
```

#### 交互命令

| 命令 | 功能 |
|------|------|
| `/agent` | 切换 Agent 线程 |
| `/new` | 新建主线程 |

### 7.3 自定义 Agent

#### Agent 文件格式

在 `~/.codex/agents/` 或 `.codex/agents/` 目录创建 TOML 文件：

```toml
name = "security-reviewer"
description = "安全审查专家，专注于发现安全漏洞"
developer_instructions = """
你是安全审查专家。审查时关注：
1. SQL 注入风险
2. XSS 漏洞
3. 权限控制问题
4. 敏感信息泄露

每次审查必须：
- 指出具体文件和行号
- 说明风险等级
- 提供修复建议
"""

# 可选配置
sandbox_mode = "read-only"
max_runtime_seconds = 300
```

#### 配置参数

| 参数 | 类型 | 说明 |
|------|------|------|
| name | string | 必需，Agent 名称 |
| description | string | 必需，描述触发条件 |
| developer_instructions | string | 核心指令 |
| sandbox_mode | string | 沙箱模式覆盖 |
| model | string | 指定模型 |
| mcp_servers | array | 启用的 MCP 服务器 |

---

## 第八章 实战工作流程

### 8.1 代码理解

#### 典型任务

- 定位功能的核心逻辑
- 梳理模块间关系
- 追踪数据流
- 生成架构文档

#### 示例 Prompt

```
这个仓库中的认证逻辑是在哪里实现的？

总结请求如何从入口点流向响应的全过程。

哪些模块与 [模块名] 交互，故障是如何处理的？
```

#### 最佳实践

> "修复 bug 时，我用 Ask 模式查看代码库中还有哪些地方可能出现同样的问题。"
> —— 性能工程师

### 8.2 Bug 修复

#### 推荐流程

1. **复现问题**：提供错误信息和复现步骤
2. **分析定位**：让 Codex 定位根因
3. **修复验证**：最小改动 + 补充测试
4. **回归检查**：确保没有引入新问题

#### 示例 Prompt

```
目标：修复用户登录后偶尔跳回首页的问题。

上下文：
- 登录逻辑在 src/auth
- 路由守卫在 src/router
- 错误日志见 logs/login-error.log

约束：
- 不要改数据库结构
- 不要重写登录流程
- 只修复当前跳转问题

完成标准：
1. 登录后能回到原访问页面
2. 相关测试通过
3. 本地验证通过
```

### 8.3 重构与迁移

#### 适用场景

- 跨多文件的模式更新
- 依赖升级
- 代码清理
- 架构优化

#### 示例 Prompt

```
将这个文件按关注点拆分为独立模块，并为每个模块生成测试。

将所有基于回调的数据库访问转换为 async/await 模式。
```

#### 成功案例

> "Codex 把所有旧的 `getUserById()` 换成了新服务模式并打开了 PR，几分钟完成了本应花费数小时的工作。"
> —— 后端工程师

### 8.4 测试驱动开发

#### Codex 在测试中的价值

- 为新代码生成单元测试
- 识别边界条件
- 补充缺失测试
- 修复失败的测试

#### 示例 Prompt

```
为这个函数生成单元测试，覆盖以下边界条件：
1. 空输入
2. 最大长度输入
3. 异常状态

确保所有测试都通过。
```

#### 最佳实践

> "我让 Codex 在夜间处理低覆盖率的模块，第二天来就有完整的测试套件。"
> —— 前端工程师

### 8.5 代码审查

#### 审查维度

| 维度 | 检查点 |
|------|--------|
| 正确性 | 逻辑错误、边界条件 |
| 安全性 | 注入风险、权限控制 |
| 性能 | 复杂度、资源使用 |
| 可维护性 | 代码风格、文档 |
| 测试 | 覆盖率、边界覆盖 |

#### 示例 Prompt

```
请审查当前分支相对于 main 的以下方面：
1. 安全问题
2. 代码质量
3. Bug
4. 竞态条件
5. 测试稳定性

等待全部完成后，汇总每项的审查结果。
```

---

## 第九章 最佳实践

### 9.1 提示词编写

#### 四要素结构

一个完整的任务描述应包含：

```markdown
目标：明确你想要改变什么、构建什么

上下文：关联的文件、错误信息、历史实现

约束：架构规则、安全要求、编码规范

完成条件：明确的判定标准
```

#### 常见错误

| 错误 | 改正 |
|------|------|
| "帮我优化代码" | 提供具体目标和约束 |
| "修复登录问题" | 说明问题现象和环境 |
| 假设 Codex 知道项目 | 引用相关文件和目录 |

### 9.2 复杂任务处理

#### Plan 模式

对于复杂任务，先让 Codex 制定计划：

```
先不要写代码。请先阅读相关文件，给出你的理解、修改计划、风险点和验证方式。等我确认后再开始实现。
```

#### 任务分解

```
对于大型变更，使用 Ask 模式先生成实现计划，这个计划会成为后续 Code 模式对话的输入。
```

### 9.3 团队协作

#### 共享 AGENTS.md

```markdown
# 项目 AGENTS.md

## 团队规范

- 所有 PR 需要至少 1 人审查
- 提交前运行本地测试
- 使用 feature branch 工作流

## 代码风格

- 遵循 ESLint 配置
- TypeScript strict 模式
- 组件使用函数式风格
```

#### 权限分级

| 场景 | 推荐模式 |
|------|---------|
| 日常开发 | `auto` |
| 审查代码 | `suggest` |
| 自动化脚本 | `full-auto` |

### 9.4 安全与权限控制

#### 敏感信息保护

```markdown
# AGENTS.md

## 禁止事项

- 不读取 .env 或凭证文件
- 不提交 secrets 到版本控制
- 不在日志中输出敏感数据
```

#### 沙箱配置

```toml
[sandbox]
allowed_directories = ["/home/user/project"]
blocked_patterns = ["**/.env", "**/secrets/**", "**/credentials/**"]
```

---

## 第十章 企业级应用

### 10.1 团队配置管理

#### 集中式配置

```toml
# /etc/codex/config.toml (系统级)
[agents]
max_threads = 6
max_depth = 1

[sandbox]
default_mode = "sandboxed"
```

#### 项目级覆盖

```toml
# 项目 .codex/config.toml
[agents]
max_threads = 10  # 项目可适当提高

[sandbox]
default_mode = "danger-full-access"  # 开发环境开放
```

### 10.2 CI/CD 集成

#### GitHub Actions

```yaml
name: Codex Review
on: [pull_request]

jobs:
  codex-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Codex Review
        run: |
          npx -y @openai/codex exec "审查这个 PR 的安全问题、代码质量和潜在 bug，汇总结果"
```

#### 非交互模式

```bash
# 全自动执行
codex --approval-mode full-auto "运行测试并修复失败用例"

# 只读审查
codex --approval-mode suggest "审查代码质量问题"
```

### 10.3 成功案例

#### 案例一：金融科技公司

| 指标 | 改进 |
|------|------|
| 开发周期 | 21天 → 48小时 |
| 错误率 | 减少 92% |
| 人力成本 | 释放 80% 工程师时间 |

#### 案例二：零售供应链

| 指标 | 改进 |
|------|------|
| 系统稳定性 | 每周3次崩溃 → 99.9% 可用 |
| 响应速度 | 4小时 → 15分钟 |
| 自主开发 | 85% 规则变更由业务人员完成 |

#### 案例三：OpenAI 内部

- 几乎所有工程师日常使用 Codex
- 每周合并的 PR 增加 70%
- Codex 自动审核几乎所有 PR

---

## 附录

### 常用命令速查

| 命令 | 功能 |
|------|------|
| `codex` | 启动交互式会话 |
| `codex "prompt"` | 单次执行 |
| `codex --version` | 查看版本 |
| `codex --help` | 帮助信息 |

### Slash 命令

| 命令 | 功能 |
|------|------|
| `/new` | 新建会话 |
| `/init` | 初始化 AGENTS.md |
| `/compact` | 压缩上下文 |
| `/model` | 切换模型 |
| `/approvals` | 设置审批模式 |
| `/status` | 查看状态 |
| `/skills` | 管理技能 |
| `/mcp` | 管理 MCP 服务器 |

### 配置参考

完整配置示例参见 `~/.codex/config.toml`：

```toml
model = "gpt-5-codex"
model_provider = "openai-chat-completions"
approval_policy = "auto"
sandbox_mode = "sandboxed"

[agents]
max_threads = 6
max_depth = 1

[model_providers.openai-chat-completions]
name = "OpenAI"
base_url = "https://api.openai.com/v1"
env_key = "OPENAI_API_KEY"
```

---

## 参考资料

[^1]: [OpenAI Codex 官方介绍](https://openai.com/index/introducing-codex/)
[^2]: [Codex 全面开放公告](https://openai.com/index/codex-now-generally-available/)
[^3]: [Codex 完全指南：核心概念详解](https://blog.csdn.net/roamingcode/article/details/158386279)
[^4]: [Codex AGENTS.md 官方文档](https://developers.openai.com/codex/guides/agents-md)
[^5]: [Codex MCP 配置文档](https://developers.openai.com/codex/mcp)
[^6]: [Codex Skills 官方指南](https://developers.openai.com/codex/skills)
[^7]: [Codex Subagents 官方文档](https://developers.openai.com/codex/subagents)
