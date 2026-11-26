import { escapeHTML } from "../utils/escape-html.js"

/**
 * Links stylesheets at the end of a page's `<head>`, marked so that running it
 * again with the same marker replaces them instead of adding more.
 *
 * @param {string} html - The page.
 * @param {Array<string | { href: string, attributes?: Record<string, string> }>} stylesheets -
 *   In cascade order: URLs, or URLs with attributes of their own for the link.
 * @param {string} marker - The attribute that marks the links this call owns.
 * @returns {string} The page with those stylesheets linked.
 */
export function insertStyleLinks(html, stylesheets, marker) {
  const pattern = new RegExp(
    `\\s*<link rel="stylesheet" href="[^"]*" ${marker}(?: [^>]*)?>`,
    "g",
  )
  const unlinked = html.replace(pattern, "")
  if (!stylesheets.length) return unlinked

  // A newline before each link, so removing them gives the page back as it was.
  const links = stylesheets
    .map((stylesheet) => `\n${renderLink(stylesheet, marker)}`)
    .join("")
  return unlinked.replace("</head>", `${links}</head>`)
}

function renderLink(stylesheet, marker) {
  const { href, attributes = {} } =
    typeof stylesheet === "string" ? { href: stylesheet } : stylesheet
  const extra = Object.entries(attributes)
    .map(([name, value]) => ` ${name}="${escapeHTML(value)}"`)
    .join("")
  return `<link rel="stylesheet" href="${escapeHTML(href)}" ${marker}${extra}>`
}
