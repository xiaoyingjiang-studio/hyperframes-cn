# 部署与维护手册

新版官网保留准确提交部署、预览和故障恢复机制。下文涉及 HyperFrames 上游、Pagefind、知识建设、旧测试入口及历史发布的内容属于旧站记录。现行公开内容与发现验收分别见 [项目记忆](PROJECT-MEMORY.md) 和 [SEO/GEO 手册](SEO-GEO.md)。旧工作流已从新版 `.github/workflows/` 移出。配置真实微信号用公开变量 `PUBLIC_STUDIO_WECHAT_ID`，待用户提供。

SEO/GEO 是项目第一优先级的长期基础。每次内容、界面、架构和部署改动都应说明对发现、抓取、索引及引用的影响；Google、百度、Bing 和 AI 工具分别接入与验收。平台台账、最近实测与明确待办统一见 [SEO/GEO 手册](SEO-GEO.md)，历史操作证据见 WORKLOG；单次 Google 验证或站内检查通过不能作为整体完成标准。

## 1. 账号与仓库

仓库建议命名 hyperframes-cn，公开代码和内容。默认分支 main，启用 Issues 与 Discussions。更新 PUBLIC_REPOSITORY、CODEOWNERS 和 README 中的仓库归属。先检查 git status，避免把 .env、缓存和私人素材纳入提交。

本站现归小影匠工作室组织 `xiaoyingjiang-studio`，源码地址为 `https://github.com/xiaoyingjiang-studio/hyperframes-cn`。本地 origin 应指向该地址；原个人仓库链接由 GitHub 重定向。CODEOWNERS 中的 `@zhkuang` 保留为实际维护者，不替换为不存在的组织团队。案例与资源精选仓库为 `xiaoyingjiang-studio/awesome-hyperframes`，独立维护，不部署为本站。

