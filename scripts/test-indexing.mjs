import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import { file, root } from "./lib/io.mjs";
const run = (script, env) =>
  execFileSync(process.execPath, [script], {
    cwd: root,
    env: { ...process.env, ...env },
    encoding: "utf8",
    stdio: "pipe",
    windowsHide: true,
  });
try {
  const env = { SITE_URL: "https://guide.example.com", SITE_INDEXABLE: "true", OLD_DEFAULT_HOST: "guide.account.workers.dev" };
  run("scripts/postbuild.mjs", env);
  run("scripts/discovery-audit.mjs", env);
  const headers = await readFile(file("dist/_headers"), "utf8");
  assert.ok(!headers.split("/_astro/")[0].includes("X-Robots-Tag: noindex"));
  assert.match(await readFile(file("dist/robots.txt"), "utf8"), /Allow: \//);
  assert.deepEqual(JSON.parse(await readFile(file('.cache/edge-site.json'), 'utf8')), { site: env.SITE_URL, indexable: true, oldHost: env.OLD_DEFAULT_HOST });
  const example = load(
    await readFile(file("dist/examples/product-intro/index.html"), "utf8"),
  );
  assert.match(example('meta[name="robots"]').attr("content"), /noindex/);
  const canonical = load(
    await readFile(file("dist/start/cli/index.html"), "utf8"),
  );
  assert.equal(
    canonical('link[rel="canonical"]').attr("href"),
    "https://guide.example.com/start/cli/",
  );
  console.log(
    "正式域名模式通过：开放抓取、规范地址切换、404 与示例源码禁止收录。",
  );
} finally {
  run("scripts/postbuild.mjs", {});
  run("scripts/discovery-audit.mjs", {});
  console.log("已恢复原始站点配置。");
}
