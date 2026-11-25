import { readFile } from 'node:fs/promises';
import matter from 'gray-matter';
import { file, json, save } from './lib/io.mjs';
import { configured, generateDraft, Budget, checkCommands } from './lib/ai.mjs';

if (!configured()) throw new Error('AI_ENDPOINT、AI_MODEL、AI_API_KEY 尚未全部配置；本检查不能以跳过视为成功。');
const pages = await json('content/pages.json');
const page = pages.find(p => p.id === 'start-cli');
const { content } = matter(await readFile(file(page.file), 'utf8'));
const intent = (await json('content/discovery.json')).pages.find(p => p.id === page.id);
// Use existing reviewed Chinese content as evidence. No fabricated analytics or upstream updates.
const current = content.slice(0, 1800);
const env = { ...process.env, AI_MAX_CALLS: '1', AI_MAX_TOTAL_TOKENS: '16000', AI_MAX_OUTPUT_TOKENS: '2400', AI_TIMEOUT_MS: '90000' };
const budget = new Budget(env);
try {
  const draft = await generateDraft({
    purpose: '真实连接与格式验证。依据已审核片段生成 200–350 字中文 Markdown，只整理信息，不添加新事实、不声称实际运行了命令。不需联网，不更改正式页面。',
    pageType: 'tutorial', current, currentAnswer: intent.answer,
    additionalOutput: '必须同时返回 answer：45–180 个字符、单行纯文本，与正文一致；JSON 字段为 body、answer、summary、checks。',
    oldSources: [{ label: '已审核中文片段', text: current }],
    newSources: [{ label: '相同已审核片段，本次没有来源变化', text: current }],
  }, { env, budget, maxRetries: 0 });
  if (checkCommands(draft.body, current, '').length) throw new Error('模型返回了片段中不存在的命令');
  const report = { checkedAt: new Date().toISOString(), result: 'passed', model: env.AI_MODEL, calls: budget.calls, usage: draft.usage, validated: ['authentication', 'chat-completions', 'markdown-body', 'plain-answer', 'summary', 'review-checks', 'command-preservation'], productionContentChanged: false };
  await save('artifacts/ai-check.json', report);
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  // Never log upstream payloads, authorization headers, or the API key.
  await save('artifacts/ai-check.json', { checkedAt: new Date().toISOString(), result: 'failed', calls: budget.calls, reason: error.message, productionContentChanged: false });
  console.error(`AI 检查失败：${error.message}`);
  process.exitCode = 1;
}
