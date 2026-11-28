import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
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
  const notFound = load(await readFile(file('dist/404.html'), 'utf8'));
  assert.match(notFound('meta[name="robots"]').attr('content'), /noindex/);
  const canonical = load(await readFile(file('dist/index.html'), 'utf8'));
  assert.equal(
    canonical('link[rel="canonical"]').attr("href"),
    "https://guide.example.com/",
  );
  for (const oldPath of ['dist/start/cli/index.html', 'dist/hyperframes/index.html', 'dist/content/home.md', 'dist/examples/product-intro/index.html']) {
    await assert.rejects(access(file(oldPath)), { code: 'ENOENT' });
  }
  console.log(
    "正式域名模式通过：开放抓取、规范地址切换、404 禁止收录，旧指南与示例未发布。",
  );
} finally {
  run("scripts/postbuild.mjs", {});
  run("scripts/discovery-audit.mjs", {});
  console.log("已恢复原始站点配置。");
}
