import type { UserConfig } from "vite"

/** What the build reads from a page to list it in the sitemap and the feed. */
export interface PageMetadata {
  /** The page's path, such as `/posts/hello`. */
  path: string
  /** The page's full address: the sitemap's `hostname` and the path. */
  loc: string
  /** The day of `updatedAt`, or of the build, as `YYYY-MM-DD`. */
  lastmod: string
  title: string
  description?: string
  meta: Record<string, string>
  pubDate: string
  author: string
  category: string
  changefreq: string
  priority: number
  updatedAt: string
}

/** A page the build generated, as `sitemap.filter` and `rss.filter` receive it. */
export interface BuiltPage {
  /** The page's path, such as `/posts/hello`. */
  path: string
  /** The route it comes from, such as `/posts/:slug`. */
  pattern: string
  /** The route's parameters for this path, such as `{ slug: "hello" }`. */
  params: Record<string, string>
  /** The page's locale, when the site has `i18n`. */
  locale?: string
  /** The name of the page's entity type. */
  moduleName: string
  /** The page's source file. */
  filePath: string
  metadata: PageMetadata
  /** The page's HTML, when this build rendered it; a page an incremental build skipped has none. */
  html?: string
}

/** What `build` returns, and `hooks.afterBuild` receives. */
export interface BuildResult {
  /** How many pages this build rendered. */
  changed: number
  /** How many pages an incremental build kept as they were. */
  skipped: number
}

/** What a layout receives: the site's options, merged with the page's own. */
export interface LayoutOptions {
  lang: string
  dir: "ltr" | "rtl"
  charset: string
  title: string
  favicon: string
  meta: Record<string, string>
  styles: string[]
  head: string
  scripts: string[]
  prescripts?: string[]
  isDev?: boolean
}

export interface SiteConfig {
  /** The `lang` of `<html>`, unless the page or its locale says otherwise. */
  lang?: string
  /** The `dir` of `<html>`. Defaults to the language's direction. */
  dir?: "ltr" | "rtl"
  /** Defaults to `"UTF-8"`. */
  charset?: string
  /** The title of a page that sets none. */
  title?: string
  /** Meta tags by name (or property, for names with a `:`), merged under each page's. */
  meta?: Record<string, string>
  /** The favicon's URL. */
  favicon?: string

  /** Stylesheets on every page, before each page's own. */
  styles?: string[]
  /** Module scripts on every page, before each page's own. */
  scripts?: string[]
  /** Classic scripts first in `<head>`, before any other script, such as a cookie consent. */
  prescripts?: string[]
  /** HTML added to the end of `<head>` on pages that add none. */
  head?: string
  /** Wraps each page's HTML in a document, in place of the default one. */
  layout?: (body: string, options: LayoutOptions) => string

  /** The project's root, from `--root`. Defaults to the current folder. */
  rootDir?: string
  /** Defaults to `"dist"`. */
  outDir?: string
  /** Defaults to `"public"`. */
  publicDir?: string
  /** Whether a build renders only the pages that changed. Defaults to `true`. */
  incremental?: boolean

  /** Locales to generate each page in; the default one keeps unprefixed paths. */
  i18n?: {
    defaultLocale: string
    locales: string[]
  }

  /** Passed to Vite. */
  vite?: UserConfig

  markdown?: {
    /** A highlight.js theme. Defaults to `"github-dark"`. */
    theme?: string
  }

  /** Writes `sitemap.xml` when `hostname` is set. */
  sitemap?: {
    /** The site's address, such as `https://example.com`. */
    hostname: string
    filter?: (page: BuiltPage) => boolean
    /** What pages that set no `changefreq` or `priority` get. */
    defaults?: {
      changefreq?: string
      priority?: number
    }
  }

  /** Writes a feed of the pages, newest `pubDate` first, when `link` is set. */
  rss?: {
    /** Defaults to `"RSS Feed"`. */
    title?: string
    /** Defaults to `"Latest Posts"`. */
    description?: string
    /** The site's address, such as `https://example.com`. */
    link: string
    /** Defaults to `"/feed.xml"`. */
    feedPath?: string
    /** Defaults to `"en"`. */
    language?: string
    copyright?: string
    /** Defaults to 50. */
    maxItems?: number
    filter?: (page: BuiltPage) => boolean
  }

  hooks?: {
    /** Runs before anything is built, with the configuration the build uses. */
    beforeBuild?: (config: SiteConfig) => Promise<void> | void
    /** Runs once the build is done. */
    afterBuild?: (result: BuildResult) => Promise<void> | void
  }
}
