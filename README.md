# www.haisong.cc

基于 [Astro](https://astro.build) + [Starlight](https://starlight.astro.build) + `starlight-blog` 构建的个人站点，统一承载 Blog 与 Wiki 两套内容体系。

---

## 技术栈

| 层级 | 选型 | 说明 |
|---|---|---|
| 框架 | Astro 7 | 内容驱动的静态站点生成器 |
| 主题/文档 | Starlight 0.41 | 文档站原生组件（Sidebar / TOC / i18n / Search） |
| 博客插件 | starlight-blog 0.28 | 扩展 Starlight，提供博客列表、标签、RSS |
| 样式 | Tailwind CSS 4 + `src/styles/custom.css` | 主题变量覆盖，禁用链接蓝色/下划线，H2/H4 视觉增强 |
| 运行时 | Nginx 1.27 Alpine | 生产镜像以 Nginx 托管 `dist/` 静态产物 |
| 反向代理 / TLS | Traefik 2.11 | 统一入口，ACME TLS-ALPN-01 自动签发证书 |
| CI/CD | Drone（Docker Runner） | 同机构建镜像 + 滚动部署，免 Registry |

---

## 内容结构

```
src/content/docs/         # 单一 Starlight collection
├── blog/                 # 博客文章（starlight-blog 接管路由）
│   └── *.md
└── wiki/                 # Wiki 文档（Starlight 原生渲染）
    ├── home.md
    └── <topic>/*.md

src/pages/                # 非 Starlight 独立页面（使用 MainLayout.astro）
├── index.astro           # 首页
├── works/                # 作品集
└── contact/              # 联系方式
```

- 站点身份、Favicon、SEO、Footer（含 ICP 备案号）统一在 [src/config/site.config.mjs](src/config/site.config.mjs) 管理。
- `blogSchema` 扩展自 `docsSchema`，定义见 [src/content.config.ts](src/content.config.ts)。
- 自定义组件覆盖：[Footer.astro](src/components/Footer.astro)、[Logo.astro](src/components/Logo.astro)、[SiteTitle.astro](src/components/SiteTitle.astro)。

---

## 本地开发

> 前置依赖：Node.js >= 20

```bash
# 安装依赖
npm ci

# 启动开发服务器  (默认 http://localhost:4321)
npm run dev

# 类型检查 + 生产构建，产物输出到 dist/
npm run build

# 本地预览构建产物
npm run preview

# 构建本地搜索索引（Pagefind）
npm run index

# 清理缓存
npm run clean
```

---

## Docker 构建

多阶段 Dockerfile：Node 20 Alpine 构建 → Nginx 1.27 Alpine 运行。

```bash
# 项目根目录构建
docker build -t blogwiki:local .

# 本地直接验证（无 Traefik）
docker run --rm -p 8080:80 blogwiki:local
# 浏览器访问 http://localhost:8080
```

构建上下文排除规则见 [.dockerignore](.dockerignore)。

---

## 生产部署（Traefik 集成）

### 架构说明

不重复部署 Traefik，直接复用现有基础设施网络 `traefik_net`：

```
Traefik (47.116.69.118:443, traefik_net)
  └── router: blogwiki → Host(`www.haisong.cc`)
        └── service: blogwiki@docker  (本项目容器)
```

### 1. 准备 DNS 与端口

| 项 | 配置 |
|---|---|
| 阿里云 DNS A 记录 | `www` → `47.116.69.118`（服务器公网 IP） |
| 阿里云安全组 / ufw | 放行 TCP 443 入方向 |

TLS-ALPN-01 挑战由 Traefik 在 443 端口完成，不需要 80 端口，也不需要 DNS 插件。证书存储于 Traefik 侧 `./letsencrypt/acme.json`。

### 2. 部署清单

将本项目 `deploy/` 目录复制到服务器（例如 `/opt/www.haisong.cc/deploy/`），结构如下：

```
/opt/www.haisong.cc/
├── Dockerfile
├── .dockerignore
├── src/
├── package.json
├── package-lock.json
└── deploy/
    ├── docker-compose.yml
    └── nginx.conf
```

### 3. 启动

```bash
cd /opt/www.haisong.cc/deploy

# 1) 构建镜像 + 启动
docker compose up -d --build

# 2) 验证容器网络已接入 traefik_net
docker inspect blogwiki | jq '.[].NetworkSettings.Networks | keys'
# 期望输出包含 "traefik_net"

# 3) 验证路由在 Traefik 中已注册
# 访问 Traefik Dashboard → HTTP Routers，应看到 blogwiki 条目

# 4) 访问
curl -I https://www.haisong.cc
# 期望：HTTP/2 200，Server: nginx
```

### 4. Compose 关键配置（已在 [deploy/docker-compose.yml](deploy/docker-compose.yml) 就位）

```yaml
services:
  blogwiki:
    build:
      context: ..
      dockerfile: Dockerfile
    image: blogwiki:latest
    container_name: blogwiki
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=traefik_net"
      - "traefik.http.routers.blogwiki.entrypoints=websecure"
      - "traefik.http.routers.blogwiki.rule=Host(`www.haisong.cc`)"
      - "traefik.http.routers.blogwiki.tls=true"
      - "traefik.http.routers.blogwiki.tls.certresolver=myresolver"
    networks:
      - traefik_net

networks:
  traefik_net:
    external: true
    name: traefik_net
```

> `myresolver` / `websecure` / `traefik_net` 名称必须与 Traefik 基础设施的 docker-compose 中定义完全一致。

### 5. 常见问题排查

| 现象 | 诊断命令 | 修复方向 |
|---|---|---|
| 浏览器显示 Traefik 默认自签证书 | `docker logs -f traefik \| grep -i acme` | 检查 DNS 解析是否指向本机器、443 是否公网可达 |
| 路由未注册（404） | `docker compose ps` → 容器是否 Up，`traefik.enable=true` 是否存在 | 重新 `docker compose up -d`，确保容器已接入 `traefik_net` |
| 502 Bad Gateway | `docker exec traefik ping blogwiki`（失败说明网络不通） | 核对 `traefik.docker.network=traefik_net` 与 `networks:` 段 |

---

## 持续集成（Drone CI）

Drone 与 Docker 运行于同一台服务器，通过挂载宿主机 `docker.sock` 直接构建+部署，**无需镜像仓库**。

### Pipeline 定义

见 [.drone.yml](.drone.yml)：

```yaml
kind: pipeline
type: docker
name: build-and-deploy

platform:
  os: linux
  arch: amd64

trigger:
  event:
    - push
    - custom
  branch:
    - main

steps:
  - name: build-and-deploy
    image: docker:27
    volumes:
      - name: docker_sock
        path: /var/run/docker.sock
    commands:
      - docker compose -f deploy/docker-compose.yml build blogwiki
      - docker compose -f deploy/docker-compose.yml up -d blogwiki
      - docker image prune -f

volumes:
  - name: docker_sock
    host:
      path: /var/run/docker.sock
```

### 触发方式

| 触发 | 说明 |
|---|---|
| `push` 到 `main` 分支 | Git push 自动构建部署 |
| `custom` 事件 | Drone UI → NEW BUILD / 或 API 手动触发（支持参数化） |

### Runner 前置配置

Drone Docker Runner 需要允许 Host Volume 挂载：

1. 仓库在 Drone 中标记为 **Trusted**（Settings → General → Project Settings → *Trusted*）。
2. 验证 Runner 容器未设置 `DRONE_ESCALATE_DISABLED=true`（默认允许）。

若未启用 Trusted，Drone 会在执行时因 `volumes.host` 被拒绝而失败。

### 手动触发示例（Drone CLI）

```bash
drone build trigger <repo-namespace>/<repo-name> \
  --branch main
```

### 部署回滚

```bash
# 进入服务器部署目录
cd /opt/www.haisong.cc/deploy

# 查看历史镜像（手动打 tag 的可回退）
docker images blogwiki

# 直接用上一个本地 tag 重启
docker tag blogwiki:latest blogwiki:rollback
# …修改 compose image: 指向目标 tag 后
docker compose up -d blogwiki
```
