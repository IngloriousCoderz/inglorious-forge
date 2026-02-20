import path from "node:path"

import { describe, expect, it } from "vitest"

import { generateStore } from "../store"
import { generateApp } from "./app"

const ROOT_DIR = path.join(import.meta.dirname, "..", "__fixtures__")
const PAGES_DIR = path.join(ROOT_DIR, "src", "pages")

describe("generateApp", () => {
  it("should generate the app script for a static page", async () => {
    const page = {
      pattern: "/",
      path: "/",
      modulePath: "index.js",
      filePath: PAGES_DIR,
    }
    const store = await generateStore([page], { rootDir: ROOT_DIR })

    const app = generateApp(store, [page])

    expect(app).toMatchSnapshot()
  })

  it("should generate the app script for a page with an entity", async () => {
    const page = {
      pattern: "/about",
      path: "/about",
      modulePath: "about.js",
      filePath: path.join(PAGES_DIR, "about.js"),
    }
    const store = await generateStore([page], { rootDir: ROOT_DIR })

    const app = generateApp(store, [page])

    expect(app).toMatchSnapshot()
  })

  it("should generate the app script for a page that has metadata", async () => {
    const page = {
      pattern: "/blog",
      path: "/blog",
      modulePath: "blog.js",
      filePath: path.join(PAGES_DIR, "blog.js"),
    }
    const store = await generateStore([page], { rootDir: ROOT_DIR })

    const app = generateApp(store, [page])

    expect(app).toMatchSnapshot()
  })

  it("should generate the app script for a dynamic page", async () => {
    const page = {
      pattern: "/posts/:slug",
      path: "/posts/my-first-post",
      modulePath: "post.js",
      filePath: path.join(PAGES_DIR, "posts", "_slug.js"),
    }
    const store = await generateStore([page], { rootDir: ROOT_DIR })

    const app = generateApp(store, [page])

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
    const store = await generateStore([page], { rootDir: ROOT_DIR })

    const app = generateApp(store, localizedPages)

    expect(app).toContain(`"/hello": () => import("@/pages/hello.js")`)
    expect(app).toContain(`"/it/hello": () => import("@/pages/hello.js")`)
    expect(app).toContain(`"/pt/hello": () => import("@/pages/hello.js")`)
    expect(app).toContain(`const isDev = false`)
    expect(app).toContain(
      `import { getLocaleFromPath } from "@inglorious/ssx/i18n"`,
    )
    expect(app).toContain(`const systems = []`)
    expect(app).toContain(`routeChange(state, payload)`)
    expect(app).toContain(
      `entity.locale = getLocaleFromPath(payload.path, i18n)`,
    )
    expect(app).toContain(
      `const path = normalizeRoutePath(window.location.pathname)`,
    )
    expect(app).toContain(
      `const page = pages.find((page) => normalizeRoutePath(page.path) === path)`,
    )
  })
})
