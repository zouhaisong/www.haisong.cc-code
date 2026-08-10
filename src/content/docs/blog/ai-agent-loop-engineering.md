---
title: "ai-agent-loop-engineering"
date: 2026-08-09
excerpt: "不是“把提示词写得更好”，而是把模型放进一个可重复执行、可观测、可终止、可纠错的运行闭环中。 核心对象不再是单次回答，而是整条执行轨迹： 读取当前状态 选择下一步动作 调用工具或执行操作 获取外部反馈 判断是否继续、回退、反思或停止 因此，真正决定 agent 上限的，往往不是模型本身，而是环路外面的工程脚手架：目标定义、工具接口、验证器、上下文管理、记忆系统、预算控制与安全边界。 Prompt…"
tags:
  - 定义
  - 核心结论
  - 最小工程骨架
  - 1. Goal
  - 典型失效模式
---

# ai-agent-loop-engineering

## 定义

`AI Agent Loop Engineering` 不是“把提示词写得更好”，而是把模型放进一个可重复执行、可观测、可终止、可纠错的运行闭环中。

核心对象不再是单次回答，而是整条执行轨迹：

1. 读取当前状态
2. 选择下一步动作
3. 调用工具或执行操作
4. 获取外部反馈
5. 判断是否继续、回退、反思或停止

因此，真正决定 agent 上限的，往往不是模型本身，而是环路外面的工程脚手架：目标定义、工具接口、验证器、上下文管理、记忆系统、预算控制与安全边界。

## 核心结论

### 1. Loop 比 Prompt 更接近真实工程对象

Prompt engineering 的关注点是“这一轮怎么说”；loop engineering 的关注点是“下一轮为什么还能继续做对”。

在复杂任务里，单轮输出是否完美并不关键，关键是系统能否：

- 发现错误
- 获得外部证据
- 在下一轮修正策略
- 在满足完成条件时稳定退出

这也是 ReAct、Reflexion、Plan-and-Execute 这类模式持续有效的原因。

### 2. 最小可用 agent loop 本质上是 `Observe -> Think -> Act -> Verify`

从工程视角看，一个最小可用 loop 不需要“多智能”，但必须完整：

- `Observe`：读取文件、网页、数据库、测试结果、系统状态
- `Think`：决定当前最值得做的一步
- `Act`：执行工具调用、代码修改、API 请求、消息发送
- `Verify`：通过测试、规则检查、评审器、环境反馈判断结果

没有 `Verify` 的 loop，本质上不是工程闭环，而是连续猜测。

### 3. 好的 loop 依赖外部反馈，而不是自我感觉良好

大量资料都指向同一个事实：agent 的自我修正只有在“有真实反馈信号”时才可靠。

- ReAct 的价值，在于让 reasoning 和 action 交替进行，并把 observation 重新喂回模型
- Reflexion 的价值，不是“让模型自我夸赞”，而是把失败后的外部反馈压缩成可复用经验
- Claude Code 团队的 loop 实践，也强调停止条件、可验证目标、技能化检查和明确 turn cap

所以，loop engineering 的第一原则不是“多想一步”，而是“让每一步都能被环境纠偏”。

## 最小工程骨架

一个可落地的 agent loop，至少应当包含以下构件：

### 1. Goal

目标必须写成可验证条件，而不是模糊意图。

差的写法：

- “优化首页体验”

好的写法：

- “将首页 Lighthouse 分数提升到 90 以上，最多尝试 5 轮”
- “收集 5 个竞品的价格与来源链接，字段完整后停止”

### 2. Settings

`Settings` 是运行前相对稳定的控制面，应与运行时状态分离。通常包括：

- system instruction
- tool schema
- 权限边界
- 预算上限
- 最大轮数
- 停止条件
- memory 策略
- evaluator / verifier 配置

它回答的问题是：`这个 agent 被允许如何运行`

### 3. States

`States` 是 loop 每一轮持续变化的数据面，通常包括：

- 当前目标进度
- 本轮观察结果
- 工具返回值
- 中间计划
- 错误记录
- 当前上下文摘要
- 历史反思

它回答的问题是：`这个 agent 此刻处于什么位置`

### 4. Action Layer

Action 层不应只是“给模型几个函数名”，而应具备：

- 清晰的输入输出 schema
- 可机器校验的参数格式
- 幂等性或重试策略
- 明确的失败返回
- 可并行时支持并行

tool design 越含糊，loop 的误差传播越快。

### 5. Evaluator / Verifier

这是 loop engineering 里最容易被低估、但最关键的一层。

推荐拆成两类：

- `Verifier`：规则型校验，如测试是否通过、JSON 是否合法、页面是否打开成功
- `Evaluator`：质量型判断，如摘要是否完整、方案是否满足约束

常见顺序是：

1. 先用 rule-based check 快速挡掉结构性错误
2. 再用 LLM judge 或独立 critic 判断质量

### 6. Memory

记忆不应被泛化理解为“把历史全塞回上下文”。

更有效的划分通常是：

- `Scratchpad`：当前任务即时推理轨迹
- `Working memory`：最近几轮关键上下文
- `Episodic memory`：失败经验、反思摘要、过去案例
- `Long-term memory`：稳定规则、知识、偏好、策略模板

真正重要的不是“记得更多”，而是“记住以后真的会改变决策的东西”。

## 一个通用 loop 模板

