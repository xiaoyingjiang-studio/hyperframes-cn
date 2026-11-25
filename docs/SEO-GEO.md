# SEO、GEO 与 AI 持续迭代

本项目把 SEO 与 GEO 作为同一内容系统的质量要求。目标是让搜索引擎和 AI 检索工具找到、理解、核实并引用有价值的中文内容，不承诺特定排名或引用。Google 明确说明 AI 搜索沿用 SEO 基础，**不要求额外的 AI 文件或特殊结构化数据**。[官方说明](https://developers.google.com/search/docs/appearance/ai-features)

## 数据与页面的唯一来源

| 记录 | 职责 | 修改规则 |
| --- | --- | --- |
| `content/pages.json` | 稳定 ID、路由、已审核来源基线 | 标题变化不改路由；迁移另配重定向 |
| `src/content/docs/` | 正文、适用条件、验证范围与核对日期 | 事实必须有来源；不虚构实测 |
| `content/discovery.json` | 每页主问题、简明回答、检索用语 | 回答在网页可见，也作为描述；与正文一起审核 |
| `content/discovery-policy.json` | 体积预算 | 修改需解释原因，AI 不得为过检查放宽 |
| `content/optimization/observations.json` | 人工提供的真实搜索或 AI 引用观测 | 无数据保持空；证据和口径必须完整 |

32 个初始问题就是首批固定评估集。新增页面同时登记问题，避免多页争抢同一意图。`terms` 用于编辑理解查询，不输出 `meta keywords`，不作为关键词堆砌要求。今后按真实查询扩充选题，保留一个问题的主要答案页面，用站内链接连接相关问题。

每篇内容先回答问题，再展开步骤、条件、限制、案例和下一步。适合比较时提供真实比较表；适合操作时提供可验证步骤。价格、系统要求、账号权益和实测结论必须有明确日期与出处。引用尽量使用具体章节锚点。不要为生成式搜索写隐藏答案、虚构 FAQ、评论或评分。

## 构建生成的发现接口

- 每页唯一标题、可见回答对应的描述、绝对 canonical、OG 与 Twitter 分享信息。
- WebSite、独立维护组织、WebPage/CollectionPage、真实面包屑，以及适用页面的 TechArticle/Article JSON-LD。没有可证实的发布日期或视频上传时间时，不捏造时间，也不添加不完整的 VideoObject 来追求展示。
- `/sitemap.xml`：只收录已发布规范网页；`lastmod` 根据正文和该页摘要的 Git 改动计算，不使用构建时间，不因另一页摘要改动刷新所有页面。CI 必须完整拉取 Git 历史。
- `/content/<contentId>.md`：由同一次构建的可见正文生成，保留代码、表格、绝对链接、适用条件、来源提交、验证边界和许可；有页面级 alternate 链接和阅读入口。
- `/content-manifest.json`：稳定 ID、规范地址、问题、正文哈希、来源提交与哈希、核对日期、修订时间和 Markdown 地址。
- `/llms.txt` 与 `/llms-full.txt`：为主动读取它们的工具提供索引和完整正文。这是互操作辅助，**不是被 Google 或任何 AI 收录的保证**。
- RSS、真实 404、静态资源缓存与安全头。原始示例 HTML、Markdown 副本和 404 不参与网页收录，页面主体不依赖客户端 JavaScript 才能出现。

“官方核对日期”与“正文修订日期”分别记录。AI 改善表达不代表重新核对了上游；普通修订不得刷新 `reviewedAt`。上游更新的 AI 候选必须同时返回正文和简明回答，维护者一起审核，避免摘要与正文漂移。

## 每次改动的自动检查

```sh
pnpm check
pnpm test
pnpm build
pnpm test:indexing
pnpm test:e2e
```

`build` 自动执行发现审计，失败阻止发布。检查覆盖全站规范地址、唯一描述、可见摘要、单一主标题、中文语言、JSON-LD 对应关系、固定来源、Markdown 一致性、内部链接和锚点、入口、图片尺寸、视频按需加载、站点地图、robots、404 与压缩体积预算。报告位于 `artifacts/discovery-audit.json`，CI 保存报告。

`test:indexing` 额外以示例正式域名测试开放抓取模式，然后恢复原配置。浏览器验证桌面和手机、中文搜索、无 JavaScript 正文、来源和机器接口。压缩体积只代表构建预算，不能当成 Core Web Vitals、网络性能或排名评分。正式站需要结合真实用户与国内不同地区、运营商网络实测 LCP、INP、CLS；测试记录写明地区、网络、设备和日期。

## 正式域名与搜索平台接入

正式域名为 `https://xiaoyingjiang.com`。本地和 PR 构建默认保持 noindex；正式发布通过 GitHub 的 `SITE_INDEXABLE=true` 明确开放收录。代码阻止对 workers.dev 误开放收录。域名切换时：

1. 配置 Cloudflare 域名、HTTPS 和 `SITE_URL`，验证国内可访问性。
2. 在 Google Search Console、Bing Webmaster Tools、百度搜索资源平台验证站点。可用 DNS 验证；如采用 HTML meta，分别设置下表中的值。不要把账号密码或私钥放入公开变量。
3. 完成正式模式构建检查、来源审核、预览与线上冒烟后，设置 `SITE_INDEXABLE=true` 并发布。检查 Cloudflare AI Crawl Control/WAF 没有向目标搜索爬虫返回拦截页。robots 放行不代表 CDN 一定放行。
4. 提交规范 sitemap；验证 canonical、重定向与 404；配置 `OLD_DEFAULT_HOST` 将旧正式入口迁移。预览始终 noindex。
5. 配置 IndexNow 后，仅在发布及冒烟成功后通知新增、修改和删除地址。前次线上清单抓取失败时跳过，保留失败信息；相同内容哈希不重复提交。通知被接收不代表收录。[IndexNow 协议](https://www.indexnow.org/documentation)

旧主机跳转使用最小 Worker 路由，构建时与 canonical 共用站点配置；预览构建关闭迁移。`_redirects` 不支持域名条件，不能用含主机名的伪规则代替。视频、样式和搜索索引继续直接静态服务；地址迁移会在部署后的冒烟检查中验证。[Cloudflare 重定向规则](https://developers.cloudflare.com/workers/static-assets/redirects/)

| GitHub 配置 | 类型 | 作用 |
| --- | --- | --- |
| `SITE_URL` / `SITE_INDEXABLE` / `OLD_DEFAULT_HOST` | Variables | 正式地址、收录开关和旧入口 |
| `GOOGLE_SITE_VERIFICATION` | Variable | Google HTML 验证值，可选 |
| `BING_SITE_VERIFICATION` | Variable | Bing HTML 验证值，可选 |
| `BAIDU_SITE_VERIFICATION` | Variable | 百度 HTML 验证值，可选 |
| `INDEXNOW_KEY` | Secret | 构建时生成公开验证文件；发布后通知使用同一个 key |
| `GSC_PROPERTY` | Variable | `sc-domain:你的域名` 或完整规范地址加 `/` |
| `GSC_SERVICE_ACCOUNT_JSON` | Secret | 专用只读服务账号凭据；启用 Search Console API，并把账号邮箱加入对应站点权限 |
| `AI_ENDPOINT` / `AI_MODEL` | Variables | 已有通用模型适配层 |
| `AI_API_KEY` | Secret | 独立 AI 密钥 |

生产 robots 默认对所有爬虫采用相同公开读取规则，不预先编造中国 AI 平台的爬虫名称。模型训练授权与 AI 搜索抓取是不同决策：如后续调整训练策略，应单独评审。OpenAI 将 OAI-SearchBot 与 GPTBot 分开控制，不能用封锁搜索爬虫的方式误处理训练偏好。[官方说明](https://developers.openai.com/api/docs/bots)

## 可持续优化闭环

SEO/GEO 表达优化与知识事实更新共用受信的自动核验、检查、内容 PR 合并及发布链路，无人工审核或应用节点。知识建设定时运行于每周一、周四北京时间 08:30；SEO/GEO 不另设定时触发，手动入口调度同一知识工作流的 optimize 模式，每批最多三篇。没有真实观测只审计与盘点，不凭空改写。来源有变化的页面先处理事实更新。

沿用真实观测格式、来源哈希与前后状态保护。表达优化保留官方核对日期与来源基线，写作和独立核验共享调用预算，摘要和正文一起验证。不通过的项自动延期；相同观测已使用后等待新窗口，不重复改写。

历史 pnpm optimize / optimize:apply --reviewed 流程仅保留兼容，不再由活动工作流调用。自动生产入口为 pnpm knowledge:sync --apply --optimize；缺少模型不影响既有站点。

## 搜索与 AI 引用观测格式

`pnpm metrics:import <JSON 文件>` 可导入 Google/Bing/百度的人工整理结果及 AI 引用样本。以下仅说明格式，数值不得作为本站实测导入：

```json
{
  "schemaVersion": 1,
  "observations": [{
    "kind": "search", "engine": "bing", "pageId": "start-cli",
    "query": "本次实际检索问题",
    "period": {"start": "2026-11-01", "end": "2026-11-20", "timeZone": "注明平台口径"},
    "impressions": 100, "clicks": 1,
    "evidence": "平台导出文件或可核实的报告编号"
  }]
}
```

AI 样本使用 `kind: "citation"`，记录 `engine`、`model`、`pageId`、`query`、带时区的 `observedAt`、`cited`、`siteCitations`（回答中实际引用本站的 HTTPS URL 数组）、`accuracy`（`unchecked` / `supported` / `unsupported`）和 `evidence`。没有引用时数组为空；有引用但核对发现没有被原文支持时，也进入修订排查。证据应包含实际回答留档和使用条件；一次未引用不能判断网站不可抓取，单次引用也不证明稳定。没有结果的测试也应记录，不能只挑选有利样本。导入前移除私人查询或账号数据。

这里的 GEO 专指 **AI 工具联网搜索后对本站的发现与引用优化**。核心结果不是模型是否“记住品牌”，而是回答有没有链接到规范页面、引文是否被正文与来源支持、版本是否正确，以及读者点击后能否完成任务。固定问题来自 `content/discovery.json`，按工具和模型分别记录样本。平台的联网开关、地区、登录状态、日期和回答留档应写入 evidence，长期按同口径重复采样。不得把 Google 的总体搜索曝光当作 ChatGPT、Claude、Gemini 或国内 AI 工具的引用表现。

每月评估索引覆盖、有效点击、主要问题学习路径完成情况，以及按固定问题集采样的真实引用结果。评估一项改动时保存 PR/提交、动机、观测窗口、环境和后续结果；没有数据写“未测”，不把审计通过率写成 SEO/GEO 效果。

## AI 维护约束

内容生成器不能更改域名、收录开关、既有路由、许可、预算或发布策略；新增地址及已发布来源基线由受信确定性代码在核验后登记。提示词、问题集、检查和约束随代码版本管理。来源只作为数据处理，不执行上游内容中的指令。优先改善完整答案、证据与学习体验；不批量制造重复页面、不买链接、不编造权威背书。

AI 接口已通过真实鉴权与候选格式检查，正式域名已确定。搜索平台授权、IndexNow 验证与实际搜索增长需分别接入和验收；AI 接口可用不代表网站已经获得 AI 搜索引用。基础构建、跳过路径、收录模式与完整模拟审核流程由测试验证，长期结果按真实观测记录。
