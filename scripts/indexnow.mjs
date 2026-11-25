import { readFile } from "node:fs/promises";
import { json, save } from "./lib/io.mjs";
import { resolveSite } from "./lib/discovery.mjs";
const site = resolveSite(await json("site.config.json"));
if (process.env.INDEXNOW_SKIP === "true") {
  console.log("前次清单未可靠获取，跳过本次自动通知。");
  process.exit(0);
}
if (!site.indexable || !process.env.INDEXNOW_KEY) {
  console.log("跳过 IndexNow：正式域名尚未开放收录或未配置验证 key。");
  process.exit(0);
}
const current = await json("dist/content-manifest.json");
if (current.site !== site.url || !current.indexable)
  throw new Error("构建模式或站点地址不匹配");
const key = process.env.INDEXNOW_KEY;
if (!/^[a-zA-Z0-9-]{8,128}$/.test(key))
  throw new Error("IndexNow key 格式无效");
const previousPath = process.env.PREVIOUS_MANIFEST;
let previous;
if (previousPath) previous = JSON.parse(await readFile(previousPath, "utf8"));
if (previous && previous.site !== current.site)
  throw new Error("前次清单与当前域名不一致，请按首次上线处理");
const before = new Map(
  (previous?.pages || []).map((p) => [p.route, p.contentHash]),
);
const routes = current.pages
  .filter((p) => before.get(p.route) !== p.contentHash)
  .map((p) => p.route);
for (const page of previous?.pages || [])
  if (!current.pages.some((p) => p.route === page.route))
    routes.push(page.route);
const payload = {
  host: new URL(site.url).host,
  key,
  keyLocation: `${site.url}/${key}.txt`,
  urlList: [...new Set(routes)].map((route) => new URL(route, site.url).href),
};
if (
  payload.urlList.some((url) => new URL(url).origin !== site.url) ||
  payload.urlList.length > 10000
)
  throw new Error("提交地址超出范围");
if (!process.argv.includes("--submit")) {
  await save("artifacts/indexnow-dry-run.json", {
    host: payload.host,
    urls: payload.urlList,
  });
  console.log(
    `IndexNow 预演：${payload.urlList.length} 个新增、修改或删除地址，尚未发送。`,
  );
  process.exit(0);
}
if (!payload.urlList.length) {
  console.log("内容无变化，不重复提交 IndexNow。");
  process.exit(0);
}
const proof = await fetch(payload.keyLocation, {
  signal: AbortSignal.timeout(15000),
});
if (!proof.ok || (await proof.text()).trim() !== key)
  throw new Error("线上验证文件不可用，停止提交");
const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
  signal: AbortSignal.timeout(20000),
});
if (![200, 202].includes(response.status))
  throw new Error(`IndexNow 返回 HTTP ${response.status}`);
await save("artifacts/indexnow-result.json", {
  submittedAt: new Date().toISOString(),
  status: response.status,
  urls: payload.urlList,
});
console.log(
  `IndexNow 已接收 ${payload.urlList.length} 个地址；不代表已经收录。`,
);
