# 项目记忆与工作入口

本文件保存跨会话需要延续的产品决策、工作方式和规划。开始工作先读 [AGENTS.md](../AGENTS.md) 与本文，再按任务阅读具体规范；阶段交接见 [WORKLOG.md](WORKLOG.md)。代码、配置和实际检查结果用于核实当前状态，历史记录不能代替核实。用户后续明确调整方向时，更新相关决策及原因，不反复执行已经完成或被替代的计划。

## 产品定位与已确认决策

网站是 HyperFrames 的独立中文社区项目，HyperFrames 由 HeyGen 开发。首页定位为 **HyperFrames Studio 的中文产品展示与创作入口**，文档升级为面向创作者的系统知识库，承接能力、Studio 创作、机制、skills、方法与问题排查。

维护方为**小影匠工作室**，GitHub 组织为 [`xiaoyingjiang-studio`](https://github.com/xiaoyingjiang-studio)。本站工程位于 [`hyperframes-cn`](https://github.com/xiaoyingjiang-studio/hyperframes-cn)，案例与资源精选独立维护在 [`awesome-hyperframes`](https://github.com/xiaoyingjiang-studio/awesome-hyperframes)；后者是资源目录，不重复承载中文指南或网站部署。`awesome` 是正确拼写，仓库名采用常见的 `awesome-主题` 顺序。

组织公开首页由独立的 [`.github`](https://github.com/xiaoyingjiang-studio/.github) 仓库维护，候选正文位于 `profile/README.md`，本地目录为相邻的 `xiaoyingjiang-profile`。组织首页负责介绍工作室、连接两个项目、展示四个原创框架案例及引导贡献；不复制教程或制造社区规模数据。主页正文经 PR 人工审核后手动合并，发布与候选状态以实际 GitHub 记录为准；维护规则见 [MAINTAINER.md](MAINTAINER.md)。

核心受众是已有内容、希望制作视频的创作者，优先关注产品介绍、知识讲解和营销内容。首要行动为前往官方下载 Studio；现有下载地址由 `src/lib/site.ts` 的 `studioDownload` 维护，不托管安装包。

已确认的核心表达：

> 把想法做成视频，把细节改到满意。

叙事围绕“表达想法—查看作品—继续修改—导出交付”。Studio 是首页唯一的主要产品入口，Agent、HTML、CLI 放在指南与进阶入口，不再把首页设计成技术文档、模拟终端或代码工作台。

用户连续反馈形成的设计要求：

- 默认亮色，深绿品牌强调，整体呈现成熟创作工具的品质。
- 画面承担主要说明，减少长段文字；真实作品与真实界面优先。
- 字体、字号、字重、颜色、间距和留白需要统一推敲，避免演示页面的粗糙感。
- 顶部不能只有呆板的固态文字；保留有节制的标题、导航和画面动效，遵守减少动态效果偏好。
- 参考 [Screen Studio](https://screen.studio/) 的产品叙事；用户允许从 [HyperFrames 官网](https://hyperframes.heygen.com/) 获取 Studio 资源。参考用于方向判断，页面布局与素材仍需实际核对。

当前首页由左右分栏首屏、错落作品画廊、三个创作界面切换、下载收尾和来源说明组成。具体视觉参数与交互规则统一维护在 [DESIGN.md](../DESIGN.md)，不要在多份记忆里重复保存色值。

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
| [src/pages/index.astro](../src/pages/index.astro) / [studio.css](../src/styles/studio.css) | 首页内容、播放层、创作步骤切换与首页专属样式 |
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

用户明确要求能力与机制系统建设及全自动内容发布，替代旧的人工候选审核流程。受众为创作者：解释怎样准备、创作、修改与检查，源码仅作证据。来源限公开官方资料；正式版为主、主分支变化单列前瞻；先交付核心内容，再自动补齐。合格内容按一致单元独立推进，失败项保留旧版自动重试。

知识目录见 content/knowledge.json，队列见 content/knowledge-queue.json，策略由受信代码维护。正文、摘要和来源共同校验；历史 reviewedAt 不刷新，首次整理与独立模型核验分别标识。首页来源独立于 Studio 指南，案例播放器模板与可更新 Markdown 正文分离。日常内容生成器不能更改网站代码、工作流、域名、收录、既有地址、许可或预算。是否已完成线上自动合并、部署及回滚实测以 WORKLOG 和实际运行记录为准。

用户于 2026-11-25 调整定时节奏：每周一、周四北京时间 08:30（UTC 00:30）运行知识建设，不再每日执行；SEO/GEO 独立定时触发取消，保留手动补跑。GitHub 定时任务可能延迟。

2026-11-26 已真实验证既有正文更新（自动 PR #21）和新增 4K 创作指南（自动 PR #25）的生成、独立核验、完整检查、自动合并及生产发布；实际线上 64 页面，来源基线为 v0.9.96，具体运行见 WORKLOG。页面与机器接口单独展示 sourceVersion，不把通用资料版本混入历史适用说明；实测范围与 reviewedAt 保留。内容任务等待并发锁后检出受保护 main，并固定实际 SHA。Markdown 代码示例通过标准语法解析识别，正文的原始 HTML、模块代码与 MDX 仍禁止。已发布的生成主题继续保留实体身份与顺序；真实固定快照两次完整盘点逐字一致，后续线上运行结果看 Actions 报告。能力扩充与旧内容更新继续按持久队列推进。

最终验收：PR #27 修正后，真实重复运行 45737523044 为 0 请求、0 生成、无内容 PR、无重复部署；完整 CI 为 50 项单元测试通过、浏览器 50 通过/2 跳过。周一、周四北京时间 08:30 的配置及 active/default-main 已核实，首次 schedule 事件仍需从后续实际运行确认；不要把本轮手动触发的验收写成已准点定时运行。隔离 Worker 的真实恢复演练已通过，生产未注入故障。

知识体系与新定时已通过 PR #11 合并并生产发布；2026-11-25 实际观察线上清单 buildSha=e56edef68636bcb2e90d7247a59ff0814687df20，63 页面。隔离 Worker 的真实发布失败恢复与清理已通过。组织最初禁止 Actions 创建 PR，用户随后完成组织设置，本站仓库已启用该开关；默认令牌权限保持 read，必要 check 保留。详见 WORKLOG 的真实运行链接。