```text
while not done:
  observe()
  update_state()
  choose_next_action()
  act()
  verify()

  if verified_success:
    done = true
  elif recoverable_failure:
    reflect_and_retry()
  elif budget_exhausted or stop_condition_hit:
    stop()
```

这段模板看起来简单，但工程质量主要取决于 4 个点：

- `observe()` 是否拿到真实世界反馈
- `choose_next_action()` 是否受状态和约束共同控制
- `verify()` 是否真正独立于生成阶段
- `stop()` 是否具有契约化退出条件

## 常见 loop 类型

结合 Claude Code 团队对 loops 的分类，可以把常见场景分为四类：

### 1. Turn-based loop

由用户每次手动触发，适合一次性任务或较短任务。

特征：

- 人工发起
- agent 自行做若干轮内部迭代
- 在完成或需要更多信息时停止

### 2. Goal-based loop

围绕明确目标连续迭代，直到满足条件或触达最大轮数。

适合：

- 测试修复
- 指标优化
- 有清晰完成标准的复杂任务

### 3. Time-based loop

按时间调度周期性运行，适合：

- 每日汇总
- 周报生成
- PR / CI 状态轮询
- 外部系统变化监测

### 4. Proactive loop

由事件或环境变化驱动主动执行，适合：

- 监控告警
- 队列清理
- 竞品追踪
- 工单分发

复杂系统通常不是只选一种 loop，而是“外层时间驱动 + 内层目标闭环”。

## 高质量 loop 的六个工程原则

### 1. Done 要写成契约

停止条件必须显式，不要让模型自己猜“差不多做完了”。

### 2. 先验证，再声称完成

代码改动、网页变更、报告生成，都应先经过环境验证，再输出“已完成”。

### 3. 把失败当成输入，而不是异常

好的 loop 不会把失败看成流程中断，而会把失败转成下一轮的状态更新和策略修正依据。

### 4. 让记忆压缩成决策提示，而不是历史转储

Reflexion 的启发非常明确：有效记忆不是原始轨迹堆积，而是能指导下一次尝试的短反思。

### 5. 控制成本增长曲线

长环路的主要成本常常不是单次推理，而是上下文不断膨胀。需要：

- 历史压缩
- 滚动摘要
- 稳定前缀缓存
- 轮数上限
- 子任务拆分

### 6. 从最简单的 loop 开始

很多所谓“agent”本质上只是 workflow。只有在固定流程无法覆盖、需要自主选择下一步时，才值得升级为真正的 agent loop。

## 典型失效模式

### 1. 假验证

agent 只检查“命令执行过了”，却没有检查“结果是否达标”。

典型表现：

- 页面没打开但声称 UI 已完成
- 测试未覆盖关键路径却宣称修复成功
- 文档结构正确但事实错误

### 2. 死循环式重试

同一个动作、同一个参数、同一个错误，重复出现。

根因通常是：

- 没有 loop detection
- 没有反思压缩
- 没有最大轮数
- 没有把错误写回状态

### 3. 工具幻觉

模型调用不存在的工具、填错参数或忽略 tool failure。

应对方式：

- 严格 schema
- 强校验
- 显式错误返回
- 对失败进行二次解释，而不是静默吞掉

### 4. 上下文污染

把所有历史全量保留，导致真正重要的状态被淹没。

### 5. 目标漂移

运行若干轮之后，agent 开始优化“看起来合理的次级目标”，而不是原始目标。

### 6. 退出失真

不是停得太早，就是永远不肯停。根因几乎总是完成条件不够可验证。

## 推荐设计顺序

如果要从零设计一个 agent loop，推荐按下面顺序推进：

1. 先定义 `done`
2. 再定义 `verify`
3. 再定义 `state`
4. 再定义 `action`
5. 最后才写 prompt

这是因为 prompt 只影响单轮表现，而前四项决定整个系统是否可持续运行。

## 与 Context Engineering 的关系

Loop engineering 和 context engineering 是互补关系，不是替代关系。

- `Context engineering` 解决的是：当前这一轮，应该给模型哪些上下文
- `Loop engineering` 解决的是：这一轮结束后，系统下一步该怎么走

前者偏“横向上下文编排”，后者偏“纵向状态跃迁控制”。

可以把两者理解成：

- context 决定模型此刻看到了什么
- loop 决定模型接下来还能做什么

## 适合落地的一个判断标准

当你评估一个 agent 系统是否成熟时，可以直接问 8 个问题：

1. 目标是否可验证
2. 停止条件是否明确
3. 工具接口是否严格
4. 失败是否会转成下一轮输入
5. 是否有独立验证器
6. 是否有状态压缩与记忆分层
7. 是否有限制成本的机制
8. 是否能解释它为什么停止

如果其中有 3 个以上回答不清楚，这通常还不是一个成熟的 loop，只是一个能连续调用模型的脚本。

## 参考来源

- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [Reflexion: language agents with verbal reinforcement learning](https://openreview.net/forum?id=vAElhFcKW6)
- [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Loop engineering: Getting started with loops](https://claude.com/blog/getting-started-with-loops)
- [Awesome Harness Engineering](https://github.com/ai-boost/awesome-harness-engineering)

## 一句话判断

`AI agent loop engineering` 的本质，不是让模型多跑几轮，而是把“目标、状态、动作、反馈、验证、记忆、终止条件”组织成一个可反复自纠的控制系统。
