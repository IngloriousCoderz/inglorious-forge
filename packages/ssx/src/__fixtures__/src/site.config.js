/**
 * @typedef {import('../../types/site.config').SiteConfig} SiteConfig
 */

const env = process.env.NODE_ENV

/**
 * @type {SiteConfig}
 */
export default {
  // Basic metadata
  lang: "en",
  charset: "UTF-8",
  title: "My Awesome Site",

  // Meta tags (applied to all pages unless overridden)
  meta: {
    description: "A site built with SSX",
    "og:type": "website",
    "og:site_name": "My Site",
    "twitter:card": "summary_large_image",
  },

  // Global assets
  styles: ["/styles/reset.css", "/styles/theme.css"],

  ...(env === "production" && { scripts: ["./scripts/analytics.js"] }),

  // Custom layout wrapper
  layout: (body, options) => {
    const {
      lang = "en",
      charset = "UTF-8",
      title = "",
      meta = {},
      styles = [],
      head = "",
      scripts = [],
      isDev,
    } = options

    return `
      <!DOCTYPE html>
      <html lang=${lang}>
        <head>
          <meta charset=${charset} />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>${title}</title>
          ${Object.entries(meta)
            .map(
              ([name, content]) => `<meta name="${name}" content="${content}">`,
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

  // Or simpler: just wrap the content
  // wrapper: (body) => html`
  //   <div class="site-wrapper">
  //     <header>...</header>
  //     ${body}
  //     <footer>...</footer>
  //   </div>
  // `,

  // Build options
  basePath: "/", // Base URL for the site
  rootDir: "src",
  outDir: "dist",
  publicDir: "public", // Static assets copied as-is
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

  // Router config (optional)
  router: {
    trailingSlash: false, // /about vs /about/
    scrollBehavior: "smooth", // smooth scroll on navigation
  },

  // Vite config passthrough
  vite: {
    // Dev server options
    server: {
      port: 3000,
      open: true, // Open browser on start
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
