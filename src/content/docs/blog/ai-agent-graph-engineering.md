---
title: "ai-agent-graph-engineering"
date: 2026-08-09
excerpt: "AI Agent Graph Engineering 旨在解决复杂多智能体系统的控制流显式化问题，通过将系统建模为包含节点、边和共享上下文的状态图，实现分支、回环与持久化。核心在于利用显式状态机替代简单链式结构，构建包含状态模式、节点边设计及运行时的工程骨架。该模式适用于多阶段、需人工干预或高合规要求的场景，能构建可运行、可追踪、可治理的整体流程。"
tags:
  - 定义
  - 核心结论
  - 2. Nodes
  - 3. Edges
  - 2. 有局部重试
---

# ai-agent-graph-engineering

## 定义

`AI Agent Graph Engineering` 不是简单地“把多个 agent 连起来”，而是把一个复杂 agent 系统显式建模为**状态图**或**控制流图**：

- 节点表示可命名的工作单元
- 边表示状态跃迁或路由规则
- 图状态表示系统在整个执行过程中的共享上下文
- 图运行时负责分支、回环、暂停、恢复、并行与持久化

如果说 loop engineering 关注的是“单个闭环如何反复工作”，那么 graph engineering 关注的是“多个闭环、多个阶段、多个角色如何组成一个可治理的整体流程”。

它的核心不是让 agent 更像人，而是让系统结构更像一个可审计、可恢复、可演化的业务流程控制面。

## 核心结论

### 1. Graph engineering 解决的是复杂控制流显式化

很多 agent 系统在早期都能靠一个 `while` 循环或一个大 prompt 勉强工作，但一旦进入真实业务场景，就会出现下面几类需求：

- 不同条件走不同路径
- 某些步骤需要重试，某些步骤不能重试
- 某些节点必须人工审批
- 某些子任务可以并行
- 某些状态要持久化，数小时后继续
- 某些失败要回退到特定节点，而不是整个流程重来

这些需求本质上不是“提示词优化”问题，而是**控制流建模**问题。Graph engineering 的价值，就是把这些本来藏在 prompt、if-else 和临时代码里的逻辑，提升为显式的系统结构。

### 2. Graph 比 loop 更适合表达“多阶段、多分支、多角色”

Loop 的基本单位是“做一步，再决定下一步”；Graph 的基本单位是“在多个节点之间做状态跃迁”。

因此：

- loop 更像一个局部执行器
- graph 更像一个总控调度器

一个成熟的 agent 系统往往不是二选一，而是：

- 图的每个节点内部可能运行一个 loop
- 图负责决定这些 loop 何时开始、何时切换、何时暂停、何时汇合

所以可以把 graph engineering 理解为：**对 loops 的更高一层编排工程**。

### 3. Graph engineering 的价值不在“多 agent”，而在“显式状态机”

不少人把 graph engineering 等同于 multi-agent orchestration，这只说对了一半。

真正关键的不是 agent 数量，而是流程是否被建模成：

- 有类型的 state
- 有命名的 nodes
- 有明确的 edges
- 有可解释的 route function
- 有持久化和恢复点
- 有可追踪的执行轨迹

即使只有一个 agent，只要它需要经过“检索 -> 判断证据是否足够 -> 不足则再检索 -> 足够则生成 -> 高风险则人工审核 -> 审核后输出”这样的流程，它就已经更适合 graph，而不再只是一个简单 loop。

## Graph 的最小工程骨架

一个可落地的 agent graph，至少包含 5 个基本构件：

### 1. State Schema

这是 graph engineering 的第一性对象。

`State` 不只是“聊天历史”，而是整个执行系统的共享状态。常见字段包括：

- 用户输入
- 当前阶段
- 中间结果
- 检索证据
- 工具输出
- 风险评分
- 错误计数
- 重试次数
- 审批状态
- 最终产物

好的 graph 系统里，状态应尽量类型化、字段化，而不是全部塞进自由文本。

### 2. Nodes

Node 是图中的工作单元。一个 node 最好满足三个特征：

- 语义独立
- 输入输出清晰
- 值得在 trace、审计日志和重试策略里单独出现

一个简单判断标准是：

如果某一步值得被单独观察、单独重试、单独统计或单独审批，它就应该成为一个 node。

### 3. Edges

Edge 表示节点之间的跃迁关系，通常分成两类：

- `Unconditional edge`：固定流转
- `Conditional edge`：根据当前 state 决定下一跳

真正体现 graph engineering 水平的，通常不是 node 本身，而是 route 逻辑是否明确、稳定、可解释。

### 4. Runtime

Graph 不是静态图纸，而是一个运行时系统。成熟 runtime 通常要支持：

- conditional routing
- retries
- interrupts
- checkpoints
- resume
- streaming
- tracing
- parallel fan-out / fan-in

