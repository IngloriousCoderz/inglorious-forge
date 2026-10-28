import path from "node:path"

import { describe, expect, it } from "vitest"

import { generateApp } from "./app"

const ROOT_DIR = path.join(import.meta.dirname, "..", "fixtures")
const PAGES_DIR = path.join(ROOT_DIR, "src", "pages")

describe("generateApp", () => {
  it("should generate the app script for a static page", async () => {
    const page = {
      pattern: "/",
      path: "/",
      modulePath: "index.js",
      moduleName: "Index",
      filePath: PAGES_DIR,
    }

    const app = await generateApp([page])

    expect(app).toMatchSnapshot()
  })

  it("should generate the app script for a page with an entity", async () => {
    const page = {
      pattern: "/about",
      path: "/about",
      modulePath: "about.js",
      moduleName: "About",
      filePath: path.join(PAGES_DIR, "about.js"),
    }

    const app = await generateApp([page])

    expect(app).toMatchSnapshot()
  })

  it("should generate the app script for a page that has metadata", async () => {
    const page = {
      pattern: "/blog",
      path: "/blog",
      modulePath: "blog.js",
      moduleName: "Blog",
      filePath: path.join(PAGES_DIR, "blog.js"),
    }

    const app = await generateApp([page])

    expect(app).toMatchSnapshot()
  })

  it("should generate the app script for a dynamic page", async () => {
    const page = {
      pattern: "/posts/:slug",
      path: "/posts/my-first-post",
      modulePath: "post.js",
      moduleName: "Post",
      filePath: path.join(PAGES_DIR, "posts", "_slug.js"),
    }

    const app = await generateApp([page])

    expect(app).toMatchSnapshot()
  })

  it("should include localized client routes when i18n pages are provided", async () => {
    const page = {
      pattern: "/hello",
      path: "/hello",
      modulePath: "hello.js",
      filePath: path.join(PAGES_DIR, "hello.js"),
      moduleName: "hello",
      locale: "en",
    }
    const localizedPages = [
      page,
      { ...page, path: "/it/hello", locale: "it" },
      { ...page, path: "/pt/hello", locale: "pt" },
    ]

    const app = await generateApp(localizedPages)

    expect(app).toContain(
      `"/hello": loadPage("hello", () => import("@/pages/hello.js"))`,
    )
    expect(app).toContain(
      `"/it/hello": loadPage("hello", () => import("@/pages/hello.js"))`,
    )
    expect(app).toContain(
      `"/pt/hello": loadPage("hello", () => import("@/pages/hello.js"))`,
    )
    expect(app).toContain(`const isDev = false`)
    expect(app).toContain(
      `import { getLocaleFromPath, syncPageHead, waitForLocale } from "@inglorious/ssx/client"`,
    )
    expect(app).toContain(
      `await waitForLocale(store, getLocaleFromPath(path, i18n))`,
    )
    expect(app).toContain(`const systems = []`)
    expect(app).toContain(`routeChange(state, payload, api)`)
    expect(app).toContain(
      `const locale = getLocaleFromPath(payload.path, i18n)`,
    )
    expect(app).toContain(`if (entity) entity.locale = locale`)
    expect(app).toContain(`api.notify("#i18n:localeChange", locale)`)
    expect(app).not.toContain(`type: "I18n"`)
    expect(app).toContain(
      `const path = normalizeRoutePath(window.location.pathname)`,
    )
    // Its own path first, then a server-rendered page's pattern.
    expect(app).toContain(
      `pages.find((page) => normalizeRoutePath(page.path) === path) ??`,
    )
    expect(app).toContain(
      `pages.find((page) => matchesPattern(page.path, path))`,
    )
  })

  it("should sync the page head with the site defaults as fallback", async () => {
    const page = {
      pattern: "/about",
      path: "/about",
      modulePath: "about.js",
      filePath: path.join(PAGES_DIR, "about.js"),
      moduleName: "About",
    }

    const app = await generateApp([page], {
      title: "My Site",
      lang: "en",
      meta: { description: "A site" },
    })

    expect(app).toContain(
      `"/about": loadPage("About", () => import("@/pages/about.js"))`,
    )
    expect(app).toContain(
      `const getPageName = syncPageHead(store, modules, {"title":"My Site","lang":"en","meta":{"description":"A site"}})`,
    )
    expect(app).toContain(`}, root, { getPageName })`)
  })
})
