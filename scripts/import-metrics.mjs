import { readFile } from "node:fs/promises";
import { json, save, hash } from "./lib/io.mjs";
import { validateObservations } from "./lib/optimization.mjs";
import { landingPages } from './lib/landing-pages.mjs';
const path = process.argv[2];
if (!path) throw new Error("用法：pnpm metrics:import <观测 JSON 文件>");
const ids = new Set(landingPages.map(({ id }) => id));
const input = validateObservations(
  JSON.parse(await readFile(path, "utf8")),
  ids,
);
const current = validateObservations(
  await json("content/studio-observations.json", { schemaVersion: 1, observations: [] }),
  ids,
);
const unique = new Map(
  [...current.observations, ...input.observations].map((item) => [
    hash(JSON.stringify(item)),
    item,
  ]),
);
const next = validateObservations(
  { schemaVersion: 1, observations: [...unique.values()] },
  ids,
);
await save("content/studio-observations.json", next);
console.log(
  `已导入并精确去重：${next.observations.length} 条真实观测。提交前请检查查询和证据不含私人数据。`,
);