GitHub 组织公开主页独立维护在 [`xiaoyingjiang-studio/.github`](https://github.com/xiaoyingjiang-studio/.github) 的 `profile/README.md`，本地工程为相邻的 `xiaoyingjiang-profile` 目录。该仓库仅承载组织介绍、项目入口与原创案例预览，不复制网站教程或资源目录，不添加影响其他仓库的组织级默认社区模板。主页修改经 PR 人工审核、手动合并后，再检查组织公开 Overview；不能将候选分支渲染视为已经发布。预览图复用原项目固定提交，保留素材归属与框架案例的验证边界。

在 GitHub Settings → Actions → General 中允许 Actions 创建 PR。仅同步任务需要 contents/pull-requests/issues 写权限，普通 PR 检查只读。main 保留 PR、严格 check 和会话解决要求，审核人数为零。受信知识流水线检查后自动合并，无人工批准节点；禁止绕过保护。网站代码与策略单独维护。

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

正式域名的搜索运维还需维护各平台所有权验证、规范 sitemap 提交、关键网址抓取与索引、真实搜索效果和 AI 引用样本。Google DNS 验证记录应保留；百度、Bing 与其他平台按官方当前提供的能力分别操作。发布后已有且配置完成的通知继续自动执行，未接入项保留待办和原因；不要把未配置时的跳过当作提交成功。收录延迟不阻止合格内容自动发布；已确认的站内抓取或发现回归须先修复。

## 5. 创作者知识自动建设

每周一、周四北京时间 08:30（UTC 00:30）运行 Build creator knowledge，支持手动补跑；不再每日运行。SEO/GEO 优化保留手动入口，不设置独立定时触发。使用官方最新正式 release 的固定提交盘点文档、skills 发布清单、引用材料和 registry；主分支差异单列前瞻。桌面应用版本不能由 CLI release 推定。

`pnpm knowledge:inventory` 盘点与归档；`pnpm knowledge:sync --apply` 生成并应用通过独立核验的正文、摘要与来源单元。每批最多五篇，共享十五次调用及十万保守 Token 预算。失败项进入持久队列并自动退避，其他合格文章继续发布。缺少模型时仍检测与构建，保留旧站。

一次性验收可通过手动运行的 entity 输入指定已登记的知识实体 ID，例如 capability-4k-rendering；仍执行同一生成、独立核验、预算、内容检查、自动合并与生产发布链路，保留其余队列。该输入不能指定网址、文件路径或任意任务，不能用于定时触发，也不强制重写未变化或仍在退避中的页面。定时任务继续按默认优先级处理。

工作流先提交候选树，再执行内容文件白名单、稳定地址、正文摘要哈希、来源引文、完整网站检查与浏览器验收；通过后自动创建内容 PR 并按准确 SHA 合并。主分支变化使旧结果失效，不覆盖人工修改或已有自动化分支。生成器不能改网站代码、工作流、首页、许可和预算。

新文章的中文标题与主问题随正文一同生成并独立核验，不能直接把上游文件名作为标题；网址仍由登记的实体 ID 确定。主分支只有未跟踪代码变化、被跟踪来源内容不变时，保留上一来源索引与固定链接，不因提交 SHA 改变而反复创建内容 PR；本轮观察到的最新 SHA 仅记入运行报告。

内容任务在并发等待结束后读取受保护 main，再以实际检出 SHA 固定本批基线；检查、合并和发布继续绑定准确提交。页面与机器接口从文章记录单独展示当前来源版本，通用资料版本不再混入旧适用说明；历史实测版本、验证边界和 reviewedAt 保留。

已发布的自动能力文章仍作为同一个生成主题登记，不能因正文已存在而转入旧文兜底或改变目录顺序；正常盘点不会重复生成、提交同一来源与正文。入口 ID 在可见适用说明中使用统一可读名称，机器关联仍保留稳定 ID。

Markdown 候选使用标准解析器识别行内与块级代码示例，示例中的 HTML 标签只作文字；正文中的原始 HTML、模块代码与 MDX 仍禁止。解析来源或候选均不执行代码。

合并后显式调用 reusable production workflow。知识验收不经过需人工批准的 preview；production 只保留受保护分支限制，无 reviewer。外部代码预览继续保留原有审批与密钥隔离。

发布保存上一 Cloudflare 部署，检查新站与构建 SHA；失败自动恢复旧部署并复查。失败文章摘要通过 knowledge-failure 标签保存，阻止原样重复上线，并进入后续自动修复。没有可回退版本或无法读取旧清单时不发布。

首批 source-based 明确标注固定来源整理；auto-checked 必须有独立模型与逐节引文核验。历史 reviewedAt 不刷新。案例固定播放器与 Markdown 正文分离。旧 review-content 与优化候选脚本只保留历史兼容，不进入活动流程。

页脚是已发布构建的状态，不是后台实时服务；最新结果查看 Actions、队列与报告。工作流配置、本地模拟和 PR 创建不能代替真实发布验收。

## 6. AI 适配与消耗

接口使用 HTTPS，Bearer 密钥，仅从 Secret 读取。请求包括 model、messages、max_tokens、temperature；服务需返回 choices[0].message.content，写作返回 body/answer/summary JSON，独立核验返回 supported/issues/notes/evidence 及 teaching JSON。teaching 的 explainsConcept、connectsExample、givesNextStep 必须全部为 true，防止只有事实罗列却没有新手解释的候选发布；失败与证据核验共用一次修订机会。具体标准见 CONTENT。如供应商格式不同，新增适配器，不把密钥交给浏览器。

DashScope 的 DeepSeek V4 混合模型显式设置 enable_thinking=false 与 response_format=json_object，防止默认思考消耗完既定输出额度而没有正文；不增加输出或批次预算。其他供应商不注入此专用参数。依据：[官方思考模式说明](https://www.alibabacloud.com/help/en/model-studio/deep-thinking)。

默认每批五篇、最多十五次尝试、保守累计十万 Token 预算。输入预算按 UTF-8 字节保守预留，输出按请求上限预留，不依赖服务商的计费估计。认证/余额/配置错误立即停止；可重试错误每页最多两次重试。金额硬上限需要所选供应商自身支持并配置。

知识请求按完整段落选取证据，上下文控制在 14KB 内，默认输出分配为 4000 Token；完整来源仍归档，未展示部分不能用于推断。此分配为独立核验及最多一次修订复检留出空间，不提高十五次调用和十万批次上限。错误引文、格式或未确认命令也进入同一次修订机会，第二次失败保留旧正文。逐篇任务、核验问题及延期原因写入运行日志。

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
