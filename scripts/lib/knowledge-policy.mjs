// Trusted policy: generators never edit this file. Routes derive from stable ids.
export const sections = [
  ['orientation', '认识与选择'], ['studio', 'Studio 创作'], ['capabilities', '能力地图'],
  ['mechanisms', '创作机制'], ['skills', 'Skills 与创作工具'], ['workflows', '创作方法'],
  ['problems', '问题与限制'], ['updates', '更新与前瞻'], ['community', '关于与贡献'],
].map(([id, title]) => ({ id, title }));
export const mechanisms = [
  ['brief', '把需求变成可执行的创作任务', '一段需求怎样表达为可执行的创作任务？', ['docs/studio-app/first-video.mdx', 'skills/hyperframes/SKILL.md']],
  ['editable-project', '理解可编辑项目与素材', '项目里哪些内容可以修改、替换和复用？', ['docs/concepts/compositions.mdx', 'docs/concepts/variables.mdx']],
  ['time-and-scenes', '场景、片段与时间', '场景、片段、轨道与时间怎样影响画面？', ['docs/concepts/compositions.mdx', 'docs/concepts/data-attributes.mdx']],
  ['targeted-edits', '让修改准确落在画面上', '选取、画圈、评论和时间范围怎样帮助定位修改？', ['docs/studio-app/edit-with-the-agent.mdx']],
  ['batch-edits', '组织多条修改要求', '多条修改怎样组合，怎样减少相互干扰？', ['docs/studio-app/edit-with-the-agent.mdx']],
  ['references', '分清参考视频与风格参考', '参考视频与风格参考分别怎样影响结果？', ['docs/studio-app/reference-video.mdx', 'skills/style-sampling/SKILL.md', 'skills/reverse-any-video/SKILL.md']],
  ['media-and-blocks', '组合素材、生成内容与组件', '用户素材、生成素材与组件怎样组合？', ['docs/guides/media.mdx', 'docs/catalog/index.mdx']],
  ['audio-and-captions', '配合字幕、配音、音乐与原声', '字幕、配音、音乐和原声怎样配合？', ['docs/guides/captions-and-recuts.mdx', 'docs/guides/voice-and-audio.mdx']],
  ['brand-and-variables', '保持品牌与系列风格一致', '变量与品牌设置怎样帮助保持一致？', ['docs/concepts/variables.mdx', 'docs/studio-app/brand-kits.mdx']],
  ['preview-and-export', '理解预览与导出的差别', '为什么预览、拖动时间轴和最终导出可能不同？', ['docs/concepts/determinism.mdx', 'docs/studio-app/export.mdx']],
  ['checks', '理解自动检查的边界', '自动检查能发现什么，不能证明什么？', ['skills/hyperframes/SKILL.md', 'skills/hyperframes-cli/references/lint-validate-inspect.md']],
  ['history', '保留修改与恢复项目', '怎样保留自己的修改，并在失败后恢复？', ['docs/studio-app/edit-with-the-agent.mdx', 'skills/hyperframes-cli/SKILL.md']],
].map(([slug, title, question, paths]) => ({ id: `mechanism-${slug}`, articleId: `mechanisms-${slug}`, route: `/mechanisms/${slug}/`, file: `src/content/docs/mechanisms/${slug}.md`, type: 'mechanism', section: 'mechanisms', title, question, paths, entries: ['targeted-edits', 'batch-edits'].includes(slug) ? ['studio'] : slug === 'checks' ? ['cli-agent'] : ['editable-project', 'time-and-scenes', 'brand-and-variables', 'preview-and-export'].includes(slug) ? ['studio', 'cli-agent', 'browser-editor'] : ['studio', 'cli-agent'], related: [] }));
export const studioTopics = [
  ['workspace', '认识 Studio 创作工作区', '怎样在 Studio 工作区找到创作、素材与编辑入口？'],
  ['video-clips', '生成并修改视频素材', '怎样在 Studio 使用 HeyGen Video 1 生成和修改素材？'],
  ['reference-video', '使用参考视频开始创作', '怎样用参考视频说明想做的视频？'],
  ['edit-with-the-agent', '选取、画圈与批量修改', '怎样准确指示 Studio 修改画面中的内容？'],
  ['brand-kits', '使用品牌资料保持一致', '怎样准备和使用 Studio 品牌资料？'],
  ['export', '导出并检查最终视频', '怎样导出 Studio 视频并检查交付结果？'],
  ['existing-project', '打开已有的可编辑项目', '怎样继续编辑已经存在的 HyperFrames 项目？'],
  ['connect-your-agent', '连接创作 Agent', '怎样选择并连接 Studio 使用的 Agent？'],
].map(([slug, title, question]) => ({ id: `studio-${slug}`, articleId: `studio-${slug}`, route: `/studio/${slug}/`, file: `src/content/docs/studio/${slug}.md`, type: 'tutorial', section: 'studio', title, question, paths: [`docs/studio-app/${slug}.mdx`], entries: ['studio'], related: [] }));
export function sourceId(path, registry) {
  return registry.sources.find(s => s.path === path)?.id || `official-${path.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}
export function skillEntity(name) {
  if (!/^[a-z][a-z0-9-]{0,79}$/.test(name)) throw new Error('正式 skill 名称无效');
  return { id: `skill-${name}`, articleId: `skills-${name}`, type: 'skill', section: 'skills', title: `${name}：职责与创作方法`, question: `${name} skill 解决什么创作问题，怎样使用？`, route: `/skills/${name}/`, file: `src/content/docs/skills/${name}.md`, paths: [`skills/${name}/SKILL.md`], entries: ['cli-agent'], related: ['features-skills-catalog'] };
}
export function legacySection(page) {
  if (page.id === 'start-studio') return 'studio';
  if (page.id === 'features-skills-catalog') return 'skills';
  if (page.id.startsWith('overview-') || page.id === 'knowledge') return 'orientation';
  if (page.id.startsWith('features-')) return 'capabilities';
  if (/windows|troubleshooting|chinese-typography/.test(page.id)) return 'problems';
  if (page.id.startsWith('updates')) return 'updates';
  if (page.id.startsWith('community')) return 'community';
  return 'workflows';
}
export function connectKnowledge(entities) {
  for (const entity of entities) {
    if (entity.articleId === 'overview-what-is-hyperframes') { entity.id = 'product-hyperframes'; entity.type = 'product'; }
    if (entity.articleId === 'start-studio') { entity.id = 'product-studio'; entity.type = 'product'; }
    if (entity.articleId === 'features-skills-catalog') { entity.id = 'resource-catalog'; entity.type = 'resource'; }
    if (entity.section === 'capabilities') entity.type = 'capability';
    if (entity.section === 'workflows') entity.type = 'workflow';
  }
  for (const entity of entities) {
    entity.relations = [];
    if (entity.id !== 'product-hyperframes' && entity.entries.includes('cli-agent')) entity.relations.push({ type: 'applies-to', target: 'product-hyperframes' });
    if (entity.id !== 'product-studio' && entity.entries.includes('studio')) entity.relations.push({ type: 'applies-to', target: 'product-studio' });
    for (const articleId of entity.related) {
      const related = entities.find(e => e.articleId === articleId);
      if (related) entity.relations.push({ type: 'learn-with', target: related.id });
    }
  }
  return entities;
}
