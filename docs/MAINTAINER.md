# 部署与维护手册

## 1. 账号与仓库

仓库建议命名 hyperframes-cn，公开代码和内容。默认分支 main，启用 Issues 与 Discussions。更新 PUBLIC_REPOSITORY、CODEOWNERS 和 README 中的仓库归属。先检查 git status，避免把 .env、缓存和私人素材纳入提交。

在 GitHub Settings → Actions → General 中允许 Actions 创建 PR。仅同步任务需要 contents/pull-requests/issues 写权限，普通 PR 检查只读。main 要求 PR 与 Checks / check 通过，禁用自动合并；单维护者阶段不要求无法自我满足的另一位审核者批准。新增维护者后再启用 CODEOWNERS review。

## 2. Cloudflare 首次配置

本项目使用 Workers Static Assets。Wrangler 已作为本地依赖锁定，配置见 wrangler.jsonc，不需要 SSR 适配器、D1、KV、R2 或运行时 AI 密钥。

先由账号持有人在本机完成 `pnpm exec wrangler login`，然后运行 `pnpm exec wrangler whoami` 确认账号。也可在 GitHub Environments 中使用仅限目标账号的部署 Token。不要将 Token 填入网页输入或代码。

创建 GitHub 的 production 与 preview Environments；preview 设置维护者批准，尤其是手动预览外部 Fork PR 时，必须审核提交 SHA。CLOUDFLARE_API_TOKEN、CLOUDFLARE_ACCOUNT_ID 使用仓库 Actions Secrets（发布前的配置检查也需要它们），环境内可另作覆盖。Cloudflare Token 选择“编辑 Cloudflare Workers”模板，限定目标账号；Workers Scripts 必须有编辑权限，“读取所有资源”模板不能发布。避免全局 API Key。

在仓库 Variables 中设置：

| 名称 | 值 |
| --- | --- |
| SITE_URL | 实际分配的 https://hyperframes-cn.<你的子域>.workers.dev，或以后正式域名 |
| SITE_INDEXABLE | 默认 false，正式域名切换和验证后才 true |
| OLD_DEFAULT_HOST | 正式域名上线时填写旧 workers.dev 主机名，不带协议 |
| AI_ENDPOINT、AI_MODEL | 可选，完整 Chat Completions HTTP 端点与模型名 |

AI_API_KEY 放仓库 Actions Secret，仅来源同步步骤读取。站点构建不需要它。

首次可在本地构建后使用 `pnpm exec wrangler deploy` 获取真实默认地址，再将其填入 SITE_URL 重新构建部署。GitHub 的 Deploy production 工作流要求已配置真实 HTTPS 地址，防止生成 localhost canonical。不要开启 Cloudflare Workers Builds，否则会出现两套构建发布链路。

## 3. 正式发布与预览

每次 main 更新运行正式工作流：冻结依赖安装、类型与内容检查、单元测试、拒绝 needs-review、构建、部署与线上冒烟检查。记录 Git SHA 和 Cloudflare deployment/version ID。

PR 预览使用 `wrangler preview --name pr-<编号>`，不会替换正式部署。可信仓库分支自动进入 preview Environment 的批准流程；Fork PR 只执行无密钥检查，需要维护者确认完整 SHA 后手动触发 Preview，输入 PR 与 SHA。工作流再次比较当前 PR HEAD，变化后要求重新核对。不要对未审阅的外部提交批准部署。

关闭 PR 自动清理可信分支预览。Fork 手动预览可在确认关闭后运行 `pnpm exec wrangler preview delete --name pr-<编号>`。预览使用 workers.dev，保持 noindex，不绑定正式域名与生产数据资源。

## 4. 域名切换

在 Cloudflare 为 Worker 添加自定义域名并检查 HTTPS。更新 SITE_URL、OLD_DEFAULT_HOST，重建并验证 canonical、sitemap.xml、rss.xml、llms.txt、静态资源与旧默认地址跳转。确认后设置 SITE_INDEXABLE=true。预览与本地环境继续 false。

跨主机迁移由一个只处理地址的 Worker 完成，因为 Static Assets 的 `_redirects` 不支持域名条件。`pnpm build` 生成忽略目录 `.cache/edge-site.json`，部署前必须完整构建；其中只有公开地址和收录开关，没有密钥。旧主机的页面和机器接口以 301 保留路径及查询；正式站和预览交给 ASSETS，保留真实 404。CSS、搜索索引、图片、视频和示例资源直接由静态资产服务，旧资源链接继续可用。HTML/机器接口经过 Worker，因此受 Workers 请求配额约束；静态资源仍直接服务。不要把所有资源都改成 Worker-first。

没有环境变量覆盖时，site.config.json 是站点地址、源码仓库和收录开关的唯一默认配置。正式域名切换时同时更新该文件，并保持 GitHub Variables 一致。

