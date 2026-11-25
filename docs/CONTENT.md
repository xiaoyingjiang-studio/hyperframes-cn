# 创作者知识内容与自动核验

## 当前职责与发布方式

本节替代旧的人工候选审核流程。内容面向创作者，按认识与选择、Studio 创作、能力地图、创作机制、Skills 与创作工具、创作方法、问题与限制、更新与前瞻组织。源码仅用于核实创作行为，不建设源码逐文件解析。

日常内容通过 `pnpm knowledge:sync --apply` 自动生成、独立核验和应用，再由受信工作流完成检查、自动内容 PR 合并及部署。失败项保留旧文并退避重试，没有人工审核队列。网站代码、工作流、许可与发布策略单独维护。

`content/knowledge.json` 记录知识实体、适用入口、栏目、来源与关联；`content/knowledge-queue.json` 保存持续建设任务。正式 skills 按发布清单发现，开发仓库自身使用的技能与组件附带说明分开处理。新增页面使用受信代码中的地址规则，不更改既有 URL。

机器独立核验与实测分开。新内容的 `sourceVersion`、`sourceVerifiedAt`、`validation` 记录来源与内容校验；`reviewedAt` 只保留历史人工事实，不由自动更新刷新。首批来源整理使用 `agent-source-analysis`，不能伪称运行过独立供应商请求；后续生成要求 `independent-model-and-evidence`。两者在页面分别显示。

## 页面类型

教程说明受众、结果、依赖、步骤、验证与下一步；能力页说明用途、入口、示例、条件与案例；案例提供成片、输入、源码、提示词和实际执行记录；更新说明影响范围、适用入口、迁移与来源。

使用简体中文，短句、具体动作和明确证据。命令、参数、文件名和产品名保留原文；术语遵循 content/glossary.md。禁止编造价格、账号权益、功能可用性、实际测试和用户评价。

## 元信息

每个内容 ID 还需在 `content/discovery.json` 登记主问题、45–180 字的简明回答和检索用语。回答是读者可见正文，也用于 SEO 描述；上游变化必须同时核对摘要和全文。规则及优化流程见 [SEO/GEO 手册](SEO-GEO.md)。

每篇内容包含 title、description、contentId、kind、sources、appliesTo、status；历史 reviewedAt 保留，新增内容不伪造人工日期。原创实践与未执行的账号步骤填写 verification。contentId 与 content/pages.json 一致，sources 使用 content/sources.json 中的稳定 ID。

kind 支持 adaptation、original、tutorial、case、update、index、capability、mechanism、skill、workflow、catalog。status 的 reviewed/practice 是历史记录，source-based 是明确标注的来源整理，auto-checked 表示通过独立模型与证据校验；needs-review 仅兼容旧候选，不能发布。

## 来源与版本

每次采集固定上游提交并归档正文和必要共享片段。content/pages.json 中的 reviewedSources 才是页面已审核基线；.upstream/observed.json 代表最近观察，不自动构成审核完成。网页来源链接使用审核提交，而不是漂移的 main。

普通文字或样式修改不得刷新 reviewedAt。涉及新的官方事实时，应检查新快照、修改正文、执行必要验证，再由确定性程序登记通过后的来源基线。官方 main 与正式版本可能不同，命令以安装版本帮助为准。

## AI 自动核验

AI 输入包括固定来源、中文稿、创作问题、适用入口和术语表。输出只接受 Markdown，禁止模块、HTML 与可执行组件。MDX 案例使用固定播放器模板和 `content/case-prose` 中的 Markdown 正文；模型只更新正文。新命令必须来自来源或保留原有已验证命令。

长来源按完整差异及明确标注的参考节选组织模型上下文，不重复传送整篇长文。来源按完整段落与代码块选择节选，明确标注 partial 和省略范围，不从省略内容推断事实。超限单段隔离并自动重试。原始来源始终完整归档，已有相同哈希的快照不改写采集日期或提交。自动 PR 的检查在同一工作流执行并登记状态，避免依赖机器人事件触发后续检查。

写作和核验采用独立请求，摘要和每个二级章节都要映射到固定来源的真实引文；代码逐字检查来源，正文、摘要和基线共同计算校验摘要。允许一次修订复检，仍失败则自动延期。独立模型判断并不保证绝对事实正确，因此保留来源与验证边界。旧 `review-content.mjs` 仅用于历史维护，不进入日常流水线。

## 素材与案例

所有案例提供实际输出与复现步骤。示例数据标注为演示，概念界面明确说明，不冒充真实截图。外部素材记录作者、出处和许可。系统字体不直接打包分发；本项目案例使用附 OFL 的 Noto Sans SC 字形子集，改文案增加新字时需要重新准备字体。
