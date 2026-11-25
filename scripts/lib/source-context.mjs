import { structuredPatch } from "diff";

// Changed lines are never truncated. If their complete diff cannot fit, require manual splitting.
export function buildSourceContext(before, after, { maxBytes = 40000 } = {}) {
  const metadata = (source) =>
    source && {
      id: source.id,
      path: source.path,
      commit: source.commit,
      hash: source.hash,
    };
  const result = {
    before: before.filter(Boolean).map(metadata),
    after: after.filter(Boolean).map(metadata),
    changes: [],
    references: [],
    omitted: [],
  };
  const references = [];
  for (let index = 0; index < after.length; index++) {
    const old = before[index];
    const fresh = after[index];
    const previous = new Map(
      (old?.files || []).map((file) => [file.path, file.text]),
    );
    const next = new Map(
      (fresh?.files || []).map((file) => [file.path, file.text]),
    );
    for (const path of new Set([...previous.keys(), ...next.keys()])) {
      const a = previous.get(path) || "";
      const b = next.get(path) || "";
      if (a !== b) {
        const patch = structuredPatch(path, path, a, b, undefined, undefined, {
          context: 16,
          maxEditLength: 12000,
          timeout: 1000,
        });
        if (!patch)
          throw new Error("来源差异过大，需拆分人工审核；完整来源已归档");
        result.changes.push({
          sourceId: fresh?.id || old?.id,
          path,
          hunks: patch.hunks,
        });
      } else if (/\.(?:mdx?|txt|json)$/i.test(path))
        references.push({ sourceId: fresh.id, path, text: b });
      else
        result.omitted.push({
          path,
          reason:
            "未变化的组件实现不进入模型上下文；原始文件仍在固定来源快照中",
        });
    }
  }
  const size = () => Buffer.byteLength(JSON.stringify(result));
  if (size() > maxBytes)
    throw new Error("完整来源差异超过单次输入上限，需拆分人工审核；未截断变更");
  // Prefer complete short reference documents. Long unchanged references are explicitly marked excerpts.
  for (const reference of references.sort(
    (a, b) => Buffer.byteLength(a.text) - Buffer.byteLength(b.text),
  )) {
    const partial = Buffer.byteLength(reference.text) > 7000;
    const excerpt = {
      ...reference,
      text: partial ? reference.text.slice(0, 1800) : reference.text,
      partial,
    };
    result.references.push(excerpt);
    if (size() > maxBytes) {
      result.references.pop();
      result.omitted.push({
        path: reference.path,
        reason: "参考材料超出上下文预算；完整来源已归档",
      });
    }
  }
  if (size() > maxBytes)
    throw new Error("来源上下文元数据超过单次输入上限，需人工拆分");
  return result;
}
