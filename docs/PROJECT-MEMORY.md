# 项目记忆与工作入口

本文件保存跨会话需要延续的产品决策、工作方式和规划。开始工作先读 [AGENTS.md](../AGENTS.md) 与本文，再按任务阅读具体规范；阶段交接见 [WORKLOG.md](WORKLOG.md)。代码、配置和实际检查结果用于核实当前状态，历史记录不能代替核实。用户后续明确调整方向时，更新相关决策及原因，不反复执行已经完成或被替代的计划。

## 当前官网的工作边界

- 2026-11-28 小影匠工作室官网经 PR #31 发布，旧指南路径生产冒烟返回 404。构建使用 `public-studio/`，指南和旧素材留作历史资料。新版删除旧知识更新、发现优化和外链巡检入口，旧工作流可从 Git 历史查询。
- 小影匠首批服务不露脸的原创内容创作者。[创作者出海手册](STUDIO-EDITORIAL.md) 已发布 `/creators/` 及三篇首发。首页导航、页脚和改编示例链接到手册，正文可以回到代表作合作入口。SEO/GEO 继续按 [项目规范](SEO-GEO.md) 分别验收。
- 用户明确增量内容要吸引已有作品的创作者出海，让他们看到海外市场的机会和空间，以及相近创作者已经取得的成功与收益。手册先以 YouTube 为观察对象，轮换市场机会与成功案例，旧文随新报告和新披露更新。公开收益按来源和实际口径写，创作手法服务于解释案例路径。两类模板、选题和复查办法见 [编辑规格](STUDIO-EDITORIAL.md#手册与更新来源)。
- 新版 [定时内容任务](../.github/workflows/studio-content.yml) 沿用北京时间周一、周四 08:30，分别优先市场文章与成功案例。受信来源和主题登记见 `content/studio-sources.json`。现有 AI 和 Cloudflare 配置已实际用于自动发布，`STUDIO_CONTENT_PUBLISH_ENABLED=true`。首次真实 `schedule` 事件及搜索平台结果仍待观测，手动验收见工作记录。
- 对外文案强调合作分工，用旁白、图解、动画和录屏说明作品形式。首页与手册的氛围主图保留替代文字，生成来源记在 [品牌资产说明](../assets/brand/README.md)。实际案例与自制分镜示例继续区分。
- 首页以一条已有作品作为合作起点。首屏后先展示面向新观众的改编理由，再展示试运营分工、复盘内容与合作边界，最后用作品自查和代表作联系入口承接。对外说明具体交付，平台、时长、账号与退出条款按实际合作确认。试运营效果待通过真实合作验证。
- 微信号由用户后续提供，官网可读取显式配置的 `PUBLIC_STUDIO_WECHAT_ID`。微信号未配置时显示作品清单与本地复制模板。页面、视觉和文案分别由 [首页](../src/pages/index.astro)、[样式](../src/styles/xiaoyingjiang.css) 和 [官网规格](STUDIO-SITE-COPY.md) 维护。
- Astro 静态构建、Cloudflare Workers、域名及收录配置沿用。公开页面注册位置是 [landing-pages.mjs](../scripts/lib/landing-pages.mjs)，手册正文在 `src/content/creators/`，文章栏目、延伸阅读与来源登记在 [creator-guides.json](../content/creator-guides.json)，主问题与可见摘要仍见 [discovery.json](../content/discovery.json)。本地依次执行 `pnpm check`、`pnpm test`、`pnpm build`，涉及发现和界面分别追加 `pnpm test:indexing`、`pnpm test:e2e`。

## 产品定位与已确认决策

2026-11-28 用户将网站下一阶段定位调整为 **小影匠工作室官网**。工作室服务中国主播，帮助他们建立并运营面向海外线上媒体的个人 IP。主播专注创作，工作室承担双方约定的海外运营，合作理念是共赢。用户随后明确首批服务不露脸的创作者，以 [Casual Finance](https://www.youtube.com/@CasuallyFinance) 为内容形态参照。首页据此聚焦原创旁白、动画、图解和录屏内容。获客是官网首要业务目标，与既有 SEO/GEO 长期约束一起纳入设计。研究与实施建议见 [官网改版策划](STUDIO-STRATEGY.md) 和 [官网文案与交互规格](STUDIO-SITE-COPY.md)。服务平台、试点容量、条款和真实收件方式需工作室核实后对外承诺。

### HyperFrames 中文指南历史约定

用户曾评估将工作室和社区入口并列，随后明确停用旧站。以下旧定位、文件入口和自动运行记录仅用于回顾，不作为现行公开站点或定时配置。HyperFrames 由 HeyGen 开发，旧社区入口曾为产品展示与创作入口，文档承接能力、Studio 创作、机制、skills、方法与问题排查。

2026-11-26 用户明确：**SEO、GEO 是项目第一优先级和长期根基**，覆盖 Google、百度、Bing、其他相关搜索引擎及 AI 联网搜索与引用。该要求贯穿选题、正文、界面、架构和发布验收；不能把 Google 接入、构建审计或提交成功当作整体完成。平台接入台账、证据标准与下一步统一维护于 [SEO-GEO.md](SEO-GEO.md)，历史实测保存在 WORKLOG。真实性与读者理解仍是前提，不为排名堆词或制造页面；不改变既定每周一、周四 08:30 节奏与预算。

维护方为**小影匠工作室**，GitHub 组织为 [`xiaoyingjiang-studio`](https://github.com/xiaoyingjiang-studio)。本站工程位于 [`hyperframes-cn`](https://github.com/xiaoyingjiang-studio/hyperframes-cn)，案例与资源精选独立维护在 [`awesome-hyperframes`](https://github.com/xiaoyingjiang-studio/awesome-hyperframes)；后者是资源目录，不重复承载中文指南或网站部署。`awesome` 是正确拼写，仓库名采用常见的 `awesome-主题` 顺序。

组织公开首页由独立的 [`.github`](https://github.com/xiaoyingjiang-studio/.github) 仓库维护，候选正文位于 `profile/README.md`，本地目录为相邻的 `xiaoyingjiang-profile`。组织首页负责介绍工作室、连接两个项目、展示四个原创框架案例及引导贡献；不复制教程或制造社区规模数据。主页正文经 PR 人工审核后手动合并，发布与候选状态以实际 GitHub 记录为准；维护规则见 [MAINTAINER.md](MAINTAINER.md)。

核心受众是已有内容、希望制作视频的创作者，优先关注产品介绍、知识讲解和营销内容。首要行动为前往官方下载 Studio；现有下载地址由 `src/lib/site.ts` 的 `studioDownload` 维护，不托管安装包。

已确认的核心表达：

> 把想法做成视频，把细节改到满意。

叙事围绕“表达想法—查看作品—继续修改—导出交付”。Studio 是首页唯一的主要产品入口，Agent、HTML、CLI 放在指南与进阶入口，不再把首页设计成技术文档、模拟终端或代码工作台。

用户连续反馈形成的设计要求：

- 默认亮色，全站使用黑白灰。用户于 2026-11-26 明确取消原绿色方向；包括首页、文档、导航、按钮和明暗主题，作品与原始产品截图保留颜色。
- 画面承担主要说明，减少长段文字；真实作品与真实界面优先。
- 字体、字号、字重、颜色、间距和留白需要统一推敲，避免演示页面的粗糙感。
- 顶部不能只有呆板的固态文字；保留有节制的标题、导航和画面动效，遵守减少动态效果偏好。
- 参考 [Screen Studio](https://screen.studio/) 的产品叙事；用户允许从 [HyperFrames 官网](https://hyperframes.heygen.com/) 获取 Studio 资源。参考用于方向判断，页面布局与素材仍需实际核对。

HyperFrames 社区入口由左右分栏首屏、错落作品画廊、三个创作界面切换、下载收尾和来源说明组成。两套入口的视觉参数与交互规则统一维护在 [DESIGN.md](../DESIGN.md)，不要在多份记忆里重复保存色值。

HyperFrames 社区入口与知识库共用用户于 2026-11-26 提供的图标 `public/favicon.ico`。原图归档于 `assets/brand/`，转换范围与再生成方式见该目录说明及 DESIGN。小影匠首页使用独立工作室图标。

## 不应丢失的边界

- 首页默认浅色；首页主题与文档主题分别保存，不能相互覆盖。
- 文档正文、稳定 ID 与既有网址保持稳定，不为首页再造重复产品介绍页。
- 四个社区原创案例是 HyperFrames 框架作品，其概念界面不代表真实 Studio；官方作品也不等于本站 Studio 实操证明。
- 官方录屏需标明来源；加速等待的录屏不能用于宣称真实生成耗时。真实截图与概念画面明确区分。
- 视频由用户点击后按需加载，不自动播放；无 JavaScript 时仍有正文、下载、导航和原生媒体入口。
- 官方来源固定提交；普通文案或样式调整不刷新 `reviewedAt`。AI 不擅改域名、收录开关、路由、审核基线、许可或体积预算。
- 代码 Apache-2.0，原创中文内容 CC BY 4.0；第三方素材保留各自权利与许可。不记录或输出密钥。

## 资料与实现位置

| 入口 | 职责 |
| --- | --- |
| [DESIGN.md](../DESIGN.md) | 首页视觉、字体、动效与原创案例的设计约定 |
| [CONTENT.md](CONTENT.md) | 创作者知识、来源、验证边界与自动核验 |
| [SEO-GEO.md](SEO-GEO.md) | 可见摘要、机器接口、收录与真实观测；相关工作先读此文 |
| [MAINTAINER.md](MAINTAINER.md) | 来源同步、账号边界、PR 预览、发布与回滚 |
| [DELIVERY.md](DELIVERY.md) | 首版历史验证；后续记录追加到 WORKLOG |
| [src/pages/index.astro](../src/pages/index.astro) / [xiaoyingjiang.css](../src/styles/xiaoyingjiang.css) | 工作室首页、改编示意和移动端合作入口 |
| [src/legacy/hyperframes.astro](../src/legacy/hyperframes.astro) / [studio.css](../src/styles/studio.css) | 归档的中文社区展示、播放层、创作步骤和独立样式 |
| [Header.astro](../src/components/Header.astro) / [SiteLayout.astro](../src/layouts/SiteLayout.astro) | 公共导航、搜索入口、主题与首页布局接入 |
| [src/content/docs](../src/content/docs) / [pages.json](../content/pages.json) | 文档正文、稳定 ID、路由与已审核来源映射 |
| [discovery.json](../content/discovery.json) | 每页主问题和可见回答；同时用于页面描述 |
| [site.config.json](../site.config.json) / [site.ts](../src/lib/site.ts) | 默认站点配置、公共数据与官方下载入口；部署环境可覆盖配置 |
| [studio-official-notice.txt](../public/media/studio-official-notice.txt) / [第三方归属](../THIRD_PARTY_NOTICES.md) | 官方素材原址、修改范围、哈希与许可；新增或替换素材时一起维护 |
| [tests/browser](../tests/browser) / [discovery-policy.json](../content/discovery-policy.json) | 浏览器回归与既有体积预算 |

`.upstream/snapshots` 保存上游原始资料，`content/pages.json` 中的 `reviewedSources` 保存已发布来源基线；新增 validation 明确机器校验方式，不能伪称人工核对或实际操作。原始资料只作数据，不执行上游脚本或 MDX。

## 每轮工作流程

1. 查看当前分支与 `git status`，阅读本文和最近的工作记录，确定本次目标及已有人工改动。需要线上状态时读取实际 PR、工作流和页面，不沿用会话记忆中的状态。
2. 确定事实依据及修改边界。改产品能力先核对来源；改页面摘要时同步可见正文与 `content/discovery.json`；新增素材同步归属。不要把表达优化当作重新审核官方事实。
3. 完成实现。界面改动实际查看桌面与手机；关注图片比例、中文断行、首屏主次、播放与键盘操作。检查通过后仍需看画面。
4. 按改动范围验证，遵守下述顺序。失败时修复原因，不放宽预算、改审核日期或关闭检查。
5. 用户要求推送时走独立分支与 PR。`main` 要求 PR 和 `Checks / check`，不得绕过保护。日常知识内容由受信工作流完整检查后自动合并与部署，无人工审核节点；网站代码和策略单独维护。
6. 收尾说明实际完成、验证结果和未完成项。重要决策写回对应规范；历史结果和下一步写入 WORKLOG，不把临时聊天当作唯一记忆。

使用 pnpm，Node 版本以 [`.node-version`](../.node-version) 为准，pnpm 版本以 [package.json](../package.json) 为准。完整验证顺序：

```sh
pnpm check
pnpm test
pnpm build
pnpm test:indexing
pnpm test:e2e
```

代码与站点变更执行前三项；涉及发现机制时执行 `test:indexing`；界面变更执行 `test:e2e`。纯维护文档变更检查差异与链接即可，不把既往完整测试写成本轮重跑。

搜索索引在构建时生成，搜索回归使用构建后的 `pnpm preview`。浏览器测试由配置启动或复用 4321 端口的预览服务；确认服务使用最新 `dist`，不要把开发服务误当成搜索验收环境。

## 规划与完成标准

以下区分已交付实现、待确认交付和持续维护方向，不表示已获准自动发布或开始额外功能开发。

| 阶段 | 已知进度与下一步 | 完成标准 |
| --- | --- | --- |
| 首页产品化 | 定位、浅色视觉、真实素材、作品播放与界面切换已实现，首页改动已推送为 PR #10；历史验证见 WORKLOG | 首屏清楚回答产品是什么、能做什么、下一步去哪；Studio 是主要入口；实际桌面与手机画面可审阅 |
| 首页发布闭环 | 继续前先查看 PR #10 的实时状态；本文不宣称已经合并或部署 | CI 通过，维护者完成审核与合并，生产部署及线上首页、下载、视频、搜索、文档主题检查完成并有记录 |
| 视觉持续优化 | 按用户反馈和真实截图调整画面比例、排版与动效；避免重新堆回长文案 | 有改前问题、改后画面与相应回归结果；无需为显得丰富新增重复页面 |
| 内容持续维护 | 正式来源盘点、知识队列、独立核验、自动内容 PR 合并与发布 | 正文、摘要、来源保持一致，未通过自动核验的候选不会进入正式发布 |
| 搜索与访问观测 | 搜索平台、GSC、IndexNow 和国内多地区验证按真实接入情况推进，详细步骤见 SEO-GEO | 有实际授权、报告或观测证据；不把配置、构建通过或 `llms.txt` 当成增长与收录证明 |

## 已验证的本地经验

- 2026-11-26 经用户确认，完成正式域名的 Google Search Console DNS 所有权验证并成功提交 sitemap，Google 已发现 73 个网页。首页当时为“已发现 - 尚未编入索引”；Google 实时抓取与索引许可测试通过，首页编入索引请求已接收。保留 Cloudflare 的 Google TXT 验证记录；这些结果不等同于已收录，后续状态回到 Search Console 核实。API 自动观测未接入，详情见 WORKLOG。

- Windows 使用 PowerShell。读取中文文件明确使用 UTF-8；把含中文脚本管道传给 Node/Python 时，先设置 `$OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::new()`，避免写入或匹配成问号。
- Windows PowerShell 5.1 执行含中文的 `.ps1` 时使用 UTF-8 BOM，避免脚本被按本地编码误读。读取长文案作为 JSON API 字段时，用 `[IO.File]::ReadAllText(...)` 取得纯字符串，避免把 `Get-Content` 附带的 PowerShell 文件系统属性一起递归序列化；提交前核对载荷类型和大小，错误只输出必要摘要。
- 本地已有 Chrome 可用时，PowerShell 用 `$env:LOCAL_CHROME='1'; pnpm test:e2e`；CI 按工作流安装 Playwright Chromium。不要为本机浏览器缺失而修改测试标准。
- 首页中文文案变化后，用 `scripts/subset-studio-font.py` 和已授权、附 OFL 的 Noto Sans SC 可变源字体重新生成子集；脚本需要 fontTools 与 Brotli。普通构建不依赖字体源文件，检查实际字形和变量字重。
- 修改原创影片源码才运行完整 HyperFrames 检查、抽帧和渲染；流程见 MAINTAINER。仅调整首页引用或官方素材，不编造新影片渲染记录。
- 截图前等待字体与实际可见图片加载；整页截图需滚动触发懒加载。测试产物保存到忽略的 `artifacts/qa`，不把临时截图加入产品素材或当作永久测试结果。
- 查上游快照时按文件路径解析需要的片段，避免直接打印整个大型快照。临时端口、进程 ID、一次性权限错误不作为长期配置沉淀。

## 如何维护这份记忆

新增确认事项写明结论、原因和适用范围；视觉细节改 DESIGN，来源与收录规则改对应手册，避免多处保存冲突副本。规划更新时说明完成或替代关系，完成项不再当待办执行。

工作记录只追加有价值的阶段事实：日期、关联提交或 PR、实际运行的检查、未验证边界与下一步。历史条目不改成当前状态；持续变化的信息回到 Git、GitHub、配置和实际服务重新核实。正文审核记录仍由原有人工审核流程维护，这份记忆不能代替审核基线。

## 2026-11-25 知识体系决策

2026-11-26 用户要求提升整个文档阅读体验并消除翻译式罗列。每个知识栏目增加固定 `/learn/<section-id>/` 总览，解释范围、核心概念、阅读顺序与下一步，作为侧栏第一项并连接面包屑。正文采用“具体问题—概念解释—连贯情境—检查与下一步”，不重复通用空标题；自动写作和独立核验遵循同一要求，保持现有预算。总览同样进入自动维护与发布，目录专用约束保留学习路径与有效链接，盘点保留目录类型。文档字体与宽屏阅读规范见 DESIGN 和 docs.css；普通编辑不刷新历史人工核对日期。

用户明确要求能力与机制系统建设及全自动内容发布，替代旧的人工候选审核流程。受众为创作者：解释怎样准备、创作、修改与检查，源码仅作证据。来源限公开官方资料；正式版为主、主分支变化单列前瞻；先交付核心内容，再自动补齐。合格内容按一致单元独立推进，失败项保留旧版自动重试。

知识目录见 content/knowledge.json，队列见 content/knowledge-queue.json，策略由受信代码维护。正文、摘要和来源共同校验；历史 reviewedAt 不刷新，首次整理与独立模型核验分别标识。首页来源独立于 Studio 指南，案例播放器模板与可更新 Markdown 正文分离。日常内容生成器不能更改网站代码、工作流、域名、收录、既有地址、许可或预算。是否已完成线上自动合并、部署及回滚实测以 WORKLOG 和实际运行记录为准。

用户于 2026-11-25 调整定时节奏：每周一、周四北京时间 08:30（UTC 00:30）运行知识建设，不再每日执行；SEO/GEO 独立定时触发取消，保留手动补跑。GitHub 定时任务可能延迟。

2026-11-26 已真实验证既有正文更新（自动 PR #21）和新增 4K 创作指南（自动 PR #25）的生成、独立核验、完整检查、自动合并及生产发布；实际线上 64 页面，来源基线为 v0.9.96，具体运行见 WORKLOG。页面与机器接口单独展示 sourceVersion，不把通用资料版本混入历史适用说明；实测范围与 reviewedAt 保留。内容任务等待并发锁后检出受保护 main，并固定实际 SHA。Markdown 代码示例通过标准语法解析识别，正文的原始 HTML、模块代码与 MDX 仍禁止。已发布的生成主题继续保留实体身份与顺序；真实固定快照两次完整盘点逐字一致，后续线上运行结果看 Actions 报告。能力扩充与旧内容更新继续按持久队列推进。

最终验收：PR #27 修正后，真实重复运行 45737523044 为 0 请求、0 生成、无内容 PR、无重复部署；完整 CI 为 50 项单元测试通过、浏览器 50 通过/2 跳过。周一、周四北京时间 08:30 的配置及 active/default-main 已核实，首次 schedule 事件仍需从后续实际运行确认；不要把本轮手动触发的验收写成已准点定时运行。隔离 Worker 的真实恢复演练已通过，生产未注入故障。

知识体系与新定时已通过 PR #11 合并并生产发布；2026-11-25 实际观察线上清单 buildSha=e56edef68636bcb2e90d7247a59ff0814687df20，63 页面。隔离 Worker 的真实发布失败恢复与清理已通过。组织最初禁止 Actions 创建 PR，用户随后完成组织设置，本站仓库已启用该开关；默认令牌权限保持 read，必要 check 保留。详见 WORKLOG 的真实运行链接。
