import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { buildSourceContext } from "../scripts/lib/source-context.mjs";
import { archiveSnapshot } from "../scripts/lib/snapshots.mjs";
import { hash } from "../scripts/lib/io.mjs";

test("长文末尾的真实改动完整进入差异，不重复发送整篇长文", () => {
  const text = Array.from(
    { length: 4000 },
    (_, i) => `reference line ${i}: ${"unchanged text ".repeat(4)}`,
  ).join("\n");
  const old = {
    id: "cli",
    commit: "old",
    hash: "old",
    files: [{ path: "docs/cli.mdx", text }],
  };
  const fresh = {
    ...old,
    commit: "new",
    hash: "new",
    files: [
      {
        path: "docs/cli.mdx",
        text: text.replace("reference line 3990:", "changed command 3990:"),
      },
    ],
  };
  const result = buildSourceContext([old], [fresh]);
  const serialized = JSON.stringify(result);
  assert.ok(Buffer.byteLength(serialized) < 40000);
  assert.match(serialized, /changed command 3990/);
  assert.match(serialized, /reference line 3990/);
  assert.equal(result.changes.length, 1);
});
test("新增、删除和组件片段变化均保留差异；过大的变更拒绝静默截断", () => {
  const before = {
    id: "a",
    files: [
      { path: "gone.md", text: "旧文档\n" },
      { path: "shared.jsx", text: "old value\n" },
    ],
  };
  const after = {
    id: "a",
    files: [
      { path: "new.md", text: "新文档\n" },
      { path: "shared.jsx", text: "new value\n" },
    ],
  };
  const result = buildSourceContext([before], [after]);
  assert.equal(result.changes.length, 3);
  assert.match(JSON.stringify(result), /new value/);
  assert.throws(
    () =>
      buildSourceContext(
        [],
        [
          {
            id: "large",
            files: [{ path: "large.md", text: "新增内容".repeat(20000) }],
          },
        ],
      ),
    /超过单次输入|差异过大/,
  );
});
test("归档不覆盖已有相同哈希快照的提交与采集时间", async () => {
  const parent = resolve(tmpdir());
  const directory = await mkdtemp(join(parent, "hyperframes-snapshot-"));
  assert.ok(directory.startsWith(parent + sep));
  try {
    const files = [{ path: "docs/a.md", text: "source" }];
    const first = {
      id: "a",
      hash: hash(JSON.stringify(files)),
      commit: "first",
      collectedAt: "first-date",
      files,
    };
    const path = join(directory, "snapshot.json");
    assert.equal(await archiveSnapshot(first, path), true);
    assert.equal(
      await archiveSnapshot(
        { ...first, commit: "later", collectedAt: "later-date" },
        path,
      ),
      false,
    );
    assert.deepEqual(JSON.parse(await readFile(path, "utf8")), first);
  } finally {
    if (!directory.startsWith(parent + sep)) throw new Error("清理路径无效");
    await rm(directory, { recursive: true, force: true });
  }
});
