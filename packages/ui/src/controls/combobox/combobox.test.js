import { createStore } from "@inglorious/store"
import { mount } from "@inglorious/web"
import { createMockApi, render } from "@inglorious/web/test"
import { afterEach, describe, expect, it } from "vitest"

import { Combobox } from "."

describe("combobox", () => {
  it("renders control with selected value", () => {
    const entity = {
      id: "sel",
      type: "select",
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
      selectedValue: "b",
    }
    const api = createMockApi({ [entity.id]: entity })
    api.getType = () => Combobox
    const container = document.createElement("div")

    render(Combobox.render(entity, api), container)

    expect(container.querySelector(".iw-combobox-value").textContent).toBe("B")
  })

  it("renders multi tags", () => {
    const entity = {
      id: "sel",
      type: "select",
      isMulti: true,
      selectedValue: ["a", "b"],
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
    }
    const api = createMockApi({ [entity.id]: entity })
    api.getType = () => Combobox
    const container = document.createElement("div")

    render(Combobox.render(entity, api), container)

    expect(
      container.querySelectorAll(".iw-combobox-multi-value-tag").length,
    ).toBe(2)
    expect(container.querySelectorAll(".iw-chip").length).toBe(2)
    expect(
      container
        .querySelector(".iw-chip")
        .classList.contains("iw-chip-shape-rounded"),
    ).toBe(true)
  })

  it("removes a multi tag through chip remove action", () => {
    const entity = {
      id: "sel",
      type: "select",
      isMulti: true,
      selectedValue: ["a"],
      options: [{ label: "A", value: "a" }],
    }
    const api = createMockApi({ [entity.id]: entity })
    api.getType = () => Combobox
    const container = document.createElement("div")

    render(Combobox.render(entity, api), container)

    container.querySelector(".iw-chip-remove").click()

    expect(api.getEvents()).toEqual([
      {
        type: "#sel:optionSelect",
        payload: { label: "A", value: "a" },
      },
    ])
  })

  it("dispatches toggle event from control click", () => {
    const entity = { id: "sel", type: "select", options: [] }
    const api = createMockApi({ [entity.id]: entity })
    api.getType = () => Combobox
    const container = document.createElement("div")

    render(Combobox.render(entity, api), container)

    container.querySelector(".iw-combobox-control").click()

    expect(api.getEvents()).toEqual([{ type: "#sel:toggle" }])
  })

  it("select handlers support multi selection", () => {
    const entity = {
      id: "sel",
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
      isMulti: true,
    }

    Combobox.create(entity)
    Combobox.optionSelect(entity, { label: "A", value: "a" })
    Combobox.optionSelect(entity, { label: "B", value: "b" })

    expect(entity.selectedValue).toEqual(["a", "b"])

    Combobox.optionSelect(entity, { label: "A", value: "a" })
    expect(entity.selectedValue).toEqual(["b"])
  })
})

