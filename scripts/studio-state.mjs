import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import { file } from './lib/io.mjs';

const ref = 'refs/heads/studio-content-state';
const path = 'state.json';
const git = (args, input) => execFileSync('git', args, { input, encoding: 'utf8', windowsHide: true }).trim();
const remote = spawnSync('git', ['ls-remote', '--exit-code', 'origin', ref], { encoding: 'utf8', windowsHide: true });
if (![0, 2].includes(remote.status)) throw new Error('无法读取手册状态分支');
const parent = remote.stdout.split(/\s/)[0];
if (parent) git(['fetch', '--no-tags', 'origin', ref]);
const oldState = parent ? git(['show', `${parent}:${path}`]) : '';
const dest = file('artifacts/studio-state.json');
if (process.argv[2] === 'load') {
  await mkdir(file('artifacts'), { recursive: true });
  await writeFile(dest, oldState ? oldState + '\n' : '{}\n');
} else if (process.argv[2] === 'save') {
  const newState = (await readFile(dest, 'utf8')).trim();
  if (JSON.parse(newState).schemaVersion !== 1) throw new Error('手册状态文件无效');
  if (newState !== oldState) {
    const blob = git(['hash-object', '-w', '--stdin'], newState + '\n');
    const tree = git(['mktree'], `100644 blob ${blob}\t${path}\n`);
    const commit = git(['commit-tree', tree, ...(parent ? ['-p', parent] : []), '-m', 'chore: record studio collection state']);
    git(['push', 'origin', `${commit}:${ref}`]);
  }
} else throw new Error('未知的手册状态操作');
