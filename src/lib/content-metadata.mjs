/** @type {Record<string, string>} */
export const entryNames = { studio: 'Studio 桌面应用', 'cli-agent': 'CLI / Agent', 'browser-editor': '浏览器编辑器' };

/**
 * Keep actual operation/version boundaries intact. The current documentation
 * version is displayed separately from the preserved frontmatter.
 * @param {string | undefined} value
 * @param {string | undefined} sourceVersion
 */
export function applicability(value, sourceVersion) {
  if (typeof value !== 'string' || !sourceVersion) return value;
  const normalized = value.replace(/(?:官方公开资料|框架资料)\s+v\d+\.\d+\.\d+\s*[；;]?\s*/g, '').trim();
  const [entries, ...conditions] = normalized.split('；');
  const ids = entries.split(' / ');
  return ids.every(id => Object.hasOwn(entryNames, id)) ? [ids.map(id => entryNames[id]).join('、'), ...conditions].join('；') : normalized;
}
