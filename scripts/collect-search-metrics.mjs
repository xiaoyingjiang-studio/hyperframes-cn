import { GoogleAuth } from "google-auth-library";
import { json, save } from "./lib/io.mjs";
import { resolveSite } from "./lib/discovery.mjs";
import { validateObservations } from "./lib/optimization.mjs";
const site = resolveSite(await json("site.config.json"));
const output = { schemaVersion: 1, observations: [] };
if (
  !site.indexable ||
  !process.env.GSC_PROPERTY ||
  !process.env.GSC_SERVICE_ACCOUNT_JSON
) {
  await save("artifacts/search-observations.json", output);
  console.log(
    "跳过自动搜索数据采集：正式站收录或 Search Console 只读凭据未配置。",
  );
  process.exit(0);
}
let credentials;
try {
  credentials = JSON.parse(process.env.GSC_SERVICE_ACCOUNT_JSON);
} catch {
  throw new Error("Search Console 服务账号 JSON 无法解析；原文不输出");
}
if (
  credentials.type !== "service_account" ||
  !credentials.client_email ||
  !credentials.private_key
)
  throw new Error("Search Console 服务账号配置无效");
const property = process.env.GSC_PROPERTY;
if (
  property !== `sc-domain:${new URL(site.url).hostname}` &&
  property !== site.url + "/"
)
  throw new Error("GSC_PROPERTY 必须对应当前正式域名");
// Search Console uses Pacific dates; exclude the latest 3 days and request finalized data only.
const endInstant = new Date(Date.now() - 3 * 86400000);
const endDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(endInstant);
const startDate = new Date(Date.parse(endDate + "T00:00:00Z") - 27 * 86400000)
  .toISOString()
  .slice(0, 10);
let rows;
try {
  const auth = new GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  const client = await auth.getClient();
  const response = await client.request({
    url: `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`,
    method: "POST",
    data: {
      startDate,
      endDate,
      dimensions: ["page"],
      type: "web",
      dataState: "final",
      rowLimit: 5000,
    },
    timeout: 30000,
  });
  rows = response.data.rows || [];
} catch (error) {
  throw new Error(
    `Search Console 只读请求失败（HTTP ${error.response?.status || "网络/认证"}）；不输出凭据或响应正文`,
  );
}
const manifest = await json("dist/content-manifest.json");
for (const row of rows) {
  const page = manifest.pages.find((p) => site.url + p.route === row.keys[0]);
  if (!page) continue;
  output.observations.push({
    kind: "search",
    engine: "google",
    pageId: page.id,
    query: page.question,
    aggregation: "page",
    period: { start: startDate, end: endDate, timeZone: "America/Los_Angeles" },
    impressions: row.impressions,
    clicks: row.clicks,
    position: row.position,
    evidence: `Search Console API ${property} / ${startDate}..${endDate} / web / finalized / page aggregate`,
  });
}
validateObservations(output, new Set(manifest.pages.map((p) => p.id)));
await save("artifacts/search-observations.json", output);
console.log(
  `已采集 ${output.observations.length} 页汇总观测；不采集访客搜索词，不写入公开仓库。`,
);
