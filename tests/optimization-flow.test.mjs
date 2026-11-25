import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  copyFile,
  writeFile,
  readFile,
  rm,
} from "node:fs/promises";
import { resolve, dirname, sep } from "node:path";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { root } from "../scripts/lib/io.mjs";

test(
  "模拟完整优化闭环：生成不改正文、人工改动保护、审核应用、等待新观测",
  { timeout: 30000 },
  async () => {
    const cache = resolve(root, ".cache");
    await mkdir(cache, { recursive: true });
    const directory = await mkdtemp(resolve(cache, "optimization-test-"));
    assert.ok(directory.startsWith(cache + sep));
    const write = async (path, text) => {
      const dest = resolve(directory, path);
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, text);
    };
    const save = (path, value) => write(path, JSON.stringify(value));
    const read = async (path) =>
      JSON.parse(await readFile(resolve(directory, path), "utf8"));
    let calls = 0;
    const server = createServer(async (request, response) => {
      let body = "";
      for await (const chunk of request) body += chunk;
      const input = JSON.parse(JSON.parse(body).messages[1].content);
      assert.equal(input.currentAnswer, "已有的中文摘要。".repeat(8));
      calls++;
      response.setHeader("Content-Type", "application/json");
      response.end(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  body: "改进后的中文步骤和条件。".repeat(20),
                  answer: "经过来源核对的更清晰的中文回答。".repeat(4),
                  summary: "改进测试夹具的表达",
                  checks: ["人工核对测试夹具"],
                }),
              },
            },
          ],
        }),
      );
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      for (const path of [
        "scripts/optimize.mjs",
        "scripts/optimization-apply.mjs",
        "scripts/lib/io.mjs",
        "scripts/lib/optimization.mjs",
        "scripts/lib/ai.mjs",
      ]) {
        await mkdir(dirname(resolve(directory, path)), { recursive: true });
        await copyFile(resolve(root, path), resolve(directory, path));
      }
      const pages = [
        {
          id: "fixture",
          file: "src/content/docs/fixture.md",
          sources: ["source"],
          reviewedSources: {
            source: { hash: "fixture-hash", commit: "fixture-commit" },
          },
        },
      ];
      const raw =
        '---\ntitle: 测试夹具\nkind: tutorial\nreviewedAt: "2026-11-25"\nstatus: reviewed\n---\n\n原有的测试正文。';
      await write(pages[0].file, raw);
      await save("content/pages.json", pages);
      await save("content/discovery.json", {
        pages: [
          {
            id: "fixture",
            question: "测试问题？",
            answer: "已有的中文摘要。".repeat(8),
          },
        ],
      });
      await save("content/sync-status.json", { pendingPageIds: [] });
      await write("content/glossary.md", "仅用于本地回归测试的夹具。");
      await save(".upstream/snapshots/source/fixture-hash.json", {
        files: [{ text: "测试来源，不代表官方实际内容。" }],
      });
      await save("artifacts/discovery-audit.json", { errors: 0 });
      await save("content/optimization/observations.json", {
        schemaVersion: 1,
        observations: [
          {
            kind: "search",
            engine: "fixture",
            pageId: "fixture",
            query: "测试问题",
            period: { start: "2026-11-01", end: "2026-11-20" },
            impressions: 200,
            clicks: 1,
            evidence: "本地模拟观测，仅用于回归测试",
          },
        ],
      });
      const env = {
        ...process.env,
        AI_ENDPOINT: `http://127.0.0.1:${server.address().port}/chat/completions`,
        AI_MODEL: "fixture",
        AI_API_KEY: "fixture-not-a-real-key",
        OPTIMIZATION_OBSERVATIONS: "",
      };
      const run = (script, args = []) =>
        promisify(execFile)(process.execPath, [script, ...args], {
          cwd: directory,
          env,
          windowsHide: true,
          timeout: 10000,
        });
      await run("scripts/optimize.mjs");
      assert.equal(calls, 1);
      assert.equal(
        await readFile(resolve(directory, pages[0].file), "utf8"),
        raw,
      );
      await run("scripts/optimize.mjs");
      assert.equal(calls, 1);
      await write(pages[0].file, raw + "人工新修改");
      await assert.rejects(
        run("scripts/optimization-apply.mjs", ["fixture", "--reviewed"]),
        /拒绝覆盖/,
      );
      await write(pages[0].file, raw);
      await assert.rejects(
        run("scripts/optimization-apply.mjs", ["fixture"]),
        /--reviewed/,
      );
      await run("scripts/optimization-apply.mjs", ["fixture", "--reviewed"]);
      assert.match(
        await readFile(resolve(directory, pages[0].file), "utf8"),
        /reviewedAt: "2026-11-25"/,
      );
      assert.deepEqual(await read("content/pages.json"), pages);
      assert.match(
        (await read("content/discovery.json")).pages[0].answer,
        /更清晰/,
      );
      await run("scripts/optimize.mjs");
      assert.equal(calls, 1);
      assert.equal(
        (await read("artifacts/optimization-report.json")).generated.length,
        0,
      );
    } finally {
      await new Promise((resolve) => server.close(resolve));
      if (!directory.startsWith(cache + sep))
        throw new Error("拒绝清理工作区以外的测试目录");
      await rm(directory, { recursive: true, force: true });
    }
  },
);
