/**
 * Keep actual operation/version boundaries intact. The current documentation
 * version is displayed separately from the preserved frontmatter.
 * @param {string | undefined} value
 * @param {string | undefined} sourceVersion
 */
export function applicability(value, sourceVersion) {
  if (typeof value !== 'string' || !sourceVersion) return value;
  return value.replace(/(?:官方公开资料|框架资料)\s+v\d+\.\d+\.\d+\s*[；;]?\s*/g, '').trim();
}
