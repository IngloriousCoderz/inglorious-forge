import type { SiteConfig } from "../types/index"

export const config: SiteConfig = {
  title: "My Site",
  i18n: { defaultLocale: "en", locales: ["en", "it"] },
  layout: (body, { lang, title }) =>
    `<html lang="${lang}"><title>${title}</title>${body}</html>`,
  sitemap: {
    hostname: "https://example.com",
    filter: (page) => !page.path.startsWith("/admin"),
    defaults: { priority: 0.5 },
  },
  rss: {
    link: "https://example.com",
    filter: (page) => page.metadata.category === "posts",
  },
  hooks: {
    afterBuild: ({ changed, skipped }) => {
      console.log(changed + skipped)
    },
  },
}

export const wrong: SiteConfig = {
  // @ts-expect-error - not an option
  basePath: "/",
}

export const wrongResult: SiteConfig = {
  hooks: {
    // @ts-expect-error - the result has no pages
    afterBuild: (result) => console.log(result.pages),
  },
}