这也是为什么 LangGraph 这类框架的价值主要不在“多一个 DSL”，而在“提供长流程 agent 的控制平面”。

### 5. Observability

没有可观测性，图只会比 loop 更难调试。

至少应记录：

- 走过哪些节点
- 每次路由为什么这样决定
- 哪些状态字段发生了变化
- 哪一步失败
- 为什么重试
- 人工在哪个点介入
- 最终在哪个条件下终止

图越复杂，observability 越不是附属品，而是主体设计。

## Graph 与 Loop 的关系

最容易混淆的地方，是把 graph 和 loop 写成同一个东西。

更准确的关系应该是：

- `Loop engineering` 解决局部闭环执行
- `Graph engineering` 解决全局结构编排

可以把它们理解成两个层级：

### 1. Loop 是局部控制单元

例如一个“检索不足就再搜一轮”的 evidence loop，本质上是 loop。

### 2. Graph 是上层调度结构

例如：

- 先做问题分类
- 再进入不同子流程
- 某条子流程内部执行检索 loop
- 之后进入风险评估节点
- 高风险时暂停等待人工审批
- 审批通过后恢复执行

这整个东西更适合建成 graph。

一句话说：

`loop 负责反复做对，graph 负责把不同的“做对方式”组织成系统。`

## 为什么图比链或 DAG 更合适

很多人一开始会用 chain 或普通 workflow，但真实 agent 运行一段时间后会发现不够用。

原因在于 graph 往往同时支持：

- 回环
- 条件分支
- 状态持久化
- 中断恢复
- 并行汇合

而普通线性链更适合：

- 固定顺序
- 短流程
- 无需恢复
- 无需复杂状态跃迁

因此，graph engineering 的关键判断不在于“流程是不是多步”，而在于“流程是否具有复杂状态跃迁特征”。

## 什么时候应该上 graph

下面这些信号一旦同时出现 2 到 3 个以上，通常就值得把系统上升为 graph：

### 1. 路径不是固定的

系统需要按条件进入不同节点，而不是一直顺序执行。

### 2. 有局部重试

失败后只想重跑某个阶段，而不是整条链重来。

### 3. 有人工暂停点

例如审批、升级、复核、确认。

### 4. 需要长时间挂起后恢复

例如工单升级后几个小时再继续。

### 5. 有多个 specialist 或 subagent

不同角色负责不同子问题，需要 supervisor 或路由器进行编排。

### 6. 有并行子任务

例如同时检索多个来源、并行评估多个候选方案，再汇总结果。

### 7. 合规和审计要求高

需要明确知道“系统为什么走到这里”。

## 节点设计原则

graph 最大的设计错误，通常不是框架选错，而是 node 切分错。

推荐遵守以下原则：

### 1. 按产品事件切节点

好的节点边界往往对应真实业务事件，例如：

- schema lookup
- retrieve evidence
- grade evidence
- generate draft
- validate result
- request approval
- resume after approval

如果一个步骤对产品行为有意义，它通常就值得成为 node。

### 2. Route function 保持小而明确

路由逻辑最好只做“状态判断”，不要承担大段业务生成逻辑。

错误做法是：

- 在 route function 里隐藏复杂 prompt 推理
- 用大量隐式规则决定下一跳

正确做法是：

- 先由节点产出结构化判断信号
- 再由路由器基于该信号做简单选择

### 3. Node 尽量幂等

因为 graph 系统常常涉及重试、恢复、重复执行。节点如果副作用不透明，会让恢复逻辑非常脆弱。

### 4. 副作用节点与判断节点分离

例如“是否应该发送邮件”与“真正发送邮件”最好拆开。这样失败、重试、审计都会更清晰。

## 状态设计原则

graph engineering 的成败，往往 60% 取决于 state schema。

### 1. 把共享状态做薄，而不是做乱

共享 state 不是越大越好。应只放“跨节点确实要共享”的内容。

### 2. 区分控制状态与业务状态

建议至少分成两类：

- `Control state`：当前节点、重试次数、审批状态、暂停标志、错误码
- `Domain state`：用户请求、证据、摘要、分析结果、最终结论

### 3. 为路由保留显式字段

不要让路由器去解析一大段自然语言。应该提前写入结构化字段，例如：

- `risk_level`
- `needs_human_review`
- `evidence_quality`
- `retry_count`
- `task_status`

### 4. 为恢复保留足够上下文

如果一个流程会暂停数小时后恢复，state 必须足以支持继续，而不是要求系统重新猜测前情。

## 常见图模式

### 1. Router Pattern

先分类，再分流到不同 specialist 或子流程。

适合：

- 多领域问答
- 多工单类型处理
- 多策略执行入口

### 2. Retry / Repair Pattern

执行后先验证，失败则回到修复节点或重新规划节点。

适合：

- SQL 生成
- 代码修复
- 检索纠偏

