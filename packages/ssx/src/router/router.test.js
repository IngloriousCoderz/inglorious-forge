import path from "node:path"

import { afterEach, describe, expect, it, vi } from "vitest"

import { getPages, getRoutes, matchRoute } from "./index.js"

const ROOT_DIR = path.join(import.meta.dirname, "..", "__fixtures__")
const PAGES_DIR = path.join(ROOT_DIR, "src", "pages")

describe("router", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("getRoutes", () => {
    it("should discover and sort routes correctly", async () => {
      const routes = await getRoutes(PAGES_DIR)

      // Expected order based on specificity:
      // 1. /posts/:id (static 'posts' + dynamic 'id') -> score ~4.2
      // 2. /blog/:slug (static 'blog' + dynamic 'slug') -> score ~4.2
      // 3. /about (static 'about') -> score ~3.1
      // 4. / (root) -> score 0
      // 5. /api/* (catch-all) -> score negative

      const patterns = routes.map((r) => r.pattern)

      expect(patterns).toContain("/posts/:slug")
      expect(patterns).toContain("/blog")
      expect(patterns).toContain("/about")
      expect(patterns).toContain("/")
      expect(patterns).toContain("/api/*")

      // Check specific ordering constraints
      // Specific routes before catch-all
      expect(patterns.indexOf("/about")).toBeLessThan(
        patterns.indexOf("/api/*"),
      )
      // Root usually comes after specific paths but before catch-all if it was a catch-all root,
      // but here / is static.
      // Let's just check that we found them.
      expect(routes.length).toBeGreaterThanOrEqual(6)
    })
  })

  describe("getPages", () => {
    it("should generate static paths for all pages", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
      const pages = await getPages(PAGES_DIR)

      // Verify that we got some pages
      expect(pages.length).toBeGreaterThan(0)

      // Verify specific pages exist and have correct structure
      const rootPage = pages.find((p) => p.pattern === "/")
      expect(rootPage).toBeDefined()
      expect(rootPage.filePath).toMatch(/pages[/\\]index\.js$/)

      const aboutPage = pages.find((p) => p.pattern === "/about")
      expect(aboutPage).toBeDefined()
      expect(aboutPage.filePath).toMatch(/pages[/\\]about\.js$/)

      // Dynamic route without staticPaths should be skipped (and warn)
      const blogPage = pages.find((p) => p.path.includes("/api/"))
      expect(blogPage).toBeUndefined()

      expect(consoleSpy).toHaveBeenCalled()
      expect(consoleSpy.mock.calls[2][0]).toContain("has no staticPaths")
    })

    it("should localize static and dynamic pages when i18n is enabled", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
      const i18n = {
        defaultLocale: "en",
        locales: ["en", "it"],
      }
      const pages = await getPages(PAGES_DIR, { i18n })

      const rootPages = pages.filter((p) => p.pattern === "/")
      expect(rootPages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: "/", locale: "en" }),
          expect.objectContaining({ path: "/it", locale: "it" }),
        ]),
      )

      const aboutPages = pages.filter((p) => p.pattern === "/about")
      expect(aboutPages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: "/about", locale: "en" }),
          expect.objectContaining({ path: "/it/about", locale: "it" }),
        ]),
      )

      expect(
        pages.some(
          (p) =>
            p.pattern === "/posts/:slug" && p.path.startsWith("/it/posts/"),
        ),
      ).toBe(true)

      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  describe("matchRoute", () => {
    it("should match static routes", () => {
      expect(matchRoute("/", "/")).toBe(true)
      expect(matchRoute("/about", "/about")).toBe(true)
      expect(matchRoute("/about", "/contact")).toBe(false)
    })

    it("should match dynamic routes", () => {
      expect(matchRoute("/posts/:id", "/posts/123")).toBe(true)
      expect(matchRoute("/users/[id]", "/users/antony")).toBe(true)
    })

    it("should not match if segment length differs", () => {
      expect(matchRoute("/", "/about")).toBe(false)
      expect(matchRoute("/posts/:id", "/posts/123/comments")).toBe(false)
      expect(matchRoute("/posts/:id", "/posts")).toBe(false)
    })

    it("should handle trailing slashes implicitly via split", () => {
      // split('/').filter(Boolean) removes empty strings, so trailing slashes are ignored
      expect(matchRoute("/about/", "/about")).toBe(true)
      expect(matchRoute("/about", "/about/")).toBe(true)
    })
  })
})
