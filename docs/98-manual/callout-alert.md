# Callout / Alert 用法手册

> [!NOTE]
> 本手册定义内容文档中 Callout（提示块）的语法规范与渲染约定。该语法向下兼容 GitHub Alert，向上支持自定义标题与折叠模式。

---

## 1. 语法规范

### 1.1 基础结构

Callout 以 blockquote（`>`）为载体，首行通过标识指令声明类型：

```text
> [!TYPE]
> 正文内容段落 1
>
> 正文内容段落 2
```

其中 `TYPE` 为大小写不敏感的语义类型标识符。

### 1.2 自定义标题

在类型标识符后追加空格与自定义文本，可覆盖默认标题：

```text
> [!WARNING SSL 证书即将过期]
> 证书有效期剩余 14 天，请执行续期流程。
```

### 1.3 折叠模式

在类型标识符后追加 `+` 或 `-`，可将 Callout 渲染为可折叠的 `<details>` 容器：

| 修饰符 | 初始状态 | 说明                                  |
| ------ | -------- | ------------------------------------- |
| `+`    | 展开     | `[!NOTE]+` 默认展开，允许用户手动折叠 |
| `-`    | 收起     | `[!NOTE]-` 默认收起，需要用户主动展开 |

示例：

```text
> [!TIP]- 展开查看性能优化建议
> - 静态资源启用 gzip 压缩
> - 图片资源使用 CDN 分发
> - 数据库查询添加索引
```

自定义标题与折叠修饰符可组合使用，顺序为 `[!TYPE(+|-) 自定义标题]`。

---

## 2. 语义类型映射

全部类型均通过 `--callout-color` CSS 变量控制主题色。下表为系统定义的完整语义集合：

| 语义分组  | 类型标识符                                        | 默认标题            | 主题色         | 说明                           |
| --------- | ------------------------------------------------- | ------------------- | -------------- | ------------------------------ |
| 信息      | `note` `info`                                     | NOTE / INFO         | `#3b82f6` 蓝   | 中性提示信息、补充说明         |
| 成功/建议 | `tip` `hint` `success` `check` `done`             | TIP / SUCCESS 等    | `#10b981` 绿   | 最佳实践、正确操作、完成态     |
| 重要/示例 | `important` `example`                             | IMPORTANT / EXAMPLE | `#8b5cf6` 紫   | 需特别关注的节点、演示案例     |
| 疑问      | `question` `help` `faq`                           | QUESTION / FAQ      | `#f59e0b` 琥珀 | 问答、求助、常见问题           |
| 警告      | `warning` `caution` `attention`                   | WARNING / CAUTION   | `#f59e0b` 琥珀 | 潜在风险、需要提前规避         |
| 危险/错误 | `danger` `error` `bug` `failure` `fail` `missing` | DANGER / ERROR 等   | `#ef4444` 红   | 严重错误、Bug 报告、破坏性操作 |
| 引用      | `quote` `cite`                                    | QUOTE / CITE        | `#6b7280` 灰   | 外部引用、原文摘录             |
| 摘要      | `abstract` `summary` `tldr`                       | ABSTRACT / TL;DR    | `#06b6d4` 青   | 长文档摘要、前置结论           |
| 待办      | `todo`                                            | TODO                | `#0ea5e9` 天蓝 | 待执行任务清单                 |

> [!NOTE]
> GitHub Alert 标准仅定义 5 种类型：NOTE / TIP / IMPORTANT / WARNING / CAUTION。上表中其余类型为系统扩展，不保证在 GitHub 仓库页面渲染时生效；但在本站构建管线内全部可用。

---

## 3. 渲染机制

### 3.1 编译流程

Callout 转换位于 Markdown 编译管线的 Rehype 阶段：

