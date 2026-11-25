import { readFile, writeFile } from 'node:fs/promises';
import { hash } from './io.mjs';
export async function applyCandidate(path, expectedHash, body) {
  const raw = await readFile(path, 'utf8');
  if (hash(raw) !== expectedHash) throw new Error('页面已被修改，拒绝覆盖');
  const end = raw.indexOf('---', 3);
  if (!raw.startsWith('---\n') || end < 0) throw new Error('页面元信息无效，拒绝覆盖');
  const metadata = raw.slice(0, end + 3).replace(/^status: .+$/m, 'status: "needs-review"');
  await writeFile(path, `${metadata}\n\n${body}\n`);
}
