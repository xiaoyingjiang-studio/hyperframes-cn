import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { file, hash } from "./io.mjs";

export async function archiveSnapshot(snapshot, destination) {
  if (
    !/^[a-z0-9-]+$/.test(snapshot.id) ||
    !/^(?:[a-f0-9]{64}|deleted)$/.test(snapshot.hash)
  )
    throw new Error("来源快照 ID 或哈希无效");
  const valid = (value) =>
    value.hash === "deleted" ||
    hash(JSON.stringify(value.files)) === value.hash;
  if (!valid(snapshot)) throw new Error("来源快照内容与哈希不一致");
  const path =
    destination ||
    file(`.upstream/snapshots/${snapshot.id}/${snapshot.hash}.json`);
  await mkdir(dirname(path), { recursive: true });
  try {
    await writeFile(path, JSON.stringify(snapshot, null, 2) + "\n", {
      flag: "wx",
    });
    return true;
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    const existing = JSON.parse(await readFile(path, "utf8"));
    if (existing.hash !== snapshot.hash || !valid(existing))
      throw new Error("已归档快照损坏，拒绝覆盖");
    return false;
  }
}
