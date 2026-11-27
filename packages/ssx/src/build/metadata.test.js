import { describe, expect, it, vi } from "vitest"

import { extractPageMetadata } from "./metadata.js"

describe("extractPageMetadata", () => {
  it("should handle invalid updatedAt gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const store = { _api: {} }
    const page = {
      path: "/test",
      module: { metadata: { updatedAt: "invalid-date" } },
    }
    const entity = {}

    const metadata = extractPageMetadata(store, page, entity)
    expect(metadata.lastmod).toBeDefined()
    expect(consoleSpy).toHaveBeenCalled()
  })

  it("should fall back on the sitemap's defaults", () => {
    const store = { _api: {} }
    const options = {
      sitemap: { hostname: "https://example.com", defaults: { priority: 0.8 } },
    }

    const fallback = extractPageMetadata(
      store,
      { path: "/a", module: {} },
      {},
      options,
    )
    const own = extractPageMetadata(
      store,
      { path: "/b", module: { metadata: { priority: 0.2 } } },
      {},
      options,
    )

    expect(fallback.priority).toBe(0.8)
    expect(fallback.changefreq).toBe("weekly")
    expect(own.priority).toBe(0.2)
  })
})
