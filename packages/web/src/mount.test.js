/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest"

const { renderSpy } = vi.hoisted(() => ({
  renderSpy: vi.fn(),
}))

vi.mock("lit-html", () => ({
  html: (strings, ...values) => ({ strings, values }),
  render: renderSpy,
}))

import { mount } from "./mount.js"

describe("mount", () => {
  let element
  let entity
  let types
  let api
  let listener
  let store
  let componentType

  beforeEach(() => {
    element = document.createElement("div")
    entity = {
      id: "dashboard-entity",
      type: "dashboard",
    }
    componentType = {
      render: vi.fn(() => "dashboard-template"),
    }
    types = {}
    listener = undefined

    api = {
      getEntity: vi.fn(() => entity),
      getType: vi.fn((typeName) => types[typeName]),
      setType: vi.fn((typeName, type) => {
        types[typeName] = type
      }),
    }

    store = {
      _api: api,
      subscribe: vi.fn((callback) => {
        listener = callback
        return vi.fn()
      }),
      notify: vi.fn((type) => {
        if (type === "init") {
          listener?.()
        }
      }),
    }

    renderSpy.mockReset()
  })

  it("lazily registers a missing type passed to api.render", async () => {
    await mount(
      store,
      (renderApi) =>
        renderApi.render("dashboard-entity", "dashboard", componentType),
      element,
    )

    expect(api.getType).toHaveBeenCalledWith("dashboard")
    expect(api.setType).toHaveBeenCalledWith("dashboard", componentType)
    expect(componentType.render).toHaveBeenCalledWith(
      entity,
      expect.objectContaining({
        getEntity: expect.any(Function),
        getType: expect.any(Function),
        setType: expect.any(Function),
        render: expect.any(Function),
      }),
    )
    expect(renderSpy).toHaveBeenCalledWith("dashboard-template", element)
  })

  it("does not re-register a type that already exists", async () => {
    types.dashboard = componentType

    await mount(
      store,
      (renderApi) =>
        renderApi.render("dashboard-entity", "dashboard", componentType),
      element,
    )

    expect(api.setType).not.toHaveBeenCalled()
    expect(componentType.render).toHaveBeenCalledWith(
      entity,
      expect.objectContaining({
        getEntity: expect.any(Function),
        getType: expect.any(Function),
        setType: expect.any(Function),
        render: expect.any(Function),
      }),
    )
    expect(renderSpy).toHaveBeenCalledWith("dashboard-template", element)
  })
})
