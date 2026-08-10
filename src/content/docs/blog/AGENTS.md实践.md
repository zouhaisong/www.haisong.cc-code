---
title: "AGENTS.md实践"
date: 2026-08-10
excerpt: "针对上下文工程中的 AGENTS.md 实践，核心原则是保持文件简洁且不超过 200 行。文章构建了组织级、项目级与模块级三级管理框架，明确编码、架构及安全规范，并通过具体示例界定适用范围与修改约束。最终强调在实施完成后必须执行测试与校验，并同步更新任务状态，以保障 AI 开发流程的严谨性。"
tags:
  - 编码规范
  - 架构规范
  - 安全规范
  - 引用团队级规范
  - 适用范围
---

# AGENTS.md实践

相关知识点：“Harness Engineering 里面的“上下文工程（Context Engineering）”

**总体原则：保持AGENTS.md简洁，不要超过200行。**

[[AGENTS.md介绍]]

## AGENTS.md分级

```
组织级（公司或者团队） 放在 ~/.codex/AGENTS.md
    ↓
项目级， 放在 project/AGENTS.md
    ↓
模块级， project/backend/AGENTS.md
```

## 组织级 AGENTS.md管理

- 创建独立的代码仓库 team-ai-agent-guidelines/

```txt
├── AGENTS.md
│
├── coding/
│    ├── java.md
│    ├── react.md
│    └── database-design.md
│    └── database-migration.md
├── security/
│    ├── secure-coding.md
│
├── architecture/
│    ├── microservice.md
│
└── templates/
     ├── ADR.md
     ├── Epic.md
     ├── UserStory.md
     └── Task.md
```

- 保持AGENTS.md简洁，在AGENTS.md中引用其他文件

```markdown
# XX团队编码规范

## 所有AI开发必须遵循：

1. 编码规范
2. 架构规范
3. 安全规范

## 编码规范

java项目遵循 @coding/java.md
react项目遵循 @coding/react.md
数据库设计遵循 @coding/database-design.md
数据库升级遵循 @coding/database-migration.md

## 架构规范

微服务设计准许 @architecture/microservice.md

## 安全规范

安全编码遵循 @security/secure-coding.md
支付安全规范 @security/payment-security.md
```

## 项目级引用团队级规范

示例：CRM项目/AGENTS.md

```markdown
## 引用团队级规范

本项目后端遵循团队级java规范 @team-ai-agent-guidelines/coding/java.md
本项目前端遵循团队级react规范 @team-ai-agent-guidelines/coding/react.md
本项目无支付功能，**不遵循**支付安全规范 @security/payment-security.md
```

## 项目级AGENTS.md结构

```txt
project/
├── AGENTS.md
│
├── docs/
│    ├── AGENTS.md
│    ├── user_stories/
│    └── ADRs/
│
├── backend/
│    ├── AGENTS.md
│    └── tests/
│         └── AGENTS.md
│
├── frontend/
│    ├── AGENTS.md
│    └── tests/
│         └── AGENTS.md
```

## AGENTS.md示例1 - 项目级AGENTS.md

根目录的AGENTS.md

```markdown
# AGENTS.md

## 适用范围

本文件适用于当前仓库根目录及全部子目录。

## 修改约束

- 不要执行破坏性 Git 命令
- 不要随意新增第三方依赖
- 修改前优先阅读 README 和接口定义

## 编码规则

- 后端保持现有分层结构
- 公共方法命名要与现有风格一致
- 关键逻辑变更后补充最小必要测试

## 输出要求

- 先说明改动思路，再实施修改
- 输出中明确列出变更文件
- 提交信息使用 Conventional Commits 风格
```

## AGENTS.md示例2 - 模块级AGENTS.md

- backend/AGENTS.md

```markdown
## 适用范围

本文件适用于当前仓库backend目录及全部子目录。

## 后端

必须：

- Controller直接引用Service层，Service层引用Repository层，Repository层操作数据库

禁止：

- Controller直接引用Repository层

## Database

必须:

- 使用数据库结构迁移脚本

禁止:

- 直接连接生产数据库
- 禁止产生多对多关联，多对多关联必须拆分成一个一对多关联和一个多对一关联，并且关联表必须有业务含义，有自己的主键

推荐:

- repository pattern
```

## AGENTS.md示例3 - 工作流

- 处理一项任务

```markdown
## Scope

When receiving a task, follow the workflow below:

## Task Execution

When receiving a task:
Step 1
Read: TASK.md

Step 2
Inspect: related code

Step 3
Propose the core design

Step 4
Implement

Step 5
Test
Run tests, lint checks, and other validations after implementation is complete

Step 6
Update task status in `TASK.md`
```
