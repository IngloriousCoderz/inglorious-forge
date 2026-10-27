// @vitest-environment node
// The server runs on Node, whose Request keeps cookies; a browser-like one
// drops them.
import { describe, expect, it, vi } from "vitest"

const { generateStore, renderPage } = vi.hoisted(() => ({
  generateStore: vi.fn(),
  renderPage: vi.fn(async () => "<html></html>"),
}))

vi.mock("../store/index.js", () => ({ generateStore }))
vi.mock("../render/index.js", () => ({ renderPage }))
vi.mock("../scripts/app.js", () => ({ generateApp: vi.fn(async () => "") }))
vi.mock("../dev/vite-config.js", () => ({ virtualFiles: new Map() }))

import { renderRequest } from "./index.js"

const pages = [
  {
    path: "/posts/new",
    pattern: "/posts/new",
    filePath: "new.js",
    moduleName: "newPost",
  },
  {
    path: "/posts/:id",
    pattern: "/posts/:id",
    isDynamic: true,
    filePath: "post.js",
    moduleName: "post",
  },
]

async function render(url, request) {
  const load = vi.fn()
  const entity = {}
  generateStore.mockResolvedValue({
    _api: { getEntities: () => [entity] },
  })
  const result = await renderRequest(url, {
    pages,
    request,
    loader: async () => ({ ssr: true, load }),
  })
  return { result, load, entity }
}

describe("renderRequest for server-rendered pages", () => {
  it("renders a dynamic page for any path its pattern matches, its params from the URL", async () => {
    const { result, load } = await render("/posts/42?ref=home")

    expect(result.page).toMatchObject({
      moduleName: "post",
      path: "/posts/42",
      params: { id: "42" },
    })
    expect(load).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ params: { id: "42" } }),
    )
  })

  it("prefers a page of its own path to a pattern", async () => {
    const { result } = await render("/posts/new")

    expect(result.page.moduleName).toBe("newPost")
  })

  it("gives load the request, for its headers and cookies", async () => {
    const request = new Request("http://localhost/posts/7", {
      headers: { cookie: "session=abc" },
    })

    const { load } = await render("/posts/7", request)

    const [, page] = load.mock.calls[0]
    expect(page.request.headers.get("cookie")).toBe("session=abc")
  })

  it("matches nothing for a path no page has", async () => {
    const { result } = await render("/about")

    expect(result).toBeNull()
  })
})
