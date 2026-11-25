import { readFile, stat } from "node:fs/promises";
import matter from "gray-matter";
import { file, json, save, hash } from "./lib/io.mjs";
import { validateObservations, prioritize } from "./lib/optimization.mjs";
import { generateDraft, configured, Budget, checkCommands } from "./lib/ai.mjs";

const pages = await json("content/pages.json");
const intents = await json("content/discovery.json");
const status = await json("content/sync-status.json");
const observations = validateObservations(
  await json("content/optimization/observations.json"),
  new Set(["home", ...pages.map((p) => p.id)]),
);
if (process.env.OPTIMIZATION_OBSERVATIONS) {
  const extra = validateObservations(
    await json(process.env.OPTIMIZATION_OBSERVATIONS, {
      schemaVersion: 1,
      observations: [],
    }),
    new Set(["home", ...pages.map((p) => p.id)]),
  );
  observations.observations.push(...extra.observations);
}
const audit = await json("artifacts/discovery-audit.json");
if (audit.errors) throw new Error("先修复基础审计错误，再改写内容");
const queue = prioritize(
  pages,
  observations.observations,
  status.pendingPageIds,
);
const report = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  aiConfigured: configured(),
  measurementCount: observations.observations.length,
  queue,
  generated: [],
  skipped: [],
  notice: "缺少真实观测时只审计，不编造流量、排名、引用率，也不为凑批次改写。",
};
const limit = Math.min(
  3,
  Math.max(0, Number(process.env.OPTIMIZE_MAX_PAGES || 3)),
);
const budget = new Budget();
const glossary = await readFile(file("content/glossary.md"), "utf8");
for (const target of queue.slice(0, limit)) {
  const page = pages.find((p) => p.id === target.pageId);
  const reviewed = await json(
    `content/optimization/reviews/${page.id}.json`,
    null,
  );
  if (
    reviewed &&
    hash(JSON.stringify(reviewed.signals)) ===
      hash(JSON.stringify(target.reasons))
  ) {
    report.skipped.push({
      id: page.id,
      reason: "同一组观测已用于上一轮编辑，等待新观测，不反复改写",
    });
    continue;
  }
  if (page.file.endsWith(".mdx")) {
    report.skipped.push({
      id: page.id,
      reason: "受控组件页面仅列建议，交给人工修订",
    });
    continue;
  }
  try {
    await stat(file(`content/optimization/candidates/${page.id}.json`));
    report.skipped.push({ id: page.id, reason: "候选已存在，拒绝覆盖" });
    continue;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const raw = await readFile(file(page.file), "utf8");
  const parsed = matter(raw);
  const snapshots = await Promise.all(
    page.sources.map((id) =>
      json(`.upstream/snapshots/${id}/${page.reviewedSources[id].hash}.json`),
    ),
  );
  try {
    const draft = await generateDraft(
      {
        purpose:
          "改善回答清晰度、信息组织和站内学习路径。观测仅用于选择问题，不能证明因果。不得堆砌关键词、编造引文或效果，不改变产品事实、原有已验证代码、适用条件和许可。",
        pageType: parsed.data.kind,
        intent: intents.pages.find((p) => p.id === page.id),
        currentAnswer: intents.pages.find((p) => p.id === page.id).answer,
        additionalOutput:
          "同时返回 answer：45–180 个字符的单行纯文本简明回答，与候选正文一致，不增加未经来源支持的事实。",
        signals: target.reasons,
        current: parsed.content,
        oldSources: snapshots,
        newSources: snapshots,
        glossary,
      },
      { budget },
    );
    if (draft.skipped) {
      report.skipped.push({ id: page.id, reason: draft.reason });
      continue;
    }
    if (
      checkCommands(
        draft.body,
        parsed.content,
        snapshots.flatMap((s) => s.files.map((f) => f.text)).join("\n"),
      ).length
    )
      throw new Error("候选含未经来源确认的命令");
    const candidate = {
      schemaVersion: 1,
      pageId: page.id,
      beforeHash: hash(raw),
      intentHash: hash(
        JSON.stringify(intents.pages.find((p) => p.id === page.id)),
      ),
      reviewedSourcesHash: hash(JSON.stringify(page.reviewedSources)),
      body: draft.body,
      answer: draft.answer,
      summary: draft.summary,
      checks: [
        "逐项核对事实与来源；人工运行涉及的操作；确认摘要与正文一致；不得把流量变化当作已证实的优化效果",
        ...draft.checks,
      ],
      signals: target.reasons,
      usage: draft.usage,
    };
    await save(`content/optimization/candidates/${page.id}.json`, candidate);
    report.generated.push({
      id: page.id,
      summary: draft.summary,
      checks: candidate.checks,
    });
  } catch (error) {
    report.skipped.push({ id: page.id, reason: error.message });
    if (error.fatal) break;
  }
}
report.calls = budget.calls;
report.reservedTokens = budget.tokens;
await save("artifacts/optimization-report.json", report);
console.log(
  `优化检查：${report.measurementCount} 条观测，${queue.length} 项待排查，${report.generated.length} 篇候选；正式正文未改动。`,
);
