# 内容写作与审核

## 页面类型

教程说明受众、结果、依赖、步骤、验证与下一步；能力页说明用途、入口、示例、条件与案例；案例提供成片、输入、源码、提示词和实际执行记录；更新说明影响范围、适用入口、迁移与来源。

使用简体中文，短句、具体动作和明确证据。命令、参数、文件名和产品名保留原文；术语遵循 content/glossary.md。禁止编造价格、账号权益、功能可用性、实际测试和用户评价。

## 元信息

每个内容 ID 还需在 `content/discovery.json` 登记主问题、45–180 字的简明回答和检索用语。回答是读者可见正文，也用于 SEO 描述；上游变化必须同时核对摘要和全文。规则及优化流程见 [SEO/GEO 手册](SEO-GEO.md)。

每篇内容必须包含 title、description、contentId、kind、sources、reviewedAt、appliesTo、status。原创实践与未执行的账号步骤填写 verification。contentId 与 content/pages.json 一致，sources 使用 content/sources.json 中的稳定 ID。

kind 为 adaptation、original、tutorial、case、update、index。status 为 reviewed、practice、needs-review。needs-review 允许生成预览，但禁止进入正式部署。

## 来源与版本

每次采集固定上游提交并归档正文和必要共享片段。content/pages.json 中的 reviewedSources 才是页面已审核基线；.upstream/observed.json 代表最近观察，不自动构成审核完成。网页来源链接使用审核提交，而不是漂移的 main。

普通文字或样式修改不得刷新 reviewedAt。涉及新的官方事实时，应检查新快照、修改正文、执行必要验证，再运行人工核对命令。官方 main 与正式版本可能不同，命令以安装版本帮助为准。

## AI 候选审核

AI 输入包括旧来源、新来源、中文稿和术语表。候选输出只接受 Markdown，禁止模块、HTML 与可执行组件；含受控播放器的 MDX 页面留给维护者修改。新命令必须来自新来源或保留原有已验证命令。

人工检查后运行 `node scripts/review-content.mjs <contentId>`。这会更新该页面的审核日期和来源基线，清除对应待核对标记；维护者提交变更后才合并。不得将运行这个命令当成实际核实的替代品。

## 素材与案例

所有案例提供实际输出与复现步骤。示例数据标注为演示，概念界面明确说明，不冒充真实截图。外部素材记录作者、出处和许可。系统字体不直接打包分发；本项目案例使用附 OFL 的 Noto Sans SC 字形子集，改文案增加新字时需要重新准备字体。