### 3. HITL Pattern

在高风险节点 `interrupt`，等待人工输入，再 `resume`。

适合：

- 审批
- 合规
- 医疗/法律/HR 高风险场景

### 4. Supervisor Pattern

由一个 supervisor 根据 state 把任务分配给不同 specialist。

适合：

- 研究、写作、分析、审校分工
- 多 agent 协作系统

### 5. Fan-out / Fan-in Pattern

并行跑多个节点，再在 join 节点汇总。

适合：

- 多来源检索
- 多候选方案生成
- 多评分器评估

## 高质量 graph 的六个工程原则

### 1. 路由规则必须显式

分支条件应该写进 state 或 route function，而不是藏在 prompt 里。

### 2. Pause / Resume 是一等公民

凡是涉及人工审核或外部等待的系统，都应把暂停与恢复当作主路径设计，而不是异常分支。

### 3. 检查点必须能支撑故障恢复

checkpoint 的价值不是“方便调试”，而是进程挂掉、服务重启、任务迁移后仍能继续执行。

### 4. 图要服务业务契约，而不是追求漂亮结构

不是所有流程都值得建成复杂图。结构是为业务控制需求服务的。

### 5. 图上每条边都要可解释

如果一条边走过去之后，团队说不清楚“为什么走这里”，那它就是坏边。

### 6. 优先把高风险节点显式化

审批、支付、发送、删除、升级、对外承诺这类动作，必须在图里清楚可见。

## 典型失效模式

### 1. Graph 过度设计

把简单线性流程也拆成复杂图，最终维护成本高于收益。

### 2. 节点过粗

一个节点包掉大量逻辑，图看似简单，实则把复杂度重新藏回黑箱。

### 3. 节点过细

每一步都拆成节点，导致图噪声过大、状态频繁跳转、调试体验很差。

### 4. 路由依赖自由文本

route function 靠解析长段自然语言决策，导致路径不稳定、难测试。

### 5. 无恢复能力的“假持久化”

虽然记录了日志，但 state 不足以 resume，本质上还是一次性流程。

### 6. 多 agent 无总控

多个 specialist 同时存在，但没有统一 state 和路由规则，最后变成互相污染上下文的聊天群。

## 推荐设计顺序

如果从零设计一个 agent graph，推荐按下面顺序推进：

1. 先画出核心状态跃迁
2. 再定义 state schema
3. 再切 node 边界
4. 再写 route 规则
5. 再补 checkpoint / interrupt / retry
6. 最后才选框架或写 prompt

这比一开始就画“agent 拓扑图”更有效，因为 graph engineering 的本质不是连线，而是控制流建模。

## 与 LangGraph 的关系

当前关于 graph engineering 的主流实践，很多都落在 LangGraph 这一类框架上，但 graph engineering 本身不等于某个框架。

从官方定义看，LangGraph 更准确的定位是：

- 低层 orchestration runtime
- 用于 long-running、stateful agents
- 强项在 durable execution、human-in-the-loop、persistence、streaming 和 tracing

这说明它解决的是**图运行时问题**，而不是替你决定业务图应该怎么设计。

换句话说：

- LangGraph 提供的是控制平面能力
- Graph engineering 决定的是你的系统结构是否合理

## 一个实用判断标准

评估一个 agent graph 是否成熟，可以直接问 8 个问题：

1. state schema 是否清晰且结构化
2. 每个 node 是否有明确职责
3. 路由规则是否显式可测
4. 是否支持局部重试而非全局重跑
5. 是否支持暂停与恢复
6. 是否能解释任意一次状态跃迁
7. 是否有关键节点的审计轨迹
8. 是否真的比线性流程更合适

如果前 7 项里有 3 项以上回答不清楚，这通常还不是 graph engineering，只是把复杂 if-else 画成了框图。

## 参考来源

- [LangGraph overview](https://docs.langchain.com/oss/python/langgraph/overview)
- [Graph-Based Agentic AI with LangGraph: Workflow Pathways for Long-Running Stateful Business Processes](https://arxiv.org/html/2607.19297v1)
- [Building a Stateful IT Service Desk Agent with LangGraph on Amazon EKS](https://aws.amazon.com/blogs/opensource/building-a-stateful-it-service-desk-agent-with-langgraph-on-amazon-eks/)
- [Build multi-agent systems with LangGraph and Amazon Bedrock](https://aws.amazon.com/blogs/machine-learning/build-multi-agent-systems-with-langgraph-and-amazon-bedrock/)
- [Build reliable multi-agent applications with ADK Go 2.0](https://developers.googleblog.com/announcing-adk-go-20/)

## 一句话判断

`AI agent graph engineering` 的本质，是把复杂 agent 系统的状态、节点、分支、暂停、恢复和协作方式显式建模成一个可运行、可追踪、可治理的状态图系统。
