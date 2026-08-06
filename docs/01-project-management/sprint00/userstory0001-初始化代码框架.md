---
type: user-story
id: US0001
epic: sprint00
date: 20260806
priority: P0
status: pending
points: 8
owner:
---

# userstory0001 - 初始化代码框架

## 用户故事陈述

**作为** 知识库与博客系统的站点维护者，

**我希望** 在 `www.haisong.cc-code` 单仓内初始化一套可运行的三层架构代码框架（编辑层 VSCode+Foam 规范、构建层 Astro+Starlight、发布层 Docker Compose+Traefik+Nginx），并使 Blog / Wiki（多领域）/ Solutions 三大类内容通过 Content Collections 强类型接入、Wikilinks 与同名附件目录可用，

**以便** 后续任一用户故事都能在同一套规范下扩展领域、接入新页面、复用构建与发布流水线，无需重新搭建脚手架或约定边界。

---

## 背景与前置条件

- 本故事的技术规格来源：[基本技术选型.md](file:///Users/zouhaisong/mydoc/hs-code/www.haisong.cc/www.haisong.cc-code/docs/01-project-management/sprint00/基本技术选型.md)
- 仓库：`www.haisong.cc-code` 单仓，代码与内容共存；所有设置纳入版本控制，所有状态纳入 `.gitignore`
- 运行环境：Node.js 22+、npm 10+、Docker 27+、Docker Compose v2+
- 域名与证书：域名未绑定前以 `localhost` / 自定义 `hosts` 验证；acme 证书签发在下一个部署类故事中完成

---

## 验收标准（Acceptance Criteria）

### AC-01 编辑层：VSCode + Foam 工作区规范

1. `.vscode/extensions.json` 存在并推荐以下扩展：`foam.foam-vscode`、`astro-build.astro-vscode`、`yzhang.markdown-all-in-one`、`esbenp.prettier-vscode`、`bierner.markdown-preview-github-styles`、`bierner.markdown-mermaid`、`mushan.vscode-paste-image`、`unifiedjs.vscode-mdx`、`bradlc.vscode-tailwindcss`
2. `.vscode/settings.json` 存在并配置：
   - Foam 相关：`foam.edit.linkReferenceDefinitions = "off"`；`foam.files.notesExtensions = "md mdx"`；`foam.files.newNotePath = "currentDir"`；日记路径等保留位
   - Paste Image 相关：`pasteImage.path` 与 `pasteImage.insertPattern` 满足「每篇笔记同名附件目录」规范（见基本技术选型 3.5）
   - Markdown All in One：`toc.levels = "2..4"`，`toc.updateOnSave = true`
   - Prettier：不格式化 Markdown（`prettier.disableLanguages = ["markdown"]`）
3. `.vscode/foam.json` 存在；`.foam/`、`_graph*.json` 已加入 `.gitignore`（状态分离）

### AC-02 构建层：Astro + Starlight 脚手架可启动

1. 在仓根执行 `npm ci && npm run dev` 后，浏览器访问 `http://localhost:4321/` 可看到 Starlight 默认欢迎页或占位首页
2. `npm run build` 成功，产物在 `dist/`；`dist/` 已加入 `.gitignore`
3. `npm run preview` 启动后可本地访问构建产物
4. `astro.config.mjs` 存在并接入：
   - Integrations：`@astrojs/starlight`、`@astrojs/tailwind`、`@astrojs/sitemap`、`@astrojs/mdx`
   - Markdown：`remark-frontmatter`、`remark-gfm`、`remark-breaks`、`remark-wiki-link`；`rehype-slug`、`rehype-autolink-headings`、`rehype-pretty-code`
   - 图片：`image.service = 'astro/assets/services/sharp'`
   - Starlight 配置：中文 locale；侧栏按 Blog / Wiki / Solutions 分组占位；自定义 CSS 入口保留
5. `package.json` 包含脚本：`dev` / `start` / `build` / `preview` / `check` / `astro` / `clean`；依赖清单与 3.2 核心依赖一致（astro/starlight/sitemap/rss/tailwind/vite/astro-tailwind/sharp/remark-*/rehype-*/mdx）
6. `.astro/` 缓存、`node_modules/.astro` 已加入 `.gitignore`

### AC-03 Content Collections：Blog / Wiki / Solutions 三大类 + 多领域接入

1. `src/content/config.ts` 存在，定义共享 frontmatter schema（`type` / `date` / `tags` / `summary` / `publish` / `title` / `seealso`），默认 `publish=true`
2. 按 3.3 路由映射定义对应 collection 骨架：
   - Blog：`articles`、`daily`
   - Wiki（多领域）：`wiki-software-engineering`、`wiki-ai-coding`、`wiki-ai-agent`、`wiki-tools`、`wiki-tips`、`wiki`（通用）
   - Solutions：`solutions`、`topics`、`spikes`
   - 其他：`notes`
3. 每个 collection 提供 1 篇示例占位笔记（含合法 frontmatter），用于 `astro check` 与页面渲染验证；`spikes` 示例 `publish=false`，验证 schema 过滤逻辑
4. `npm run check` 全部通过，无 schema 错误、无类型错误
5. 对应目录结构（`1-articles/`、`1-软件研发/`、`1-ai-coding/`、`1-ai-agent/`、`2-tools/`、`2-tips/`、`2-wiki/`、`2-solutions/`、`2-topics/`、`2-spikes/`、`0-workspace/0-DailyNote/`、`1-aichat/`）存在空 `.gitkeep` 或示例文件，供后续故事直接落内容

### AC-04 Wikilinks 与图片附件（方式 A）可用

1. 两篇跨 collection 的示例笔记互相使用 `[[note]]` 或 `[[note|alias]]` 引用；`npm run build` 后生成的 HTML 中 `<a>` 链接指向正确路由
2. 一篇示例笔记粘贴 1 张图片，生成同名附件目录，存放图片；Markdown 使用 `![](./<笔记名>/<图片名>)` 相对路径；`npm run build` 后图片被复制到 `dist/_astro/` 并以哈希 URL 渲染，页面能正确显示图片无 404
3. Astro 构建日志无「找不到资源」类 warning

### AC-05 发布层：Docker Compose + Traefik + Nginx 骨架可启动

1. `deploy/` 目录存在，包含：
   - `docker-compose.yml`：定义 `traefik`（v3.2，绑 80/443，挂载 docker.sock / traefik.yml / acme）与 `wiki`（nginx:1.27-alpine，挂载 `../dist` 与 `nginx.conf`，Traefik 标签路由规则）
   - `traefik.yml`：静态配置入口点 / docker provider / acme certresolver 占位（certresolver 名称与 compose 标签一致）；本地联调可临时关闭 TLS 使用 HTTP
   - `nginx.conf`：静态资源 gzip、合理缓存头、SPA 兼容 fallback
   - `acme/` 空目录 + `.gitkeep`；`acme/acme.json` 已加入 `.gitignore`
2. 在执行 `npm run build` 生成 `dist/` 后，`cd deploy && docker compose up -d` 能成功启动两个容器
3. 访问 `http://localhost/`（或自定义 host）可返回 Astro 构建的首页内容，静态资源 200
4. `docker compose down` 正常停止无残留

### AC-06 状态/设置分离

1. `.gitignore` 至少包含以下条目（状态均不入库）：
   - `.foam/`、`_graph*.json`（Foam 运行时）
   - `.astro/`、`dist/`、`node_modules/.astro`（Astro 构建态）
   - `deploy/acme/acme.json`（证书状态）
   - `node_modules/`、`.DS_Store`、`.env*`
2. 所有设置文件（`.vscode/*`、`astro.config.mjs`、`tailwind.config.*`、`deploy/docker-compose.yml`、`deploy/traefik.yml`、`deploy/nginx.conf`、`src/**/*`、示例 Markdown）均被 Git 追踪，且无 `!` 反模式覆盖

### AC-07 构建校验闭环

1. 一次性端到端校验可通过：`npm run clean && npm ci && npm run check && npm run build`
2. Pagefind 静态搜索索引生成命令可用（`npx -y pagefind --site dist` 成功），但接入 Starlight 搜索框在下一故事完成；命令仅需记录于 README/脚本注释，不要求默认执行

---

## 任务拆解（Task Breakdown）

| 步骤 | 任务 | 产物 / 说明 | 关联验收标准 |
|------|------|------------|-------------|
| T1 | 初始化 Astro Starlight 项目骨架 | 执行 `npm create astro@latest . -- --template starlight --no-install`；按 3.2 补充依赖；`package.json` scripts 补齐 | AC-02.4 / 5 |
| T2 | 接入插件链与 sharp | `astro.config.mjs` 补齐 integrations、markdown、image 配置；shiki/主题按默认 | AC-02.4 / AC-04.2 |
| T3 | 编辑层工作区规范落地 | `.vscode/extensions.json`、`.vscode/settings.json`、`.vscode/foam.json` 三件套；Foam + paste-image 按规范 | AC-01 |
| T4 | Content Collections schema 与 collection 定义 | `src/content/config.ts` 写入共享 schema + 11 个 collection（Blog/Wiki多领域/Solutions/notes），匹配路由映射表 | AC-03.1 / 2 |
| T5 | 内容目录结构 + 示例笔记 | 创建 12 个内容目录 + `.gitkeep`；每 collection 至少 1 篇示例；含 2 篇跨域 Wikilinks 示例 + 1 篇图片附件示例 | AC-03.3 / 4 / AC-04.1 / 2 |
| T6 | 发布层骨架 | `deploy/docker-compose.yml` + `traefik.yml` + `nginx.conf` + `acme/.gitkeep` | AC-05.1 |
| T7 | `.gitignore` 落地 | 状态与运行时条目按 AC-06.1 全量覆盖；白名单无冲突 | AC-06 |
| T8 | 依赖安装与首次校验闭环 | `npm ci` → `npm run check` → `npm run build` → `npm run preview` 验证；修复 schema / 类型 / 链接 404 / 图片 404 | AC-02.1–3 / AC-03.4 / AC-04 / AC-07 |
| T9 | Docker Compose 本地联调 | 完成 T8 生成 `dist/` 后 `cd deploy && docker compose up -d`；验证 HTTP 访问首页与静态资源；最后 `docker compose down` 清理 | AC-05.2 / 3 / 4 |
| T10 | Pagefind 验证 | `npx -y pagefind --site dist` 成功生成 `pagefind/` 索引目录；命令写入 `package.json` scripts（如 `"index": "npx -y pagefind --site dist"`）但不默认执行 | AC-07.2 |

---

## 范围边界（Out of Scope）

- 不实现 Backlinks、知识图谱（D3）组件：留给后续 US
- 不接入自定义首页布局与主题定制（Tailwind 覆盖 / 自定义 PageFrame）：Starlight 默认欢迎页即可
- 不配置真实域名 DNS、不执行 acme.sh 签发与 TLS 联调：仅 HTTP 本地验证；acme 配置文件结构具备即可
- 不编写实际长文 / 实际 Wiki 领域内容：仅需示例占位
- 不接入 CI/CD：仓库 Actions / Runner 配置由后续 US 完成
- 不实现 Wikilinks 图片嵌入 `![[]]` 兼容：仅要求标准 `![]()` 相对路径可用

---

## 依赖与参考

- 技术规格主文档：[基本技术选型.md](file:///Users/zouhaisong/mydoc/hs-code/www.haisong.cc/www.haisong.cc-code/docs/01-project-management/sprint00/基本技术选型.md)
  - 内容路由映射：第 3.3 节
  - 图片附件方式 A：第 3.5 节
  - 发布层编排示例：第 4.3 节
- 前置环境：Node.js 22 / npm 10 / Docker 27
- 后续故事承接：Backlinks 与知识图谱；真实域名 + acme.sh 证书；主题定制；Pagefind 接入 Starlight 搜索；CI/CD 流水线
