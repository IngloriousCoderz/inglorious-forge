import { describe, expect, it, vi } from "vitest"

import { createGetPageOption } from "./page-options"

describe("createGetPageOption", () => {
  const mockStore = { _api: { someApi: true } }
  const mockEntity = { id: 1, title: "Entity Title" }

  it("should retrieve value from static metadata object", () => {
    const module = {
      metadata: {
        title: "Static Title",
        priority: 0.8,
      },
    }

    const getOption = createGetPageOption(mockStore, module, mockEntity)
    const defaults = { title: "Default", priority: 0.5, author: "Me" }

    expect(getOption("title", defaults)).toBe("Static Title")
    expect(getOption("priority", defaults)).toBe(0.8)
    expect(getOption("author", defaults)).toBe("Me")
  })

  it("should retrieve value from dynamic metadata function", () => {
    const module = {
      metadata: vi.fn((entity, api) => ({
        title: `Dynamic ${entity.title}`,
        apiAvailable: !!api,
      })),
    }

    const getOption = createGetPageOption(mockStore, module, mockEntity)
    const defaults = { title: "Default", apiAvailable: false }

    expect(module.metadata).toHaveBeenCalledWith(mockEntity, mockStore._api)
    expect(getOption("title", defaults)).toBe("Dynamic Entity Title")
    expect(getOption("apiAvailable", defaults)).toBe(true)
  })

  it("should use defaults when metadata is missing", () => {
    const module = {}

    const getOption = createGetPageOption(mockStore, module, mockEntity)
    const defaults = { title: "Default Title" }

    expect(getOption("title", defaults)).toBe("Default Title")
  })

  it("should use defaults when specific key is missing in metadata", () => {
    const module = { metadata: { other: "value" } }
    const getOption = createGetPageOption(mockStore, module, mockEntity)
    const defaults = { title: "Default Title" }

    expect(getOption("title", defaults)).toBe("Default Title")
  })
})
