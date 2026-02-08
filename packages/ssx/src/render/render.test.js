import path from "node:path"
import { pathToFileURL } from "node:url"

import { createStore } from "@inglorious/web"
import { describe, expect, it } from "vitest"

import { renderPage } from "."

const ROOT_DIR = path.join(import.meta.dirname, "..", "__fixtures__")
const PAGES_DIR = path.join(ROOT_DIR, "src", "pages")

const DEFAULT_OPTIONS = { stripLitMarkers: true }

describe("renderPage", () => {
  it("should render a static page fragment", async () => {
    const module = await import(pathToFileURL(path.join(PAGES_DIR, "index.js")))
    const page = { path: "/", moduleName: "index", module }

    const store = createStore({
      types: { index: module.index },
      updateMode: "manual",
    })
    store.update()

    const html = await renderPage(store, page, undefined, DEFAULT_OPTIONS)

    expect(html).toMatchSnapshot()
  })

  it("should render a page with entity", async () => {
    const module = await import(pathToFileURL(path.join(PAGES_DIR, "about.js")))
    const page = { path: "/about", moduleName: "about", module }
    const entity = { type: "about", name: "Us" }

    const store = createStore({
      types: { about: module.about },
      entities: { about: entity },
      updateMode: "manual",
    })

    const html = await renderPage(store, page, entity, DEFAULT_OPTIONS)

    expect(html).toMatchSnapshot()
  })

  it("should render a page with metadata", async () => {
    const module = await import(pathToFileURL(path.join(PAGES_DIR, "about.js")))
    const page = { path: "/about", moduleName: "about", module }
    const entity = { type: "about", name: "Us" }

    const store = createStore({
      types: { about: module.about },
      entities: { about: entity },
      updateMode: "manual",
    })

    const html = await renderPage(store, page, module, {
      ...DEFAULT_OPTIONS,
      wrap: true,
    })

    expect(html).toMatchSnapshot()
  })

  it("should render a page with pre-fetched data", async () => {
    const module = await import(pathToFileURL(path.join(PAGES_DIR, "blog.js")))
    const page = { path: "/blog", moduleName: "blog", module }
    const entity = {
      type: "blog",
      name: "Antony",
      posts: [
        { id: 1, title: "First Post" },
        { id: 2, title: "Second Post" },
        { id: 3, title: "Third Post" },
      ],
    }

    const store = createStore({
      types: { blog: module.blog },
      entities: { blog: entity },
      updateMode: "manual",
    })

    const html = await renderPage(store, page, module, DEFAULT_OPTIONS)

    expect(html).toMatchSnapshot()
  })

  it("should render a dynamic page", async () => {
    const module = await import(
      pathToFileURL(path.join(PAGES_DIR, "posts", "_slug.js"))
    )
    const page = { path: "/posts/1", moduleName: "post", module }
    const entity = {
      type: "blog",
      name: "Antony",
      post: {
        id: 1,
        title: "First Post",
        date: "2026-01-04",
        body: "Hello world!",
      },
    }

    const store = createStore({
      types: { blog: module.post },
      entities: { post: entity },
      updateMode: "manual",
    })

    const html = await renderPage(store, page, module, DEFAULT_OPTIONS)

    expect(html).toMatchSnapshot()
  })
})
