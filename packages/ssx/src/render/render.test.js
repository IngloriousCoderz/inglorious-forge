import path from "node:path"
import { pathToFileURL } from "node:url"

import { createStore } from "@inglorious/store"
import { html } from "@inglorious/web"
import { describe, expect, it } from "vitest"

import { renderPage } from "."

const ROOT_DIR = path.join(import.meta.dirname, "..", "fixtures")
const PAGES_DIR = path.join(ROOT_DIR, "src", "pages")

const DEFAULT_OPTIONS = { stripLitMarkers: true }

describe("renderPage", () => {
  it("should render a static page fragment", async () => {
    const module = await import(pathToFileURL(path.join(PAGES_DIR, "index.js")))
    const page = { path: "/", moduleName: "index", module }

    const store = createStore({
      types: { Index: module.Index },
      updateMode: "manual",
    })
    store.update()

    const html = await renderPage(store, page, undefined, DEFAULT_OPTIONS)

    expect(html).toMatchSnapshot()
  })

  it("should render a page with entity", async () => {
    const module = await import(pathToFileURL(path.join(PAGES_DIR, "about.js")))
    const page = { path: "/about", moduleName: "about", module }
    const entity = { type: "About", name: "Us" }

    const store = createStore({
      types: { About: module.About },
      entities: { about: entity },
      updateMode: "manual",
    })

    const html = await renderPage(store, page, entity, DEFAULT_OPTIONS)

    expect(html).toMatchSnapshot()
  })

  it("should render a page with metadata", async () => {
    const module = await import(pathToFileURL(path.join(PAGES_DIR, "about.js")))
    const page = { path: "/about", moduleName: "about", module }
    const entity = { type: "About", name: "Us" }

    const store = createStore({
      types: { About: module.About },
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
      type: "Blog",
      name: "Antony",
      posts: [
        { id: 1, title: "First Post" },
        { id: 2, title: "Second Post" },
        { id: 3, title: "Third Post" },
      ],
    }

    const store = createStore({
      types: { Blog: module.Blog },
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
    const page = { path: "/posts/1", moduleName: "Post", module }
    const entity = {
      type: "Post",
      name: "Antony",
      post: {
        id: 1,
        title: "First Post",
        date: "2026-01-04",
        body: "Hello world!",
      },
    }

    const store = createStore({
      types: { Post: module.Post },
      entities: { post: entity },
      updateMode: "manual",
    })

    const html = await renderPage(store, page, entity, DEFAULT_OPTIONS)

    expect(html).toMatchSnapshot()
  })

  it("should set the document language from the page locale", async () => {
    const module = await import(pathToFileURL(path.join(PAGES_DIR, "about.js")))
    const page = { path: "/it/about", moduleName: "about", module }
    const entity = { type: "About", name: "Noi", locale: "it" }

    const store = createStore({
      types: { About: module.About },
      entities: { about: entity },
      updateMode: "manual",
    })
    store.update()

    const html = await renderPage(store, page, entity, {
      ...DEFAULT_OPTIONS,
      wrap: true,
      lang: "en",
    })

    expect(html).toContain(`<html lang="it" dir="ltr">`)
  })

  it("should prefer the language set in the page metadata", async () => {
    const About = { render: () => "" }
    const module = { About, metadata: { lang: "pt" } }
    const page = { path: "/it/about", moduleName: "about", module }
    const entity = { type: "About", locale: "it" }

    const store = createStore({
      types: { About },
      entities: { about: entity },
      updateMode: "manual",
    })
    store.update()

    const html = await renderPage(store, page, entity, {
      ...DEFAULT_OPTIONS,
      wrap: true,
      lang: "en",
    })

    expect(html).toContain(`<html lang="pt" dir="ltr">`)
  })

  it("should fall back to the site language and charset", async () => {
    const About = { render: () => "" }
    const page = { path: "/about", moduleName: "about", module: { About } }
    const entity = { type: "About" }

    const store = createStore({
      types: { About },
      entities: { about: entity },
      updateMode: "manual",
    })
    store.update()

    const html = await renderPage(store, page, entity, {
      ...DEFAULT_OPTIONS,
      wrap: true,
      lang: "it",
      charset: "ISO-8859-1",
    })

    expect(html).toContain(`<html lang="it" dir="ltr">`)
    expect(html).toContain(`<meta charset="ISO-8859-1" />`)
  })

  it("should write right-to-left languages right to left", async () => {
    const About = { render: () => "" }
    const page = { path: "/ar/about", moduleName: "about", module: { About } }
    const entity = { type: "About", locale: "ar" }

    const store = createStore({
      types: { About },
      entities: { about: entity },
      updateMode: "manual",
    })
    store.update()

    const html = await renderPage(store, page, entity, {
      ...DEFAULT_OPTIONS,
      wrap: true,
    })

    expect(html).toContain(`<html lang="ar" dir="rtl">`)
  })

  it("should render in the page's locale", async () => {
    let language = "en"
    const messages = { en: "Hello", it: "Ciao" }
    const I18n = {
      localeChange(entity, locale) {
        entity.locale = language = locale
      },
    }
    const Hello = { render: () => html`<p>${messages[language]}</p>` }
    const page = { path: "/it/hello", moduleName: "hello", module: { Hello } }
    const entity = { type: "Hello", locale: "it" }

    const store = createStore({
      types: { I18n, Hello },
      entities: { i18n: { type: "I18n", locale: "en" }, hello: entity },
    })

    const output = await renderPage(store, page, entity, DEFAULT_OPTIONS)

    expect(output).toContain("Ciao")
  })
})
