import { describe, expect, it, vi } from "vitest"

const { generateStore, renderPage } = vi.hoisted(() => {
  const generateStore = vi.fn()
  const renderPage = vi.fn()

  return { generateStore, renderPage }
})

vi.mock("../store/index.js", () => ({ generateStore }))
vi.mock("../render/index.js", () => ({ renderPage }))
vi.mock("../router/index.js", () => ({
  getPages: vi.fn(async () => [
    {
      path: "/",
      filePath: "page.js",
      moduleName: "page",
    },
  ]),
  matchRoute: vi.fn(() => true),
}))
vi.mock("../scripts/app.js", () => ({ generateApp: vi.fn(async () => "") }))
vi.mock("../dev/vite-config.js", () => ({ virtualFiles: new Map() }))

import { renderRequest as actualRenderRequest } from "./index.js"

describe("renderRequest", () => {
  it("creates a fresh store for each SSR request", async () => {
    const firstStore = {
      _api: { getEntities: vi.fn(() => [{ locale: "en" }]) },
    }
    const secondStore = {
      _api: { getEntities: vi.fn(() => [{ locale: "en" }]) },
    }

    generateStore.mockReset()
    generateStore
      .mockResolvedValueOnce(firstStore)
      .mockResolvedValueOnce(secondStore)
    renderPage.mockReset().mockResolvedValue("<html></html>")

    const loader = vi.fn(async () => ({
      load: vi.fn(),
      render: () => {},
    }))

    await actualRenderRequest("/", {
      rootDir: ".",
      options: {},
      loader,
    })
    await actualRenderRequest("/about", {
      rootDir: ".",
      options: {},
      loader,
    })

    expect(generateStore).toHaveBeenCalledTimes(2)
  })
})
