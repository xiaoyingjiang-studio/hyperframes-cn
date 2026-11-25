import { appendFile } from "node:fs/promises";
import { json, save } from "./lib/io.mjs";
import { resolveSite } from "./lib/discovery.mjs";
const site = resolveSite(await json("site.config.json"));
if (!site.indexable) process.exit(0);
try {
  const response = await fetch(site.url + "/content-manifest.json", {
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    console.log("线上尚无可用清单，按首次通知处理。");
    process.exit(0);
  }
  const previous = await response.json();
  if (previous.site !== site.url || !Array.isArray(previous.pages))
    throw new Error("清单格式无效");
  await save("artifacts/previous-manifest.json", previous);
  if (process.env.GITHUB_ENV)
    await appendFile(
      process.env.GITHUB_ENV,
      "PREVIOUS_MANIFEST=artifacts/previous-manifest.json\n",
    );
} catch {
  console.log("前次清单读取失败，本次不做自动提交，避免重复通知。");
  if (process.env.GITHUB_ENV)
    await appendFile(process.env.GITHUB_ENV, "INDEXNOW_SKIP=true\n");
}
