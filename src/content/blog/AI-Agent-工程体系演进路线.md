---
title: "AI-Agent 工程体系演进路线"
date: 2026-08-06
---

# AI-Agent 工程体系演进路线

> [!TIP]
> 这些概念是现在很热门的词汇，并不代表有长期的生命力
> 对待这些概念需要了解，但不能迷信

**AI-Agent 工程体系** 演进路线重点看五个概念：

- **Prompt Engineering**
- **Context Engineering**
- **Harness Engineering**
- **Loop Engineering**
- **Graph Engineering**

它们是层层递进的关系，而是从“会回答问题”逐步走向“能长期、稳定、可治理地完成复杂软件任务”的演进过程。

> [!TIP]
> Prompt 解决“怎么说清楚”，Context 解决“知道什么”，Harness 解决“如何工作”，Loop 解决“如何自我修正”，Graph 解决“如何组织多步骤、多角色流转”。

## 1. 一张图看懂演进路线

```text
Prompt -> Context -> Harness -> Loop
                     |
                     +-> Graph
```

更准确地说：

- `Prompt` 是起点，负责把任务说清楚。
- `Context` 让 AI 不再只看一句话，而是理解项目背景。
- `Harness` 把 AI 纳入一个可管理的工程系统。
- `Loop` 让 AI 在“执行 -> 验证 -> 修复”中形成闭环。
- `Graph` 不是简单排在最后的一层，而是 AI-Agent 进入复杂协作阶段后，用来描述执行流的关键结构。

## 2. 第一阶段：Prompt Engineering

### 核心问题

> 如何把任务描述清楚，让 AI 一次性给出更高质量的输出？

这是最早期、也是最直观的 AI 使用方式。

普通提示：

```text
帮我写一个用户登录接口
```

优化后的提示：

```text
你是一名资深 Java 后端工程师。

请使用 Spring Boot 3 + MyBatis Plus 实现用户登录接口。

要求：
1. 使用 JWT 认证
2. 密码使用 BCrypt 加密
3. 做参数校验
4. 返回统一 Result 结构
5. 增加异常处理
```

### Prompt 工程关注什么

| 维度     | 说明         |
| -------- | ------------ |
| 角色     | 你是谁       |
| 任务     | 要完成什么   |
| 约束     | 不能做什么   |
| 上下文   | 当前任务背景 |
| 输出格式 | 要怎么呈现   |
| 示例     | 参考什么风格 |

### 局限性

Prompt 工程可以提升单次回答质量，但有天然边界：

- AI 不知道项目历史
- AI 不知道之前做过什么
- AI 不知道团队规范
- AI 不知道当前任务处于什么阶段

所以，当任务从“问一个问题”变成“持续开发一个系统”时，仅靠 Prompt 不够。

## 3. 第二阶段：Context Engineering

### 核心问题

> 如何让 AI 不只是理解一句话，而是理解整个项目环境？

Prompt 是一句指令，Context 是一组工作背景。

例如，在开发一个 CRM 系统时，与其只说：

```text
帮我开发客户跟进模块
```

不如把这些内容一起交给 AI：

```text
项目结构：

docs/
  ├── PRD.md
  ├── ARCHITECTURE.md
  ├── user_stories/
  ├── ADRs/
  └── tasks/

backend/
  └── tests/
frontend/
  └── tests/

技术栈：
Spring Boot 3
PostgreSQL
Redis
React

当前任务：
TASK-023 跟进记录自动提醒
```

### Context 工程解决什么

#### 1. 长期记忆

例如 `docs/ADRs/ADR-001-customer-state-machine.md`：

```text
ADR-001

Title:
客户状态机设计

Date:
2026-07-01

Decision:
客户状态采用有限状态机。

Context:
避免状态判断逻辑分散在多个服务中。
```

这样 AI 下次回来时，不会重新发明一套方案。

#### 2. 项目知识库

例如 `AGENTS.md`：

```text
规则：

修改数据库必须：
1. 创建 migration
2. 更新 schema
3. 添加测试
```

这相当于把团队规范变成 AI 可消费的工程规则。

#### 3. 当前任务上下文

例如 `docs/tasks/TASK-001.md`：

```text
目标：
实现登录

输入：
用户名和密码

输出：
JWT Token

验收：
自动化测试通过
```

### 局限性

Context 工程让 AI “知道得更多”，但它仍然往往只是一个被动执行者。

