# www.haisong.cc-code

单仓三层架构：编辑层（VSCode + Foam）/ 构建层（Astro + Starlight）/ 发布层（Docker Compose + Traefik + Nginx）。

## 快速开始

```bash
# 1. 安装依赖
npm ci

# 2. 本地开发
npm run dev     # http://localhost:4321

# 3. 构建
npm run build   # 产物输出 dist/

# 4. 预览构建产物
npm run preview

# 5. 生成搜索索引（Pagefind）
npm run index
```

## 内容结构

- **Blog**：`1-articles/`、`0-workspace/0-DailyNote/` → `/articles/`、`/daily/`
- **Wiki（多领域）**：`1-软件研发/` → `/wiki/software-engineering/`；`1-ai-coding/` → `/wiki/ai-coding/`；`1-ai-agent/` → `/wiki/ai-agent/`；`2-tools/` → `/wiki/tools/`；`2-tips/` → `/wiki/tips/`；`2-wiki/` → `/wiki/`
- **Solutions**：`2-solutions/` → `/solutions/`；`2-topics/` → `/topics/`；`2-spikes/` → `/spikes/`（默认 `publish=false`）
- **其他**：`1-aichat/` → `/notes/`

## 发布

```bash
npm run build
cd deploy && docker compose up -d
```

详见：[sprint00 基本技术选型](./docs/01-project-management/sprint00/基本技术选型.md) / [US0001 初始化框架](./docs/01-project-management/sprint00/userstory0001-初始化代码框架.md)
