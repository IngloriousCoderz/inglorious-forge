import { escapeHTML } from "../utils/escape-html.js"

/**
 * Links stylesheets at the end of a page's `<head>`, marked so that running it
 * again with the same marker replaces them instead of adding more.
 *
 * @param {string} html - The page.
 * @param {string[]} hrefs - The stylesheets, in cascade order.
 * @param {string} marker - The attribute that marks the links this call owns.
 * @returns {string} The page with those stylesheets linked.
 */
export function insertStyleLinks(html, hrefs, marker) {
  const pattern = new RegExp(
    `\\s*<link rel="stylesheet" href="[^"]*" ${marker}>`,
    "g",
  )
  const unlinked = html.replace(pattern, "")
  if (!hrefs.length) return unlinked

  const links = hrefs
    .map(
      (href) => `<link rel="stylesheet" href="${escapeHTML(href)}" ${marker}>`,
    )
    .join("\n")
  return unlinked.replace("</head>", `${links}\n</head>`)
}
