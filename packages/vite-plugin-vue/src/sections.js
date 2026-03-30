/**
 * Extract the template and script sections from a Vue single-file component.
 *
 * @param {string} code - Vue file source.
 * @returns {{ template: string | null, script: string | null, scriptLang: string | null }} Parsed sections.
 */
export function extractSections(code) {
  const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/)
  const scriptMatch = code.match(
    /<script(?:\s+lang="(ts|typescript)")?\s*>([\s\S]*?)<\/script>/,
  )

  return {
    template: templateMatch ? templateMatch[1].trim() || "" : null,
    script: scriptMatch ? scriptMatch[2].trim() : null,
    scriptLang: scriptMatch ? scriptMatch[1] || "js" : null,
  }
}
