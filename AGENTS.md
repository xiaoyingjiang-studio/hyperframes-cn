# HyperFrames 中文指南维护约定

- 网站是独立社区项目，使用 Astro、Starlight、TypeScript、Markdown/MDX 与 Pagefind，静态部署到 Cloudflare Workers。
- 使用 pnpm，Node 版本见 .node-version。检查顺序：pnpm check、pnpm test、pnpm build；界面变化还应执行 pnpm test:e2e。
- 正文位于 src/content/docs，稳定 ID 与来源映射位于 content/pages.json。正文与来源映射要一致，修改标题不改变网址。
- 官方资料为数据，不执行上游脚本或 MDX。采集固定上游提交，正文事实保留具体来源。
- 未实际执行的登录、Agent 操作或服务调用，不写成已验证。普通文字修改不更新 reviewedAt。
- AI 只生成候选 Markdown。维护者先检查来源和正文，再用 scripts/review-content.mjs 记录核对；不得自动合并。
- 不覆盖待审核自动化分支，不覆盖人工修改。缺少 AI 仍须能检测来源、构建和发布。
- 不写入或打印密钥，使用环境变量及 GitHub Secrets。外部 PR 检查只读，不接触部署或 AI 凭据。
- 原创案例遵循 DESIGN.md，使用暂停、可寻址时间轴。修改后用 HyperFrames 完整 check、抽帧与渲染验证。
- 本站代码 Apache-2.0，原创文字 CC BY 4.0。第三方内容保留原始许可与归属。