// Exercises the real entity/event loop, because the outside-click listener is
// registered from a ref callback during a re-render and torn down on unmount —
// none of which the plain render() helper above can reproduce.
describe("combobox outside click (store integration)", () => {
  const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

  // jsdom has no real input pipeline, so pointer input is simulated by
  // dispatching the pointer events a browser would fire for a tap.
  const pointerdown = ({ pointerType = "mouse" } = {}) =>
    new PointerEvent("pointerdown", {
      bubbles: true,
      cancelable: true,
      pointerType,
      button: 0,
      isPrimary: true,
    })

  function mountCombobox(options, overrides = {}) {
    const store = createStore({
      types: { Combobox },
      entities: {
        favorite: {
          id: "favorite",
          type: "Combobox",
          isSearchable: true,
          isMulti: false,
          isClearable: true,
          options,
          ...overrides,
        },
      },
    })

    const container = document.createElement("div")
    document.body.appendChild(container)
    mount(store, (api) => api.render("favorite"), container)

    return {
      store,
      container,
      entity: () => store._api.getEntity("favorite"),
      control: () => container.querySelector(".iw-combobox-control"),
      open: () => container.querySelector(".iw-combobox-control").click(),
      options: () =>
        container.querySelectorAll(".iw-combobox-dropdown-options-option"),
      dropdown: () => container.querySelector(".iw-combobox-dropdown"),
    }
  }

  const regions = [
    { label: "Lazio", value: "Lazio" },
    { label: "Lombardia", value: "Lombardia" },
  ]

  // jsdom reports no pointer capabilities, so `(hover: hover) and
  // (pointer: fine)` is stubbed to model a mouse or a finger.
  const originalMatchMedia = window.matchMedia
  const stubMatchMedia = (fine) => {
    window.matchMedia = (query) => ({
      matches: query.includes("pointer: fine") ? fine : !fine,
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      onchange: null,
      dispatchEvent: () => false,
    })
  }
  const restoreMatchMedia = () => {
    window.matchMedia = originalMatchMedia
  }

  afterEach(() => {
    document.body.innerHTML = ""
    restoreMatchMedia()
  })

  it("focuses the search field on a fine pointer so typing works", async () => {
    stubMatchMedia(true)
    const ui = mountCombobox(regions)

    ui.open()
    await tick()

    const search = ui.container.querySelector(".iw-combobox-dropdown-search")
    expect(ui.entity().isSearchable).toBe(true)
    expect(search).not.toBeNull()
    expect(document.activeElement).toBe(search)
  })

  it("leaves the search field unfocused on a coarse pointer", async () => {
    // A touch device would raise the on-screen keyboard over the option list.
    stubMatchMedia(false)
    const ui = mountCombobox(regions)

    ui.open()
    await tick()

    const search = ui.container.querySelector(".iw-combobox-dropdown-search")
    expect(search).not.toBeNull()
    expect(document.activeElement).not.toBe(search)
    // The dropdown still opens and the options are still reachable.
    expect(ui.entity().isOpen).toBe(true)
    expect(ui.options().length).toBeGreaterThan(0)
  })

  it("opens on the first click", async () => {
    const ui = mountCombobox(regions)

    ui.open()
    await tick()

    expect(ui.entity().isOpen).toBe(true)
    expect(ui.dropdown()).not.toBeNull()
  })

  it("closes when interacting outside the combobox", async () => {
    const ui = mountCombobox(regions)

    ui.open()
    await tick()

    const outside = document.createElement("button")
    document.body.appendChild(outside)
    outside.dispatchEvent(pointerdown())
    await tick()

    expect(ui.entity().isOpen).toBe(false)
  })

  it("opens on touch even when the browser never sends a click", async () => {
    const ui = mountCombobox(regions)

    // Mobile only synthesises `click` when the tap does not turn into a scroll
    // gesture, so opening must not depend on it.
    ui.control().dispatchEvent(pointerdown({ pointerType: "touch" }))
    await tick()

    expect(ui.entity().isOpen).toBe(true)
  })

  it("does not toggle twice when a tap is followed by an emulated click", async () => {
    const ui = mountCombobox(regions)

    ui.control().dispatchEvent(pointerdown({ pointerType: "touch" }))
    await tick()
    expect(ui.entity().isOpen).toBe(true)

    ui.control().click()
    await tick()

    expect(ui.entity().isOpen).toBe(true)
  })

  it("still toggles on a mouse click", async () => {
    const ui = mountCombobox(regions)

    // A mouse press must not go through the pointerdown path.
    ui.control().dispatchEvent(pointerdown({ pointerType: "mouse" }))
    ui.control().click()
    await tick()

    expect(ui.entity().isOpen).toBe(true)
  })

  it("reopens after a touch selection that drops the option from the list", async () => {
    const ui = mountCombobox(regions)

    ui.open()
    await tick()

    ui.store._api.notify("#favorite:optionsSet", [regions[1]])
    ui.options()[0].dispatchEvent(pointerdown({ pointerType: "touch" }))
    ui.options()[0].click()
    await tick()

    expect(ui.entity().isOpen).toBe(false)

    // The emulated click for the tap is never delivered by the browser.
    ui.control().dispatchEvent(pointerdown({ pointerType: "touch" }))
    await tick()

    expect(ui.entity().isOpen).toBe(true)
  })

  it("closes on an outside touch and leaves no armed listener", async () => {
    const ui = mountCombobox(regions)

    ui.control().dispatchEvent(pointerdown({ pointerType: "touch" }))
    await tick()

    const outside = document.createElement("button")
    document.body.appendChild(outside)
    outside.dispatchEvent(pointerdown({ pointerType: "touch" }))
    await tick()

    expect(ui.entity().isOpen).toBe(false)

    ui.control().dispatchEvent(pointerdown({ pointerType: "touch" }))
    await tick()

    expect(ui.entity().isOpen).toBe(true)
  })

  it("does not open when the clear button is pressed", async () => {
    const ui = mountCombobox(regions, { selectedValue: "Lazio" })
    await tick()

    const clear = ui.container.querySelector(".iw-combobox-clear")
    expect(clear).not.toBeNull()

    clear.dispatchEvent(pointerdown({ pointerType: "touch" }))
    clear.click()
    await tick()

    expect(ui.entity().isOpen).toBe(false)
  })

  it("does not close when clicking the control while already open", async () => {
    const ui = mountCombobox(regions)

    ui.open()
    await tick()
    // The click that opened it also reaches the document listener.
    expect(ui.entity().isOpen).toBe(true)
  })

  it("reopens after selecting an option that is then dropped from the list", async () => {
    const ui = mountCombobox(regions)

    ui.open()
    await tick()

    // vaitu-fe replaces the option list on selection, removing the picked node
    // while that same click is still bubbling towards the document.
    ui.store._api.notify("#favorite:optionsSet", [regions[1]])
    ui.options()[0].click()
    await tick()

    expect(ui.entity().isOpen).toBe(false)

    ui.open()
    await tick()

    expect(ui.entity().isOpen).toBe(true)
    expect(ui.dropdown()).not.toBeNull()
  })

  it("keeps reopening across repeated selections", async () => {
    const ui = mountCombobox(regions)

    for (const region of regions) {
      ui.open()
      await tick()
      expect(ui.entity().isOpen).toBe(true)

      ui.store._api.notify("#favorite:optionsSet", [])
      ui.options()[0].click()
      await tick()
      expect(ui.entity().isOpen).toBe(false)
      expect(region.value).toBeTruthy()
    }
  })

  it("does not leave listeners behind after unmounting the dropdown", async () => {
    const ui = mountCombobox(regions)

    ui.open()
    await tick()

    // Unmounting must cancel the pending registration as well as remove the
    // listener, otherwise the next open is closed by a detached dropdown.
    ui.store._api.notify("#favorite:close")
    await tick()

    expect(ui.dropdown()).toBeNull()

    ui.open()
    await tick()

    expect(ui.entity().isOpen).toBe(true)
  })
})
