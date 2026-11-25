import test from 'node:test';
import assert from 'node:assert/strict';
import { routeRequest } from '../worker/routing.mjs';

const config = { site: 'https://guide.example.com', indexable: true, oldHost: 'guide.account.workers.dev' };
const env = { ASSETS: { fetch: async request => new Response(new URL(request.url).pathname, { status: new URL(request.url).pathname === '/missing/' ? 404 : 200 }) } };

test('旧入口迁移保留路径和查询，不能被路径中的双斜线变成开放重定向', async () => {
  for (const path of ['/start/cli/?from=old', '//evil.example/path?x=1']) {
    const response = await routeRequest(new Request('https://' + config.oldHost + path), env, config);
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), config.site + path);
  }
});
test('正式站和 PR 预览交给静态资源，保留真实 404；测试构建不迁移旧入口', async () => {
  for (const host of ['guide.example.com', 'pr-7.account.workers.dev']) {
    assert.equal((await routeRequest(new Request(`https://${host}/start/cli/`), env, config)).status, 200);
    assert.equal((await routeRequest(new Request(`https://${host}/missing/`), env, config)).status, 404);
  }
  assert.equal((await routeRequest(new Request(`https://${config.oldHost}/`), env, { ...config, indexable: false })).status, 200);
});
