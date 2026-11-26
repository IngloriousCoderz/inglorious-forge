/**
 * Default layout function for wrapping content in a full HTML document.
 *
 * @param {string} body - The body content HTML.
 * @param {Object} options - Layout options.
 * @param {string} [options.lang="en"] - Language attribute.
 * @param {"ltr" | "rtl"} [options.dir="ltr"] - Text direction attribute.
 * @param {string} [options.charset="UTF-8"] - Character set.
 * @param {string} [options.title=""] - Page title, as plain text.
 * @param {string} [options.favicon=""] - Favicon URL; without one, no icon link is rendered.
 * @param {Object} [options.meta={}] - Meta tags, with plain-text contents.
 * @param {string[]} [options.styles=[]] - Stylesheets.
 * @param {string} [options.head=""] - Additional head content, as HTML.
 * @param {string[]} [options.scripts=[]] - Scripts.
 * @param {boolean} [options.isDev] - Whether in dev mode.
 * @returns {string} The full HTML document.
 */
export function layout(body, options) {
  const {
    lang = "en",
    dir = "ltr",
    head = "",
    prescripts = [],
    charset = "UTF-8",
    title = "",
    favicon = "",
    meta = {},
    styles = [],
    scripts = [],
    isDev,
  } = options

  // Titles and meta contents are plain text, as the client sets them when it
  // navigates: escape them here, or a "&" or a quote breaks the markup.
  return `<!DOCTYPE html>
    <html lang="${escapeHTML(lang)}" dir="${escapeHTML(dir)}">
      <head>
      ${prescripts
        .map(
          (src) =>
            `<script type="text/javascript" src="${escapeHTML(src)}"></script>`,
        )
        .join("\n")}
        <meta charset="${escapeHTML(charset)}" />
        <title>${escapeHTML(title)}</title>
        ${favicon ? `<link rel="icon" href="${escapeHTML(favicon)}">` : ""}
        ${Object.entries(meta)
          .map(
            ([key, content]) =>
              `<meta ${key.includes(":") ? "property" : "name"}="${escapeHTML(key)}" content="${escapeHTML(content)}">`,
          )
          .join("\n")}
        ${styles
          .map((href) => `<link rel="stylesheet" href="${escapeHTML(href)}">`)
          .join("\n")}
        ${head}
      </head>
      <body>
        <div id="root">${body}</div>
        ${isDev ? `<script type="module" src="/@vite/client"></script>` : ``}
        <script type="module" src="/main.js"></script>
        ${scripts
          .map(
            (src) => `<script type="module" src="${escapeHTML(src)}"></script>`,
          )
          .join("\n")}
      </body>
    </html>`
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
