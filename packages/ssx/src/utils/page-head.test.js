import { createStore } from "@inglorious/store"
import { beforeEach, describe, expect, it } from "vitest"

import { syncPageHead } from "./page-head"

describe("syncPageHead", () => {
  const Index = { render: () => "" }
  const About = {
    setLocale(entity, locale) {
      entity.locale = locale
    },
    render: () => "",
  }
  const Hello = { render: () => "" }
  const Post = {
    dataFetchSuccess(entity, post) {
      entity.post = post
    },
    render: () => "",
  }

  const modules = {
    Index: { Index },
    About: {
      About,
      metadata: { title: "About", meta: { description: "About us" } },
    },
    Hello: {
      Hello,
      metadata: {
        title: "Ciao",
        lang: "it",
        meta: { "og:title": "Ciao", author: "Me" },
      },
    },
    Post: { Post, metadata: (entity) => ({ title: entity.post.title }) },
  }

  const Router = {
    navigate(entity, { route, path }) {
      entity.route = route
      entity.path = path
    },
  }

  const site = {
    title: "My Site",
    lang: "en",
    meta: { description: "A site", "og:type": "website" },
  }

  const createTestStore = (route, path) => {
    window.history.replaceState(null, "", path)
    return createStore({
      types: { Router, Index, About, Hello, Post },
      entities: {
        router: { type: "Router", route, path },
        index: { type: "Index" },
        about: { type: "About" },
        hello: { type: "Hello" },
        post: { type: "Post" },
      },
    })
  }

  // Navigates the way the router does: the history entry first, then the state change.
  const navigate = (store, route, path) => {
    window.history.pushState(null, "", path)
    store.notify("#router:navigate", { route, path })
    store.update()
  }

  const getMeta = (attribute, name) =>
    [...document.head.querySelectorAll("meta")]
      .find((meta) => meta.getAttribute(attribute) === name)
      ?.getAttribute("content")

  beforeEach(() => {
    document.head.innerHTML = `
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width">
      <meta name="description" content="A site">
      <meta property="og:type" content="website">`
    document.title = "Landing"
    document.documentElement.lang = "en"
    document.body.innerHTML = `<a href="/about">About</a>`
  })

  it("should leave the server-rendered head of the landing page alone", () => {
    const store = createTestStore("about", "/about")

    syncPageHead(store, modules, site)

    expect(document.title).toBe("Landing")
    expect(getMeta("name", "description")).toBe("A site")
  })

  it("should apply the title, lang and meta of the page navigated to", () => {
    const store = createTestStore("index", "/")
    syncPageHead(store, modules, site)

    navigate(store, "hello", "/hello")

    expect(document.title).toBe("Ciao")
    expect(document.documentElement.lang).toBe("it")
    expect(getMeta("property", "og:title")).toBe("Ciao")
    expect(getMeta("name", "author")).toBe("Me")
    expect(getMeta("name", "description")).toBe("A site")
    expect(getMeta("property", "og:type")).toBe("website")
  })

  it("should let page meta override the site meta", () => {
    const store = createTestStore("index", "/")
    syncPageHead(store, modules, site)

    navigate(store, "about", "/about")

    expect(getMeta("name", "description")).toBe("About us")
  })

  it("should fall back to the site defaults and drop the previous page's meta", () => {
    const store = createTestStore("index", "/")
    syncPageHead(store, modules, site)
    navigate(store, "hello", "/hello")

    navigate(store, "index", "/")

    expect(document.title).toBe("My Site")
    expect(document.documentElement.lang).toBe("en")
    expect(getMeta("property", "og:title")).toBeUndefined()
    expect(getMeta("name", "author")).toBeUndefined()
    expect(getMeta("name", "description")).toBe("A site")
  })

  it("should not touch meta tags the layout writes on its own", () => {
    const store = createTestStore("index", "/")
    syncPageHead(store, modules, site)

    navigate(store, "hello", "/hello")

    expect(getMeta("name", "viewport")).toBe("width=device-width")
    expect(document.head.querySelector("meta[charset]")).not.toBeNull()
  })

  it("should return the title of the current page, for mount to announce", () => {
    const store = createTestStore("index", "/")
    const getPageName = syncPageHead(store, modules, site)

    expect(getPageName()).toBe("My Site")

    navigate(store, "about", "/about")

    expect(getPageName()).toBe("About")
  })

  it("should wait for the data a computed title needs", () => {
    const store = createTestStore("index", "/")
    const getPageName = syncPageHead(store, modules, site)

    navigate(store, "post", "/posts/hello")

    expect(document.title).toBe("Landing")
    expect(getPageName()).toBeNull()

    store.notify("#post:dataFetchSuccess", { title: "Hello" })
    store.update()

    expect(document.title).toBe("Hello")
    expect(getPageName()).toBe("Hello")
  })

  it("should set the direction the language is written in", () => {
    const store = createTestStore("index", "/")
    syncPageHead(store, modules, site)

    store.notify("#about:setLocale", "ar")
    navigate(store, "about", "/ar/about")
    expect(document.documentElement.dir).toBe("rtl")

    navigate(store, "index", "/")
    expect(document.documentElement.dir).toBe("ltr")
  })

  it("should take the language from the page locale", () => {
    const store = createTestStore("index", "/")
    syncPageHead(store, modules, site)

    store.notify("#about:setLocale", "it")
    navigate(store, "about", "/it/about")

    expect(document.documentElement.lang).toBe("it")
  })

  it("should leave the head alone for a page that is not loaded yet", () => {
    const store = createTestStore("index", "/")
    syncPageHead(store, {}, site)

    navigate(store, "about", "/about")

    expect(document.title).toBe("Landing")
  })
})
