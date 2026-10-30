/**
 * @typedef {import('../../types/site.config').SiteConfig} SiteConfig
 */

const env = process.env.NODE_ENV

/**
 * @type {SiteConfig}
 */
export default {
  lang: "en",
  charset: "UTF-8",
  title: "My Awesome Site",

  meta: {
    description: "A site built with SSX",
    "og:type": "website",
    "og:site_name": "My Site",
    "twitter:card": "summary_large_image",
  },

  styles: ["/styles/reset.css", "/styles/theme.css"],

  ...(env === "production" && { scripts: ["./scripts/analytics.js"] }),

  layout: (body, options) => {
    const {
      lang = "en",
      dir = "ltr",
      head = "",
      prescripts = [],
      charset = "UTF-8",
      title = "",
      meta = {},
      styles = [],
      scripts = [],
      isDev,
    } = options

    return `
      <!DOCTYPE html>
      <html lang=${lang} dir=${dir}>
        <head>
          ${prescripts
            .map(
              (src) => `<script type="text/javascript" src="${src}"></script>`,
            )
            .join("\n")}
          <meta charset=${charset} />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>${title}</title>
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
          <header>
            <nav>
              <a href="/">Home</a> |
              <a href="/about">About</a> |
              <a href="/hello">Hello</a> |
              <a href="/blog">Blog</a> |
              <a href="/markdown">Markdown</a>
            </nav>
          </header>

          <main>
            <div id="root">${body}</div>
          </main>

          <footer>
            <p>&copy; 2026 My Site</p>
          </footer>

          ${isDev ? `<script type="module" src="/@vite/client"></script>` : ``}
          <script type="module" src="/main.js"></script>
          ${scripts
            .map((src) => `<script type="module" src="${src}"></script>`)
            .join("\n")}
        </body>
      </html>
    `
  },

  basePath: "/",
  rootDir: "src",
  outDir: "dist",
  publicDir: "public",
  favicon: "/favicon.ico",

  sitemap: {
    hostname: "https://myblog.com",
    filter: (page) => !["/admin", "/draft-*", "/test"].includes(page.pattern),
    defaults: {
      changefreq: "weekly",
      priority: 0.5,
    },
  },

  rss: {
    title: "My Blog",
    description: "Latest posts from my blog",
    link: "https://myblog.com",
    feedPath: "/feed.xml",
    language: "en",
    copyright: "© 2026 My Blog",
    maxItems: 20,
    filter: (page) =>
      page.path.startsWith("/posts/") || page.path === "/markdown",
  },

  redirects: [
    { from: "/old-path", to: "/new-path", status: 301 },
    { from: "/blog/*", to: "/posts/:splat", status: 301 },
  ],

  router: {
    trailingSlash: false,
    scrollBehavior: "smooth",
  },

  vite: {
    server: {
      port: 3000,
      open: true,
    },

    ssr: {
      noExternal: ["@inglorious/logo"],
    },
  },

  markdown: {
    theme: "atom-one-dark",
  },

  hooks: {
    beforeBuild: async (config) => {
      console.log(`Starting build on ${config.rootDir}...`)
    },
    afterBuild: async (result) => {
      console.log(`Built ${result.pages} pages`)
    },
    onPageBuild: async (page) => {
      console.log(`Built ${page.path}`)
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en", "it", "pt"],
  },
}
