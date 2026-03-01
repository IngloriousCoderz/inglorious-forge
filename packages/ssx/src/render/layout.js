/**
 * Default layout function for wrapping content in a full HTML document.
 *
 * @param {string} body - The body content HTML.
 * @param {Object} options - Layout options.
 * @param {string} [options.lang="en"] - Language attribute.
 * @param {string} [options.charset="UTF-8"] - Character set.
 * @param {string} [options.title=""] - Page title.
 * @param {Object} [options.meta={}] - Meta tags.
 * @param {string[]} [options.styles=[]] - Stylesheets.
 * @param {string} [options.head=""] - Additional head content.
 * @param {string[]} [options.scripts=[]] - Scripts.
 * @param {boolean} [options.isDev] - Whether in dev mode.
 * @returns {string} The full HTML document.
 */
export function layout(body, options) {
  const {
    lang = "en",
    prescripts = [],
    charset = "UTF-8",
    title = "",
    favicon = "",
    meta = {},
    styles = [],
    head = "",
    scripts = [],
    isDev,
  } = options

  return `<!DOCTYPE html>
    <html lang="${lang}">
      <head>
      ${prescripts
        .map((src) => `<script type="text/javascript" src="${src}"></script>`)
        .join("\n")}
        <meta charset="${charset}" />
        <title>${title}</title>
        <link rel="icon" type="image/x-icon" href="${favicon}">
        ${Object.entries(meta)
          .map(
            ([key, content]) =>
              `<meta ${key.includes(":") ? "property" : "name"}="${key}" content="${content}">`,
          )
          .join("\n")}
        ${styles
          .map((href) => `<link rel="stylesheet" href="${href}">`)
          .join("\n")}
        ${head}
      </head>
      <body>
        <div id="root">${body}</div>
        ${isDev ? `<script type="module" src="/@vite/client"></script>` : ``}
        <script type="module" src="/main.js"></script>
        ${scripts
          .map((src) => `<script type="module" src="${src}"></script>`)
          .join("\n")}
      </body>
    </html>`
}
