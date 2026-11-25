# 项目记忆与工作入口

本文件保存跨会话需要延续的产品决策、工作方式和规划。开始工作先读 [AGENTS.md](../AGENTS.md) 与本文，再按任务阅读具体规范；阶段交接见 [WORKLOG.md](WORKLOG.md)。代码、配置和实际检查结果用于核实当前状态，历史记录不能代替核实。用户后续明确调整方向时，更新相关决策及原因，不反复执行已经完成或被替代的计划。

## 产品定位与已确认决策

网站是 HyperFrames 的独立中文社区项目，HyperFrames 由 HeyGen 开发。首页定位为 **HyperFrames Studio 的中文产品展示与创作入口**，中文指南承接安装、上手与进阶实践。

维护方为**小影匠工作室**，GitHub 组织为 [`xiaoyingjiang-studio`](https://github.com/xiaoyingjiang-studio)。本站工程位于 [`hyperframes-cn`](https://github.com/xiaoyingjiang-studio/hyperframes-cn)，案例与资源精选独立维护在 [`awesome-hyperframes`](https://github.com/xiaoyingjiang-studio/awesome-hyperframes)；后者是资源目录，不重复承载中文指南或网站部署。`awesome` 是正确拼写，仓库名采用常见的 `awesome-主题` 顺序。

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
| [CONTENT.md](CONTENT.md) | 中文内容、来源、验证边界与人工审核 |
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

`.upstream/snapshots` 保存上游原始资料，`content/pages.json` 中的 `reviewedSources` 才代表页面审核基线。原始资料只作数据，不执行上游脚本或 MDX。

## 每轮工作流程

1. 查看当前分支与 `git status`，阅读本文和最近的工作记录，确定本次目标及已有人工改动。需要线上状态时读取实际 PR、工作流和页面，不沿用会话记忆中的状态。
2. 确定事实依据及修改边界。改产品能力先核对来源；改页面摘要时同步可见正文与 `content/discovery.json`；新增素材同步归属。不要把表达优化当作重新审核官方事实。
3. 完成实现。界面改动实际查看桌面与手机；关注图片比例、中文断行、首屏主次、播放与键盘操作。检查通过后仍需看画面。
4. 按改动范围验证，遵守下述顺序。失败时修复原因，不放宽预算、改审核日期或关闭检查。
5. 用户要求推送时走独立分支与 PR。`main` 要求 PR 和 `Checks / check`，不得直接绕过保护或自动合并；维护者审核并手动合并后，观察生产部署和线上冒烟结果。
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
| 内容持续维护 | 沿用已有来源检测、候选与人工审核流程 | 正文、摘要、来源保持一致，未审核候选不会进入正式发布 |
| 搜索与访问观测 | 搜索平台、GSC、IndexNow 和国内多地区验证按真实接入情况推进，详细步骤见 SEO-GEO | 有实际授权、报告或观测证据；不把配置、构建通过或 `llms.txt` 当成增长与收录证明 |

## 已验证的本地经验

- Windows 使用 PowerShell。读取中文文件明确使用 UTF-8；把含中文脚本管道传给 Node/Python 时，先设置 `$OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::new()`，避免写入或匹配成问号。
- 本地已有 Chrome 可用时，PowerShell 用 `$env:LOCAL_CHROME='1'; pnpm test:e2e`；CI 按工作流安装 Playwright Chromium。不要为本机浏览器缺失而修改测试标准。
- 首页中文文案变化后，用 `scripts/subset-studio-font.py` 和已授权、附 OFL 的 Noto Sans SC 可变源字体重新生成子集；脚本需要 fontTools 与 Brotli。普通构建不依赖字体源文件，检查实际字形和变量字重。
- 修改原创影片源码才运行完整 HyperFrames 检查、抽帧和渲染；流程见 MAINTAINER。仅调整首页引用或官方素材，不编造新影片渲染记录。
- 截图前等待字体与实际可见图片加载；整页截图需滚动触发懒加载。测试产物保存到忽略的 `artifacts/qa`，不把临时截图加入产品素材或当作永久测试结果。
- 查上游快照时按文件路径解析需要的片段，避免直接打印整个大型快照。临时端口、进程 ID、一次性权限错误不作为长期配置沉淀。

## 如何维护这份记忆

新增确认事项写明结论、原因和适用范围；视觉细节改 DESIGN，来源与收录规则改对应手册，避免多处保存冲突副本。规划更新时说明完成或替代关系，完成项不再当待办执行。

工作记录只追加有价值的阶段事实：日期、关联提交或 PR、实际运行的检查、未验证边界与下一步。历史条目不改成当前状态；持续变化的信息回到 Git、GitHub、配置和实际服务重新核实。正文审核记录仍由原有人工审核流程维护，这份记忆不能代替审核基线。