| 阶段   | 执行顺序 | 插件                       | 作用                                        |
| ------ | -------- | -------------------------- | ------------------------------------------- |
| Remark | 1        | `remark-gfm` 等            | Markdown → MDAST，保留 blockquote 结构      |
| Rehype | 1        | `rehype-slug`              | 标题锚点注入                                |
| Rehype | 2        | `rehype-autolink-headings` | 标题自动链接                                |
| Rehype | 3        | `rehype-pretty-code`       | 代码块高亮                                  |
| Rehype | 4        | `rehype-obsidian-callout`  | 将 `blockquote[> [!TYPE]]` 转换为结构化节点 |

### 3.2 输出 DOM

**普通模式**（非折叠）：

```html
<div class="callout callout-{type}">
  <div class="callout-title">
    <span class="callout-icon" aria-hidden="true">{icon}</span>
    <span class="callout-title-text">{displayTitle}</span>
  </div>
  <div class="callout-body">
    <!-- 原始 blockquote 内部节点，移除指令行 -->
  </div>
</div>
```

**折叠模式**：

```html
<details class="callout callout-{type} callout-collapsible" open>
  <summary class="callout-summary">
    <div class="callout-title">...</div>
  </summary>
  <div class="callout-body">...</div>
</details>
```

`open` 属性仅在修饰符为 `+` 或未指定 `-` 时存在。

---

## 4. 样式规范

### 4.1 容器

- 外边距：`margin: 1.25rem 0`
- 圆角：`border-radius: 0.5rem`
- 左侧色条：`border-left: 4px solid var(--callout-color)`
- 背景填充：`color-mix(in srgb, var(--callout-color) 8%, transparent)`
- 溢出裁剪：`overflow: hidden`

### 4.2 标题栏

- 内边距：`padding: 0.75rem 1rem`
- 字重：`font-weight: 600`
- 文字色：`var(--callout-color)`
- 背景填充：`color-mix(in srgb, var(--callout-color) 15%, transparent)`
- 图标尺寸：`1.25rem × 1.25rem`，字号 `0.9rem`，`aria-hidden="true"`

### 4.3 正文区

- 内边距：`padding: 0.75rem 1rem`
- 首子元素：`margin-top: 0`（去除标题栏与正文间冗余间距）
- 末子元素：`margin-bottom: 0`（去除容器底部外溢间距）

### 4.4 折叠指示器

- 使用 `summary::after` 伪元素追加 `▾` 字符
- 收起态（`details:not([open])`）：指示器旋转 `rotate(-90deg)`，过渡时长 `0.15s ease`
- 展开态（`details[open]`）：`.callout-body` 顶部追加 `1px solid` 分隔线，颜色混合比例 20%

---

## 5. 示例清单

### 5.1 信息类

```markdown
> [!INFO]
> 构建产物位于 `dist/` 目录，部署时请同步上传该目录全量内容。
```

### 5.2 建议类 + 自定义标题

```markdown
> [!TIP 推荐的 Git 提交流程]
>
> 1. 新建 feature 分支
> 2. 提交时遵循 Conventional Commits 规范
> 3. 提交 PR 前执行 `npm run build` 确保通过
```

### 5.3 警告类（默认收起）

```markdown
> [!WARNING]- 破坏性变更提示
> 版本 2.0 移除了 `legacyConfig` 字段，升级前请迁移至新的 `site.config.mjs` 配置格式。
```

### 5.4 摘要类（默认展开、可折叠）

```markdown
> [!ABSTRACT]+ 本文结论
> 本章对比了 4 种 Markdown 解析管线，最终选择 Astro 原生 Content Collections + 自定义 Rehype 插件方案，综合性能与可维护性最优。
```

### 5.5 待办类

```markdown
> [!TODO]
>
> - [x] 前端样式优化
> - [ ] 单元测试覆盖
> - [ ] 部署上线验证
```

> [!NOTE]
> 以上示例在 GitHub 原生渲染环境下，仅 5 种基础类型（NOTE/TIP/IMPORTANT/WARNING/CAUTION）可被识别并应用其默认样式；自定义标题、修饰符及扩展类型在本站生效。
