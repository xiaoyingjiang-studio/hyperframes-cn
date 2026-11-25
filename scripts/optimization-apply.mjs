import { readFile, writeFile, rm } from "node:fs/promises";
import matter from "gray-matter";
import { file, json, save, hash } from "./lib/io.mjs";
import { validateDraft, validateAnswer, checkCommands } from "./lib/ai.mjs";
import { assertFreshCandidate } from "./lib/optimization.mjs";
const id = process.argv[2];
if (!process.argv.includes("--reviewed"))
  throw new Error(
    "维护者完成正文、来源、摘要与验证检查后，使用 pnpm optimize:apply <contentId> --reviewed",
  );
const pages = await json("content/pages.json");
const page = pages.find((p) => p.id === id);
if (!page || page.file.endsWith(".mdx")) throw new Error("不支持的候选页面");
const candidate = await json(`content/optimization/candidates/${page.id}.json`);
const raw = await readFile(file(page.file), "utf8");
const discovery = await json("content/discovery.json");
const intent = discovery.pages.find((p) => p.id === id);
assertFreshCandidate(candidate, {
  page,
  raw,
  intent,
  pendingIds: (await json("content/sync-status.json")).pendingPageIds,
});
validateDraft(candidate.body);
validateAnswer(candidate.answer);
const parsed = matter(raw);
const snapshots = await Promise.all(
  page.sources.map((sourceId) =>
    json(
      `.upstream/snapshots/${sourceId}/${page.reviewedSources[sourceId].hash}.json`,
    ),
  ),
);
if (
  checkCommands(
    candidate.body,
    parsed.content,
    snapshots.flatMap((s) => s.files.map((f) => f.text)).join("\n"),
  ).length
)
  throw new Error("候选含未确认命令");
// Preserve the exact frontmatter, reviewedAt, and upstream baseline. This approves editing, not a new upstream revision.
const marker = raw.indexOf("---", 3);
if (marker < 0 || !raw.startsWith("---\n")) throw new Error("元信息格式无效");
await writeFile(
  file(page.file),
  raw.slice(0, marker + 3) + "\n\n" + candidate.body + "\n",
);
intent.answer = candidate.answer;
await save("content/discovery.json", discovery);
await save(`content/optimization/reviews/${page.id}.json`, {
  pageId: id,
  approvedAt: new Date().toISOString(),
  beforeHash: candidate.beforeHash,
  afterHash: hash(await readFile(file(page.file), "utf8")),
  summary: candidate.summary,
  signals: candidate.signals,
  sourceVerificationUnchanged: true,
  beforeIntentHash: candidate.intentHash,
  afterIntentHash: hash(JSON.stringify(intent)),
});
await rm(file(`content/optimization/candidates/${page.id}.json`));
console.log(
  "已应用人工核对的编辑稿；官方核对日期与来源基线未变。提交 PR 并通过检查后发布。",
);
