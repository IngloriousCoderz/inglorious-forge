const TEMPLATE_CONTENT_GROUP = 1
const SCRIPT_CONTENT_GROUP = 2
const SCRIPT_LANG_GROUP = 1

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
    template: templateMatch
      ? templateMatch[TEMPLATE_CONTENT_GROUP].trim() || ""
      : null,
    script: scriptMatch ? scriptMatch[SCRIPT_CONTENT_GROUP].trim() : null,
    scriptLang: scriptMatch ? scriptMatch[SCRIPT_LANG_GROUP] || "js" : null,
  }
}
