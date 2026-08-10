---
name: "starlight-blog-frontmatter"
description: "Generates and validates standard frontmatter for Astro Starlight blog posts (title/date/excerpt/tags). Invoke when creating blog files or adding/repairing frontmatter for src/content/docs/blog/*.md(x)."
---

# Starlight Blog Frontmatter Generator

## 诊断结论

### 字段来源

项目使用 Astro + Starlight + `starlight-blog` 插件，frontmatter 结构由三层组成：

1. **Starlight docsSchema 基础字段**（继承自 `@astrojs/starlight/schema`）
   - `title`, `description`, `sidebar`, `slug`, `prev`, `next`, `head`, `template`, `hero`, `tableOfContents`, `badge`, `editUrl`, `lastUpdated`, `pagefind`
2. **starlight-blog 扩展字段**（定义于 [schema.ts](file:///Users/zouhaisong/mydoc/hs-code/www.haisong.cc/www.haisong.cc-code/node_modules/starlight-blog/schema.ts#L40-L103)）
   - `authors`, `date`, `excerpt`, `metrics`, `tags`, `cover`, `featured`
3. **项目自定义 fallback**（实现于 [content.config.ts](file:///Users/zouhaisong/mydoc/hs-code/www.haisong.cc/www.haisong.cc-code/src/content.config.ts#L96-L156)）
   - `title` 缺失时 → 从文件 id 做 slugToTitle 推断
   - `date` 缺失或为 1970-01-01 占位符时 → 取文件 mtime 或当前时间
   - `lastUpdated` 缺失时 → 取文件 mtime 或当前时间
   - `tags` 缺失时 → 空数组 `[]`
   - `authors` 缺失时 → 空数组 `[]`
   - `cover` 缺失时 → 空字符串 `""`
   - `featured` 缺失时 → `false`
   - `draft` 缺失时 → `false`
   - `excerpt` 缺失时 → loader 侧按 `<!-- excerpt -->` / `{/* excerpt */}` 分隔符截取，否则取正文前 200 字智能截断（**本 skill 不使用此规则**，见下方 LLM 摘要方案）

### 本 skill 生成的最小显式字段集

为保证源码仓库中 frontmatter 可读、可搜索、可审查、不依赖 loader 隐式推断，显式写入以下字段：

| 字段      | 必填 | 类型     | 生成来源                                                                                                                                                                                                                                                                                |
| --------- | ---- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`   | 是   | string   | 正文第一个 `# ` H1；若缺失则从文件名 slug → Title Case                                                                                                                                                                                                                                  |
| `date`    | 是   | date     | 文件 mtime（`fs.statSync(path).mtime`）；文件未存在则用 `new Date()`                                                                                                                                                                                                                    |
| `excerpt` | 推荐 | string   | **LLM 摘要**：提取文章「开头 N 段 + 大纲（所有 `##`/`###` 标题）+ 结尾 N 段」三路输入，要求模型生成 120–200 字的语义摘要；LLM 不可用时降级为 [extractExcerptFromFile](file:///Users/zouhaisong/mydoc/hs-code/www.haisong.cc/www.haisong.cc-code/src/content.config.ts#L41-L78) 等价规则 |
| `tags`    | 推荐 | string[] | 与用户确认；未指定时写空数组 `[]`                                                                                                                                                                                                                                                       |

**不自动生成**（按需单独询问用户）：`authors`, `cover`, `featured`, `description`, `metrics`, `badge` 等。

---

## 触发条件

满足任一条件时调用本 skill：

1. 用户要求「创建 / 生成 / 补全 / 修复」blog 文件的 frontmatter
2. 用户在 `src/content/docs/blog/` 下创建新的 `.md` 或 `.mdx` 文件
3. 用户打开的 blog 文件缺少 `---` 包裹的 frontmatter 块
4. 用户显式使用关键词：「blog frontmatter」「文章元数据」「生成标题日期摘要」

---

## 执行流程

### Step 1：定位目标文件并读取原始内容

- 若用户已明确文件路径，直接读取
- 若未指定但处于 `src/content/docs/blog/` 相关上下文，用 Glob 匹配候选
- 记录**写入前正文原始内容字节数**（用于 Step 5 验证）

### Step 2：提取各字段值

#### `title` 提取优先级

1. 正文中第一个以 `^# `（markdown H1）开头的行，去掉前缀 `# ` 和两端空白
2. 从文件名（去除 `.md` / `.mdx` 扩展名）应用 `slugToTitle`：
   - 按 `[-_/]` 切词，中文保留原样，英文词首字母大写后用空格连接
3. 兜底：文件名直接作为 title

#### `date` 提取优先级

1. 文件已存在 → `fs.statSync(absPath).mtime` 转 ISO 日期（`YYYY-MM-DD`）
2. 文件新建 → 当前日期 `new Date().toISOString().slice(0, 10)`
3. YAML 格式使用裸日期写法：`date: 2026-08-09`（不加引号）

#### `excerpt` 生成：LLM 三路摘要方案（脚本驱动）

**可执行入口**（纯 Python 标准库，`python3 >= 3.9`，无 pip 依赖）：

```
.trae/skills/starlight-blog-frontmatter/scripts/generate_excerpt.py
```

**模块化 prompt 文件**（可单独编辑，不触碰脚本代码）：

| 文件                                                                                                                                                                                     | 用途                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [scripts/prompts/excerpt_system.md](file:///Users/zouhaisong/mydoc/hs-code/www.haisong.cc/www.haisong.cc-code/.trae/skills/starlight-blog-frontmatter/scripts/prompts/excerpt_system.md) | System prompt：角色、长度约束（120–200 字）、语义三点覆盖、禁止前缀                |
| [scripts/prompts/excerpt_user.md](file:///Users/zouhaisong/mydoc/hs-code/www.haisong.cc/www.haisong.cc-code/.trae/skills/starlight-blog-frontmatter/scripts/prompts/excerpt_user.md)     | User prompt 模板：`{{title}} / {{opening}} / {{outline}} / {{closing}}` 四个占位符 |

**前置检查（脚本内部自动完成）**：仅支持 **OpenAI（及兼容 `/chat/completions` 的自建 Base URL）**。配置方式：

| 配置项            | 说明                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 位置              | 项目根目录（存在 `astro.config.*` / `.git` / `package.json` 的目录）的 `.env`；或 skill 脚本目录 `scripts/.env`；或已 `export` 的 shell 环境变量 |
| 优先级            | **已 export 的 shell 变量 > 项目根 `.env` > 脚本目录 `.env`**（已存在的 key 不被后读入的文件覆盖）                                               |
| `OPENAI_API_KEY`  | **必填**。非空且不以 `sk-xxx` 占位字符串结尾时视为有效                                                                                           |
| `OPENAI_BASE_URL` | 可选。默认：`https://api.openai.com/v1`；兼容 DeepSeek / 通义 / 月之暗面 / 本地 vLLM 等 OpenAI 格式端点                                          |
| `OPENAI_MODEL`    | 可选。默认：`gpt-4o-mini`                                                                                                                        |

`.env` 解析由脚本内置手写 parser（支持 `#` 注释、带/不带单/双引号的 VALUE）完成，**不依赖 `python-dotenv`**。未配置 `OPENAI_API_KEY` → 脚本自动走降级路径，返回 JSON 的 `warning` 字段写清原因。

**脚本执行 SOP（按顺序调用）**：

| 步骤         | 命令                                                   | 目的                                                                                     | 何时使用                                        |
| ------------ | ------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------- |
| S1（可选）   | `generate_excerpt.py <file> --dry-run-snippets --json` | 仅输出三路抽取结果（opening / outline / closing），不调 LLM                              | 首次处理某类文章、或怀疑抽取引入标题/链接噪声时 |
| S2（正式）   | `generate_excerpt.py <file> --json`                    | 走完整 LLM → 校验 → 重试 → 降级流水线；**只读不写**，只向 stdout 输出 JSON 供 agent 消费 | 默认调用路径                                    |
| S3（纯降级） | `generate_excerpt.py <file> --disable-llm --json`      | 强制跳过 LLM，直接产出规则 fallback                                                      | 离线 / API 限流 / 验证降级路径                  |
| S4（管道）   | `generate_excerpt.py <file> --plain`                   | 仅打印 excerpt 字符串，便于 `pbcopy` / 重定向                                            | 调试或脚本串联                                  |

**S2 输出 JSON 结构**（由 [generate_excerpt.py](file:///Users/zouhaisong/mydoc/hs-code/www.haisong.cc/www.haisong.cc-code/.trae/skills/starlight-blog-frontmatter/scripts/generate_excerpt.py) 的 `ExcerptResult` dataclass 保证字段一致性）：

| 字段                              | 类型                                               | 含义                                                           |
| --------------------------------- | -------------------------------------------------- | -------------------------------------------------------------- |
| `excerpt`                         | string                                             | 最终摘要文本；写入 frontmatter 时必须使用此值                  |
| `mode`                            | `"llm" \| "fallback_delimiter" \| "fallback_rule"` | 实际采用的生成路径（Step 4 必须展示给用户）                    |
| `provider`                        | string \| null                                     | `mode=llm` 时写明 provider 名（如 `openai`）；fallback 为 null |
| `retries`                         | int                                                | LLM 输出校验失败后的重试次数（Step 4 透明度要求）              |
| `opening` / `outline` / `closing` | string                                             | 三路抽取原始值（Step 4 展示给用户，便于对照 excerpt 是否忠实） |
| `char_count`                      | int                                                | `excerpt` 字符数（用于 V5 预检）                               |
| `warning`                         | string \| null                                     | 异常 / 降级原因；非空时必须在 Step 4 告知用户                  |

**三路抽取内部规则（脚本实现，仅供排障）**：

- opening：去除 frontmatter 后，前 3 个非空段落（独立的 `#/##/###` heading 不计入段落；含 URL 的引用列表会被丢弃）
- outline：全部 `^## `（二级）与 `^### `（三级）标题，保留缩进
- closing：最后 2 个非空段落（`skip_refs_tail=True`，若末尾是参考链接列表则跳过）

**校验 & 重试（脚本内置 `validate_excerpt`）**：

每次 LLM 返回后立即执行，失败最多自动重试 2 轮（重试时把违规原因拼接到 user prompt 末尾）；连续失败 3 次 → 降级：

1. 非空
2. 长度 ∈ [120, 200]
3. 不含 ``` / `/`![]`/`[](<>)`/`<html>`/`- ` 列表 / 其他 markdown 标记
4. 不以「本文、下面、我们、请看、综上、总之」开头

**降级规则（等价于 content.config.ts）**：

1. 优先命中 `<!-- excerpt -->`（md）或 `{/* excerpt */}`（mdx）分隔符 → 取分隔符上方非空内容
2. 未命中 → 清洗 markdown、压缩空白、200 字智能标点截断、末尾补 `…`

降级时 `warning` 字段非空，**Step 4 必须显式通知用户**：「excerpt 采用降级算法（规则截断 / 分隔符），建议配置 LLM key 后重新生成。」

#### `tags` 提取规则

1. 向用户确认或建议 3–5 个主题标签（从正文中的章节标题、反复出现的专有名词中提取候选）
2. 用户未响应时写空数组 `[]`，不在生成过程中主观假设业务标签

### Step 3：按规范顺序写入 frontmatter

**写入位置**：文件开头（字节偏移 0）。

**字段顺序固定**（便于 diff 与审查）：

```
title → date → excerpt → tags
```

**模板格式**：

```yaml
---
title: "文章标题"
date: YYYY-MM-DD
excerpt: "摘要文本，不超过 200 字，结尾用全角省略号或自然截断。"
tags:
  - 标签A
  - 标签B
---
```

**格式约束**：

- title 和 excerpt 使用双引号包裹，内部双引号转义为 `\"`
- date 不使用引号（YAML 原生 timestamp）
- tags 使用 `- ` 分行列表语法，不用内联 `[a, b]` 语法（多标签时可读性差）
- `---` 前后各保留一个空行吗？**否**：开头 `---` 即第 0 行；闭合 `---` 之后留一空行再接正文
- 若文件已有 frontmatter，**先移除原有 frontmatter 块**（按正则 `/^---\s*\n[\s\S]*?\n---\s*\n?/`），再按模板重写

### Step 4：显式询问用户确认

将生成的 frontmatter 以代码块形式展示给用户，附带字段说明：

- `title`：来源（H1 / 文件名）
- `date`：来源（mtime / 今天）
- `excerpt`：字数（X / 200，目标 120–200）、生成方式（LLM 三路摘要 / 降级规则截断）；若 LLM 降级必须明确标注
- `tags`：候选列表

获得用户确认后再执行写入。

### Step 5：写入并执行验证

写入后运行以下 7 项检查，**全部通过**才声称完成：

| #   | 验证项                          | 方法                                                                                                                                             | 失败处理                                              |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| V1  | frontmatter 包裹合法            | 文件前 3 字节为 `---\n`，且存在闭合 `---\n` 行                                                                                                   | 重写 frontmatter 块                                   |
| V2  | 字段顺序与完整性                | 按行序检测 `title:` / `date:` / `excerpt:` / `tags:` 均存在且顺序正确                                                                            | 调整顺序后重写                                        |
| V3  | title 非空且合理                | 去除两端空白后长度 ≥ 2，不等于纯文件名数字/占位符                                                                                                | 重新提取或询问用户                                    |
| V4  | date 合法 YAML 日期             | 匹配 `^\d{4}-\d{2}-\d{2}$`，可被 `new Date()` 正常解析                                                                                           | 用 ISO 格式重写                                       |
| V5  | excerpt ∈ [120, 200] 字且纯文本 | 去除两端空白后字符数 ≥ 120 且 ≤ 200；不含 ``` / `/ ![] / []() / <html> / 列表`- ` 等 markdown 标记；开头不以「本文」「下面」「我们」「请看」起始 | LLM 模式：脚本重试 1–2 次；降级模式：重新执行规则截断 |
| V6  | tags 为合法 YAML 数组           | 解析后类型为 `Array<string>`，无重复项（忽略大小写）                                                                                             | 去重或修正格式                                        |
| V7  | 正文未被篡改                    | 写入后正文（去除 frontmatter 块）字节数 === Step 1 记录的原始正文字节数                                                                          | diff 差异，回滚并重新写入                             |

---

## 与 loader fallback 的关系

项目 `content.config.ts` 已实现 fallback 生成逻辑，但两者不冲突：

- **显式 frontmatter（本 skill 产出）**：进入源码、参与 diff、可被搜索和审查
- **loader fallback**：仅在显式字段缺失时作为兜底（渲染时补全），不写入磁盘

因此本 skill 是「把隐式推断显式化」，而非重复实现。

---

## 不适用边界

以下情况 **不调用本 skill**：

1. `src/content/docs/wiki/` 或 Starlight 非 blog 页面的 frontmatter（wiki 使用 Starlight 原生 docs 字段集，不含 date/tags/excerpt 语义）
2. 首页、works、contact 等非 content collection 路由页面
3. 用户要求修改 cover / authors / featured 等非本 skill 范围字段时，仅告知字段格式，不自动生成