也就是说：

- 你给什么，它看什么
- 你问一步，它答一步
- 它还没有被纳入可持续的软件交付体系

于是就进入下一阶段。

## 4. 第三阶段：Harness Engineering

### 核心问题

> 如何把 AI 从“会做事的模型”升级为“可管理、可验证、可持续协作的工程 Agent”？

Harness 可以理解为“缰绳”或“工作控制系统”。

重点不再是“如何提示 AI”，而是“如何为 AI 设计一个可靠的工作环境”。

### Harness 的本质

如果说：

- `Prompt` 像告诉一个新人“你现在做什么”
- `Context` 像把项目资料交给他

那么 `Harness` 更像是给这个新人配齐：

- 工作制度
- 任务流转规则
- 检查点
- 状态记录
- 自动验证机制

### 一个典型的 Harness 项目

```text
project/
├── AGENTS.md
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── user_stories/
│   ├── ADRs/
│   └── tasks/
├── backend/
│   └── tests/
├── frontend/
│   └── tests/
├── feature_list.json
├── PROGRESS.md
└── scripts/
    ├── init.sh
    ├── test.sh
    └── run.sh
```

### 在 Harness 中，AI 如何工作

```text
读取 AGENTS.md
-> 读取 PRD / user_story / ADR / task
-> 修改代码
-> 执行测试脚本
-> 更新 PROGRESS.md
-> 输出结果
```

### Harness 解决什么

#### 1. 防止 AI“失忆”

依靠：

```text
PROGRESS.md
docs/ADRs/
docs/tasks/
```

#### 2. 防止 AI“乱改”

依靠：

```text
AGENTS.md
任务约束
自动化测试
```

#### 3. 支持长期任务

例如一个 CRM 项目持续开发半年，AI 每次回来都可以先读取：

```text
当前状态：
已完成客户管理、联系人管理

下一步：
开发销售机会评分
```

这样它就不是一次性的回答器，而是可持续协作的 Agent。

## 5. 第四阶段：Loop Engineering

### 核心问题

> 如何让 AI 不只是执行任务，而是在反馈中持续修正，直到达到目标？

Loop Engineering 的重点是闭环。

传统开发常常是线性的：

```text
需求 -> 编码 -> 测试 -> 人工检查 -> 发布
```

Loop 模式则是：

```text
需求
-> AI 规划
-> AI 编码
-> 自动测试
-> 分析失败原因
-> AI 修复
-> 再次测试
-> 直到通过
```

### 一个典型示例

任务：

```text
实现用户登录
```

第一次执行：

```text
写代码
```

测试返回：

```text
失败
原因：JWT 过期时间配置错误
```

随后 Agent 继续：

```text
修改代码
重新测试
直到通过
```

### Loop 工程依赖什么

#### 1. 自动测试

```text
mvn test
npm test
pytest
```

#### 2. 自动反馈

```text
test result
error log
coverage
```

#### 3. 状态管理

```text
TASK-001

status: implementing
test: failed
reason: jwt config error
```

### 本质变化

到这一步，AI 不再只是“帮你写代码”，而是开始具备“遇错修正、逐步收敛”的工程行为。

## 6. Graph Engineering：复杂 Agent 系统的执行结构

### 为什么 Graph 会出现

当 AI-Agent 的工作流越来越复杂时，流程就不再是简单直线，而更像一张图。

例如“开发 CRM 的退款审批功能”这类任务，真实过程往往是：

```text
需求分析
-> 架构检查
-> 任务拆解
-> 编码
-> 测试
-> 判断是否通过
   |- 通过 -> 提交
   |- 不通过 -> 修复 -> 回到测试
```

这已经不是单链路，而是多节点、多分支、多回路结构。

### Graph 的核心组成

Graph Engineering 把 Agent 工作流表示为：

- `Node`：谁来执行
- `Edge`：下一步去哪里
- `State`：共享状态是什么
- `Decision`：在什么条件下跳转

例如：

```text
PRD 分析 Agent
    ->
任务拆解 Agent
    ->
Coding Agent
    ->
Testing Agent
    ->
pass?
 |- yes -> Review / Merge
 |- no  -> Debug Agent -> 回到 Testing
```

### Graph 和 Harness 的关系

这里最容易混淆。

可以这样理解：

- `Harness` 是外部工程治理系统
- `Graph` 是内部执行流编排结构

