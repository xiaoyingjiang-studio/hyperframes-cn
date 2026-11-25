import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';
export const hash = value => createHash('sha256').update(value).digest('hex');
export const root = resolve(import.meta.dirname, '../..');
export const file = p => resolve(root, p);
export async function json(p, fallback) { try { return JSON.parse(await readFile(file(p), 'utf8')); } catch (e) { if (e.code === 'ENOENT' && fallback !== undefined) return fallback; throw e; } }
export async function save(p, value) { const dest = file(p); await mkdir(dirname(dest), { recursive: true }); await writeFile(dest, JSON.stringify(value, null, 2) + '\n'); }
export function safePath(base, input) { const dest = resolve(base, input); const rel = relative(base, dest); if (rel.startsWith('..') || isAbsolute(rel)) throw new Error('路径超出工作区'); return dest; }
export async function request(url, options = {}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { ...options, signal: options.signal || AbortSignal.timeout(30000) });
      if (!response.ok) { const error = new Error(`HTTP ${response.status}: ${new URL(url).hostname}`); error.status = response.status; throw error; }
      return response;
    } catch (error) {
      if (attempt === 2 || (error.status && error.status < 500 && error.status !== 429)) throw new Error(`来源请求失败：${new URL(url).hostname}（${error.status || error.cause?.code || error.name}）`);
      await new Promise(r => setTimeout(r, 500 * 2 ** attempt));
    }
  }
}
