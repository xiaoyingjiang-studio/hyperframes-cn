import { appendFile } from "node:fs/promises";
import { json } from "./lib/io.mjs";
const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
if (!repo || !token) throw new Error("缺少 GitHub 工作流环境");
async function api(path, method = "GET", body) {
  const response = await fetch(`https://api.github.com/repos/${repo}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) throw new Error(`GitHub API ${response.status}`);
  return response.status === 204 ? null : response.json();
}
const action = process.argv[2];
if (action === "begin") {
  const open = await api("pulls?state=open&per_page=100");
  const busy = open.some((p) => p.head.ref.startsWith("automation/"));
  if (process.env.GITHUB_OUTPUT)
    await appendFile(process.env.GITHUB_OUTPUT, `busy=${busy}\n`);
  console.log(busy ? "已有自动化审核批次，保留现有候选。" : "可生成优化建议。");
} else if (action === "pr") {
  const report = await json("artifacts/optimization-report.json");
  if (!report.generated.length) throw new Error("没有候选，不创建空 PR");
  const open = await api("pulls?state=open&per_page=100");
  if (open.some((p) => p.head.ref.startsWith("automation/")))
    throw new Error("已有审核批次，停止创建");
  const branch = await api("git/ref/heads/automation/discovery");
  const body = `依据 ${report.measurementCount} 条有证据的观测，生成 ${report.generated.length} 篇候选。正式正文未更改。\n\n${report.generated.map((p) => `### ${p.id}\n${p.summary}\n\n${p.checks.map((c) => "- " + c).join("\n")}`).join("\n\n")}\n\n维护者检查候选 JSON 中的正文、来源和观测，然后在本 PR 分支运行 pnpm optimize:apply <contentId> --reviewed。提交正文后重新通过必需检查，再手动合并。不得直接合并未应用的候选来声称已优化。\n\n优先级不是排名分数；对照后续同口径观测评价结果。完整报告见当前运行 artifact。`;
  const pr = await api("pulls", "POST", {
    title: "docs: 审核 SEO 与 AI 搜索内容优化候选",
    head: "automation/discovery",
    base: "main",
    draft: true,
    body,
  });
  await api(`statuses/${branch.object.sha}`, "POST", {
    state: "success",
    context: "check",
    description: "同一工作流已完成内容、单元、构建审计和浏览器检查",
    target_url: `https://github.com/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}`,
  });
  console.log(pr.html_url);
} else throw new Error("未知操作");