也就是说：

- Harness 负责规定“AI 应该如何工作”
- Graph 负责定义“AI 下一步该由谁做、怎么流转”

关系可以表示为：

```text
Harness
  └── Graph
       └── Loop
```

这也是为什么 Graph 往往不是单独存在，而是嵌入在 Harness 中，服务于 Loop。

### 一个 Graph 示例

```yaml
nodes:
  - name: planner
    agent: requirement-agent
  - name: architect
    agent: architecture-agent
  - name: coder
    agent: coding-agent
  - name: tester
    agent: test-agent

edges:
  planner:
    next: architect
  architect:
    next: coder
  coder:
    next: tester
  tester:
    success:
      next: done
    failed:
      next: coder
```

这个配置本质上就是把“谁先做、失败后回哪一步”显式地工程化了。

## 7. 五个概念放在一起怎么看

### 从能力层级看

```text
Prompt Engineering
        ->
Context Engineering
        ->
Harness Engineering
        ->
Loop Engineering

Graph Engineering 作为执行流结构，通常嵌入 Harness，并支撑 Loop
```

### 从解决的问题看

| 概念    | 主要解决的问题             | 类比               |
| ------- | -------------------------- | ------------------ |
| Prompt  | 怎么把任务说清楚           | 沟通技巧           |
| Context | 怎么让 AI 知道背景         | 给新人做项目培训   |
| Harness | 怎么让 AI 在工程里可靠工作 | 项目管理体系       |
| Loop    | 怎么让 AI 自动纠错迭代     | 持续集成与反馈闭环 |
| Graph   | 怎么组织多角色、多步骤流转 | 工作流引擎         |

### 从软件公司的类比看

| 概念    | 对应公司里的什么           |
| ------- | -------------------------- |
| Prompt  | 领导下达的一条需求         |
| Context | 公司的知识库和历史资料     |
| Harness | 公司的制度、流程和协作规范 |
| Graph   | 组织内部的任务流转图       |
| Loop    | 复盘、质检和改进机制       |

## 8. 一个真实的 AI-Agent 工程落地路径

假设开发一个 CRM 系统，可以把整个过程理解为四步升级。

### 第一步：只有 Prompt

```text
设计客户跟进模块
```

结果通常是：AI 能给方案，但不了解你的真实项目。

### 第二步：加入 Context

把这些资料交给 AI：

```text
PRD.md
ARCHITECTURE.md
docs/user_stories/
docs/ADRs/
docs/tasks/
```

结果是：AI 开始理解业务、架构和历史决策。

### 第三步：建立 Harness

再加入：

```text
AGENTS.md
feature_list.json
PROGRESS.md
scripts/test.sh
```

结果是：AI 可以在明确规则下持续开发，而不是一次性回答。

### 第四步：引入 Loop 和 Graph

此时系统开始形成：

```text
任务拆解
-> 编码
-> 测试
-> 失败分析
-> 修复
-> 回归测试
```

如果进一步使用多个 Agent 协作，还会变成：

```text
Planner Agent
-> Task Agent
-> Coding Agent
-> Review Agent
-> Test Agent
-> Merge
```

这时，AI 才真正从“聊天机器人”演进为“软件工程 Agent 系统”。

## 9. PRD、Feature、TASK、PROGRESS 在这条路线中的位置

这是很多人研究 Harness 时最容易问到的问题。

推荐理解为：

```text
产品需求
-> PRD.md
-> Feature 拆解
-> feature_list.json
-> TASK 拆解
-> Agent 执行 TASK
-> Loop 验证
-> 更新 PROGRESS.md
```

它们分别承担不同职责：

- `PRD`：描述要做什么
- `Feature`：描述要拆成哪些能力块
- `TASK`：描述当前要执行的具体工作单元
- `PROGRESS`：描述当前做到哪里、下一步做什么

这四者共同构成了 Harness 的核心骨架。

## 10. 总结：AI-Agent 工程体系真正的竞争点

AI 软件开发的重点是设计出更合适的 **AI-Agent 工程体系**。

可以把全文收束成五句话：

- `Prompt` 是指令设计
- `Context` 是知识注入
- `Harness` 是工作系统
- `Loop` 是自动反馈闭环
- `Graph` 是执行流编排结构

> 一个由 Context、Harness、Graph、Loop 共同驱动的可持续 AI-Agent 软件工程系统
