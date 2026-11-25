# 首版验证与交付记录

日期：2026-11-25（北京时间）。

本文保留首版交付时的验证结果，不作为实时运行状态。后续产品决策与规划见 [项目记忆](PROJECT-MEMORY.md)，增量验证与交接见 [工作记录](WORKLOG.md)；当前测试数量、PR、部署和外部服务状态需重新核实。

## 已交付

- 32 个中文页面，包含定制首页与 Starlight 文档。
- 44 个固定官方来源、1071 个上游索引项；初次手动补跑为 0 篇受影响。后续真实检查已识别 CLI 官方文档变化并生成候选，候选只能通过人工审核发布。
- 四个实际渲染的 960×540 / 30fps / 8 秒原创视频，通过 HyperFrames lint、完整 check、FFmpeg 海报生成及 ffprobe 检查。
- 每例提供可独立下载的 ZIP，包含 HTML、GSAP、字体子集、配置与许可；素材剪辑例额外包含本站自产片段。
- 源文件变更检测、候选稿格式与命令校验、调用预算、人工改稿覆盖保护、人工复核命令。
- GitHub 检查、每日来源同步、草稿 PR、外链待办、受审核保护的预览与正式发布工作流。
- Cloudflare Workers Static Assets 正式站 https://xiaoyingjiang.com/，本地及 PR 预览默认 noindex。

## 自动化与视觉验证

单元测试已扩充到 30 项，覆盖来源差异、候选保护、预算、Markdown 标点转义、来源上下文、快照不可变、SEO/GEO 观测和旧入口路由。CI 包含桌面与手机的 28 项浏览器测试。实际案例海报、首页桌面/手机及文档均已做截图检查。

正式域名直接连接实测：32 页均返回 200，canonical 全部使用正式域名，robots 允许抓取，sitemap、llms、Markdown、内容清单与搜索资源可访问，未知地址返回 404。线上浏览器在桌面和手机分别检索字幕、配音、中文字体、Codex、render，10 次检索均找到对应指南，无横向溢出。未完成中国不同地区和运营商的独立实测，不能视为全国访问验证。

## 账号与外部依赖边界

Cloudflare Wrangler 已完成 OAuth 登录，凭据加密保存，并由 Windows Credential Manager 保护。本地可部署；凭据未复制进仓库或 GitHub。

GitHub 专用 Cloudflare API Token 与 Account ID 已配置。纠正只读 Token 策略后，[自动发布与线上冒烟检查通过](https://github.com/xiaoyingjiang-studio/hyperframes-cn/actions/runs/45546321490)。密钥只在 Secrets 与发布步骤内使用；站点构建和浏览器不读取它们。

外部 AI 已配置为阿里云兼容接口与 deepseek-v4.1-flash。[真实鉴权和候选格式检查通过](https://github.com/xiaoyingjiang-studio/hyperframes-cn/actions/runs/45544489091)，一次请求使用 3385 Token。真实来源同步还暴露并修复了超长来源预算和 Markdown 转义审计问题；最新同步结果以 [Sync official content 工作流](https://github.com/xiaoyingjiang-studio/hyperframes-cn/actions/workflows/upstream.yml) 和待审核 PR 为准。通过接口检查不代表中文稿事实已审核，也不代表网站已经被 AI 搜索引用。没有 AI 仍可执行来源检测、内容编辑、构建和发布。

Studio、Codex、Claude Code、Cursor 的账号内创作步骤已核对官方文档，但未逐一登录实操；页面保留了相应验证限制。CLI 原创案例已经实际执行。

正式域名已接入并开放抓取；搜索平台站点验证、GSC 只读观测授权、IndexNow 和国内多地区访问仍需相应平台或网络条件。Cloudflare 部署历史已记录静态版本恢复演练；日常回滚仍应使用维护手册中的版本 ID 并重新检查线上页面。
