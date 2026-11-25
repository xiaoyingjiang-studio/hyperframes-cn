import { hash } from "./io.mjs";

export function assertFreshCandidate(
  candidate,
  { page, raw, intent, pendingIds = [] },
) {
  if (
    candidate.pageId !== page.id ||
    candidate.beforeHash !== hash(raw) ||
    candidate.intentHash !== hash(JSON.stringify(intent)) ||
    candidate.reviewedSourcesHash !== hash(JSON.stringify(page.reviewedSources))
  )
    throw new Error("正文、摘要或来源基线已变化，拒绝覆盖，请重新审阅");
  if (pendingIds.includes(page.id))
    throw new Error("官方来源待核对，应先处理来源变化");
}

export function validateObservations(input, ids) {
  if (
    input.schemaVersion !== 1 ||
    !Array.isArray(input.observations) ||
    input.observations.length > 5000
  )
    throw new Error("观测数据格式或数量无效");
  for (const item of input.observations) {
    if (
      !ids.has(item.pageId) ||
      typeof item.query !== "string" ||
      !item.query.trim() ||
      item.query.length > 300 ||
      typeof item.engine !== "string" ||
      !item.engine ||
      typeof item.evidence !== "string" ||
      item.evidence.length < 8
    )
      throw new Error("观测缺少页面、查询、平台或证据");
    if (item.kind === "search") {
      const validDate = (value) =>
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !Number.isNaN(Date.parse(value)) &&
        new Date(value).toISOString().slice(0, 10) === value;
      if (
        !validDate(item.period?.start) ||
        !validDate(item.period?.end) ||
        item.period.start > item.period.end
      )
        throw new Error("观测时间范围无效");
      if (
        !Number.isInteger(item.impressions) ||
        !Number.isInteger(item.clicks) ||
        item.impressions < 0 ||
        item.clicks < 0 ||
        item.clicks > item.impressions
      )
        throw new Error("搜索指标无效");
      if (
        item.position !== undefined &&
        (!Number.isFinite(item.position) || item.position < 1)
      )
        throw new Error("平均位置无效");
    } else if (item.kind === "citation") {
      if (
        typeof item.cited !== "boolean" ||
        !/^\d{4}-\d{2}-\d{2}T/.test(item.observedAt) ||
        Number.isNaN(Date.parse(item.observedAt)) ||
        !item.model
      )
        throw new Error("AI 引用观测缺少日期、模型或引用结果");
      if (
        !Array.isArray(item.siteCitations) ||
        item.siteCitations.some((url) => {
          try {
            return new URL(url).protocol !== "https:";
          } catch {
            return true;
          }
        }) ||
        item.cited !== item.siteCitations.length > 0
      )
        throw new Error(
          "AI 引用结果必须包含实际本站引用 URL；未引用使用空数组",
        );
      if (!["unchecked", "supported", "unsupported"].includes(item.accuracy))
        throw new Error("AI 引用需记录内容准确性核对状态");
    } else throw new Error("不支持的观测类型");
  }
  return input;
}
export function prioritize(pages, observations, pendingIds = []) {
  const pending = new Set(pendingIds);
  const latest = new Map();
  for (const item of observations) {
    const key = JSON.stringify([
      item.kind,
      item.engine,
      item.model || "",
      item.pageId,
      item.query,
      item.context || "",
    ]);
    const date = (value) =>
      value.kind === "search" ? value.period.end : value.observedAt;
    if (!latest.has(key) || date(item) >= date(latest.get(key)))
      latest.set(key, item);
  }
  return pages
    .filter((p) => !pending.has(p.id))
    .map((page) => {
      const signals = [...latest.values()].filter((o) => o.pageId === page.id);
      const reasons = [];
      for (const signal of signals) {
        if (
          signal.kind === "search" &&
          signal.impressions >= 100 &&
          signal.clicks / signal.impressions < 0.02
        )
          reasons.push({
            type: "low-ctr",
            query: signal.query,
            evidence: signal.evidence,
            period: signal.period,
          });
        if (signal.kind === "citation" && !signal.cited)
          reasons.push({
            type: "citation-gap",
            query: signal.query,
            evidence: signal.evidence,
            observedAt: signal.observedAt,
            engine: signal.engine,
            model: signal.model,
          });
        if (
          signal.kind === "citation" &&
          signal.cited &&
          signal.accuracy === "unsupported"
        )
          reasons.push({
            type: "citation-mismatch",
            query: signal.query,
            evidence: signal.evidence,
            siteCitations: signal.siteCitations,
            observedAt: signal.observedAt,
            engine: signal.engine,
            model: signal.model,
          });
      }
      return {
        pageId: page.id,
        reasons,
        priority: reasons.length,
        scope: "仅是编辑排查优先级，非排名分数或效果预测",
      };
    })
    .filter((p) => p.reasons.length)
    .sort(
      (a, b) => b.priority - a.priority || a.pageId.localeCompare(b.pageId),
    );
}
