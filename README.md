# HyperFrames 中文指南

后续维护先读 [项目记忆与工作入口](docs/PROJECT-MEMORY.md)，了解产品定位、已确认约束、实现位置与后续规划；阶段进度和验证边界记录在 [工作记录](docs/WORKLOG.md)。SEO、内容审核与部署的详细规则仍由各自手册维护。

面向中国创作者的独立社区网站：首页展示 HyperFrames Studio、真实作品与官方下载入口，中文指南承接安装、上手和进阶实践，并提供四个原创框架视频案例与随官方更新的内容维护工具。

HyperFrames 由 HeyGen 开发。本站为独立社区项目，官方来源为 https://github.com/heygen-com/hyperframes 。

正式域名：https://xiaoyingjiang.com/ 。本地与 PR 预览默认 noindex；配置与发布状态以站点配置、GitHub Variables 和实际工作流为准。

公开源码：https://github.com/xiaoyingjiang-studio/hyperframes-cn

由[小影匠工作室](https://github.com/xiaoyingjiang-studio)维护。优质案例与资源目录独立收录在 [awesome-hyperframes](https://github.com/xiaoyingjiang-studio/awesome-hyperframes)。

## 本地运行

使用 Node.js 24.16.0 和 pnpm 10.32.1：

~~~sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
~~~

本地默认 http://localhost:4321 。中文搜索索引在构建时生成，检查搜索时使用：

~~~sh
pnpm check
pnpm test
pnpm build
pnpm preview
~~~

复制 .env.example 为本地忽略的环境文件时，只填写自己需要的字段。Astro 处理站点环境配置；独立 Node 脚本如需读取本地配置，使用 `node --env-file=.env.local scripts/sync.mjs`，不会自动加载密钥文件。

## 项目交付

- 32 个首版页面，覆盖产品、入门、能力、指南、案例、更新与贡献。
- Astro 定制首页、Starlight 文档、本地中文搜索、主题与移动端适配。
- 44 个固定官方来源快照、完整官方源文件索引、来源到中文页面的映射。
- 外部模型 HTTP 适配器、受限候选生成、人工复核、差异报告和每日 GitHub 工作流。
- 四个原创 HyperFrames 项目、实际 MP4 与海报、字幕轨和机器可读验证记录。
- Cloudflare Workers 静态部署、PR Preview、SEO 开关、域名迁移、检查与回滚说明。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| pnpm check | Astro 类型检查、来源与内部链接校验 |
| pnpm test | 来源变化、AI 校验、限流与预算等测试 |
| pnpm build | 静态页面、搜索、站点地图、RSS、llms.txt、响应头 |
| pnpm test:e2e | 桌面与手机的关键交互；需先安装 Playwright Chromium |
| pnpm sync | 检查官方变化并生成候选数据，不修改正文 |
| pnpm sync --apply | 在新的审核分支写入候选正文，标为 needs-review |
| node scripts/review-content.mjs ID | 人工核实后更新指定页面的审核基线与日期 |
| pnpm links | 检查外链并保留结果，不把访问限制直接判断为失效 |
| node scripts/render-examples.mjs | 重新检查并渲染全部案例；需要 FFmpeg 与 Chrome |

首次复现浏览器测试：`pnpm exec playwright install chromium`。本地已经安装 Google Chrome 时可设置 `LOCAL_CHROME=1`，CI 则使用固定的 Playwright Chromium。

## 发布到自己的 GitHub 与 Cloudflare

1. 创建公开 GitHub 仓库，推送工程；仓库名建议 hyperframes-cn。
2. 在 Cloudflare 创建 Worker 或首次使用 Wrangler 部署，采用仓库内 wrangler.jsonc；不同时启用 Workers Builds。
3. 根据[部署与维护手册](docs/MAINTAINER.md)设置 GitHub Environments、Secrets、Variables 与分支规则。
4. 手动运行 Deploy production，确认工作流成功与线上冒烟检查结果。
5. 新部署先用真实 workers.dev 地址验证，保持 SITE_INDEXABLE=false；本站正式域名与旧入口迁移规则见 [SEO/GEO 维护手册](docs/SEO-GEO.md)，不要用新部署示例覆盖现有配置。

本站已有正式域名与 GitHub 自动发布的历史验证记录，见 [首版交付记录](docs/DELIVERY.md)。当前配置与运行结果需从实际工作流核实；本地默认仍保持 SITE_INDEXABLE=false。AI 接口配置独立于网站发布。

## 内容规范

先阅读[内容写作与审核规范](docs/CONTENT.md)，按页面模板写内容，保留稳定 ID、来源、核对日期及验证边界。案例是否成功以 public/examples/verification.json 为准，版本信息不是对其他环境的保证。

代码和维护脚本采用 Apache-2.0，原创中文文字采用 CC BY 4.0；上游与第三方素材保留各自许可，见 LICENSE、CONTENT_LICENSE.md 和 THIRD_PARTY_NOTICES.md。
