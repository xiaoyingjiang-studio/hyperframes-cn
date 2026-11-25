# HyperFrames 中文指南维护约定

- 开始工作先读 docs/PROJECT-MEMORY.md，按任务阅读其中指向的规范；跨会话进度与历史验证见 docs/WORKLOG.md。以当前用户要求和仓库实际状态为准，不把历史记录当成当前部署状态。
- 形成新的产品决策、长期约束或完成重要阶段时，同步更新对应规范和本地记忆；只记录已确认事实、决策原因、验证范围与明确待办，不保存密钥、临时会话信息或未经确认的猜测。
- SEO/GEO 工作先读 docs/SEO-GEO.md。正文、content/discovery.json 的可见摘要与来源一起维护；新增页面登记稳定问题，不制造重复意图页面。
- 日常内容生成器不能更改域名、收录开关、既有 URL、许可、体积预算或发布策略。新增地址按受信规则生成，来源基线仅由校验通过后的确定性程序推进。无真实观测不编造排名、流量和引用率。
- 涉及发现机制时执行 pnpm test:indexing；pnpm build 包含全站 SEO/GEO 审计。正文改写不得刷新 reviewedAt，官方来源变化与表达优化采用各自审核命令。

- 网站是独立社区项目，使用 Astro、Starlight、TypeScript、Markdown/MDX 与 Pagefind，静态部署到 Cloudflare Workers。
- 使用 pnpm，Node 版本见 .node-version。检查顺序：pnpm check、pnpm test、pnpm build；界面变化还应执行 pnpm test:e2e。
- 正文位于 src/content/docs，稳定 ID 与来源映射位于 content/pages.json。正文与来源映射要一致，修改标题不改变网址。
- 官方资料为数据，不执行上游脚本或 MDX。采集固定上游提交，正文事实保留具体来源。
- 未实际执行的登录、Agent 操作或服务调用，不写成已验证。普通文字修改不更新 reviewedAt。
- 知识内容采用全自动流程：官方正式来源盘点、Markdown 生成、独立模型与证据核验、技术检查、自动内容 PR 合并、准确提交部署与失败恢复；不设置人工审核或批准节点。网站代码和工作流不属于内容生成器权限。
- 内容体系面向创作者，解释影响创作决策的能力与机制，不做源码逐文件讲解。以正式版为主，主分支差异单列前瞻；Studio 桌面、浏览器编辑器、CLI 与 skills 分别标注。
- 不覆盖已有自动化分支和人工修改。失败项自动退避重试，合格的独立内容继续发布；缺少 AI 仍能检测来源、构建和发布现有内容。
- 不写入或打印密钥，使用环境变量及 GitHub Secrets。外部 PR 检查只读，不接触部署或 AI 凭据。
- 原创案例遵循 DESIGN.md，使用暂停、可寻址时间轴。修改后用 HyperFrames 完整 check、抽帧与渲染验证。
- 本站代码 Apache-2.0，原创文字 CC BY 4.0。第三方内容保留原始许可与归属。