外部搜索平台收录情况与国内网络访问需要实际测试，不把本机成功当作所有地区成功。记录地区、网络、时间、页面首屏、搜索和视频是否能完成加载；未经测试的地区不要标注通过。

## 5. 官方来源同步

每日 01:17 UTC（北京时间 09:17）从固定官方提交采集。手动补跑 Sync official content 使用同一个流程。GitHub 定时任务可能延迟，公开仓库长期不活跃可能停用；在 Actions 页面检查启用状态。

已有 automation/upstream PR 时，仅重新检测、更新同步待办和 artifact，不覆盖审核分支。没有打开的批次时，最多生成五页 Markdown 候选，运行检查后创建草稿 PR。缺少 AI 或部分生成失败时保留差异和人工待办。

查看 .upstream/report.json 的 affected、generated、skipped、queue 和来源变化。snapshot 的 commit 固定上游版本。sources.json 的 path 是来源位置；如果官方移动并修改文件，需要维护者修复路径与归属，不能自动认为删除功能。

人工审核步骤：

1. 打开候选页面、旧来源、新来源和 PR 差异。
2. 核实产品事实、命令、代码、适用系统、账号和费用条件；含播放器的 MDX 页面手工修改。
3. 必要时执行实际操作，记录未验证边界。
4. 对完成的文章运行 `node scripts/review-content.mjs <contentId>`，一次可以传多个 ID。
5. 提交基线与日期变更，运行 pnpm check、pnpm test、pnpm build，查看预览后手动合并。

没有审核完成的来源可以继续留在待办；已生成且标为 needs-review 的正文必须先复核，正式部署会阻止发布。不要用 --bootstrap 推进日常审核，bootstrap 只用于项目初次建立基线。

网页页脚反映已发布构建中的来源检查状态；最新运行与错误以 Actions、同步待办和 artifact 为准。静态站不向 GitHub 实时请求，不能把当前页脚时间当成后台此刻状态。

## 6. AI 适配与消耗

接口使用 HTTPS，Bearer 密钥，仅从 Secret 读取。请求包括 model、messages、max_tokens、temperature；服务需返回 choices[0].message.content，其中为 body/summary/checks JSON。用量取 usage，如供应商格式不同，新增适配器，不把密钥交给浏览器。

默认每批五篇、最多十五次尝试、保守累计十万 Token 预算。输入预算按 UTF-8 字节保守预留，输出按请求上限预留，不依赖服务商的计费估计。认证/余额/配置错误立即停止；可重试错误每页最多两次重试。金额硬上限需要所选供应商自身支持并配置。

CI 使用本地模拟响应覆盖成功、解析失败、限流、认证与预算；没有配置真实服务前，不声称已验证供应商连接与实际中文生成质量。

## 7. 复现案例与浏览器检查

仓库内已保存实际成片、海报、字幕、HTML、字体子集及依赖。检查记录 public/examples/verification.json 包括版本、平台、命令结果和 ffprobe 输出。

需要改文案时先遵循 DESIGN.md：运行 `node scripts/create-examples.mjs` 重建规范源码，`node scripts/prepare-font.mjs` 更新 Google 官方字体子集，最后 `node scripts/render-examples.mjs` 执行 lint、完整 check、实际渲染、海报与 ffprobe。脚本需要本地 Chrome、FFmpeg，字体准备阶段需要网络；普通网站构建不需要这些步骤。

修改字体后应重新检查字形；视频无音轨是教学选择，不是音频服务故障。打开海报与实际视频复核，检查通过不能替代看画面。

浏览器测试先运行 pnpm build。CI 安装 Playwright Chromium；本机可用 LOCAL_CHROME=1 使用已安装 Chrome。测试覆盖桌面与手机、搜索、主题、来源链接、视频加载策略和 404。

## 8. 失败与回滚

构建失败不运行部署。来源/AI 故障保留旧站，失败记录与运行链接进入 Issue。外链 403/429 记录为访问限制，人工核实后再替换。更改源码不会自动修复服务商账号或余额。

正式回滚：在 Cloudflare Deployments 选择上一已知可用版本，或使用 `pnpm exec wrangler rollback <版本ID>`。确认首页、教程、搜索资源与 404 后，再 revert 有问题的 Git 提交并修正，确保后续自动部署不会重新发布错误。

本地回滚演练可将两次构建保存到 artifacts/release-a 与 release-b，通过目录切换验证旧页面与搜索可恢复。真实 Cloudflare 版本回滚仍需登录账号后单独演练并记录版本 ID，不能用本地演练冒充。

不依赖 GitHub Secrets 的检查可完整本地完成。真实账号部署、域名配置、登录态教程、真实模型质量和国内多地区访问需要相应账号/网络条件，交付时逐项记录是否完成。
