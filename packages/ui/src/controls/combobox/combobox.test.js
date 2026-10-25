import { createStore } from "@inglorious/store"
import { mount } from "@inglorious/web"
import { createMockApi, render } from "@inglorious/web/test"
import { afterEach, describe, expect, it } from "vitest"

import { Combobox } from "."

describe("combobox", () => {
  it("renders control with selected value", () => {
    const entity = {
      id: "sel",
      type: "Combobox",
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

  it("labels the search box with searchPlaceholder", () => {
    const entity = {
      id: "sel",
      type: "Combobox",
      isOpen: true,
      isSearchable: true,
      options: [{ label: "A", value: "a" }],
    }
    const api = createMockApi({ [entity.id]: entity })
    api.getType = () => Combobox
    const search = () => container.querySelector(".iw-combobox-dropdown-search")
    const container = document.createElement("div")

    render(Combobox.render(entity, api), container)
    expect(search().placeholder).toBe("Search...")

    render(
      Combobox.render({ ...entity, searchPlaceholder: "Cerca…" }, api),
      container,
    )
    expect(search().placeholder).toBe("Cerca…")
  })

  it("renders multi tags", () => {
    const entity = {
      id: "sel",
      type: "Combobox",
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
      type: "Combobox",
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
    const entity = { id: "sel", type: "Combobox", options: [] }
    const api = createMockApi({ [entity.id]: entity })
    api.getType = () => Combobox
    const container = document.createElement("div")

    render(Combobox.render(entity, api), container)

    container.querySelector(".iw-combobox-frame").click()

    expect(api.getEvents()).toEqual([{ type: "#sel:toggle" }])
  })

  it("makes the control reachable by keyboard", () => {
    const entity = { id: "sel", type: "Combobox", options: [] }
    const api = createMockApi({ [entity.id]: entity })
    api.getType = () => Combobox
    const container = document.createElement("div")

    render(Combobox.render(entity, api), container)

    const control = container.querySelector(".iw-combobox-frame")
    // A plain div with no tabindex is skipped by tab entirely, which is how
    // this went unnoticed: the field worked with a mouse and nowhere else.
    expect(control.getAttribute("tabindex")).toBe("0")
    expect(control.getAttribute("role")).toBe("combobox")
    expect(control.getAttribute("aria-expanded")).toBe("false")
  })

  it("takes the control out of the tab order when disabled", () => {
    const entity = {
      id: "sel",
      type: "Combobox",
      options: [],
      isDisabled: true,
    }
    const api = createMockApi({ [entity.id]: entity })
    api.getType = () => Combobox
    const container = document.createElement("div")

    render(Combobox.render(entity, api), container)

    expect(
      container.querySelector(".iw-combobox-frame").getAttribute("tabindex"),
    ).toBe("-1")
  })

  it("opens on Enter, Space or ArrowDown", () => {
    for (const key of ["Enter", " ", "ArrowDown"]) {
      const entity = { id: "sel", type: "Combobox", options: [] }
      const api = createMockApi({ [entity.id]: entity })
      api.getType = () => Combobox
      const container = document.createElement("div")

      render(Combobox.render(entity, api), container)
      container
        .querySelector(".iw-combobox-frame")
        .dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }))

      expect(api.getEvents()).toEqual([{ type: "#sel:toggle" }])
    }
  })

  it("ignores keys that are not an attempt to open", () => {
    const entity = { id: "sel", type: "Combobox", options: [] }
    const api = createMockApi({ [entity.id]: entity })
    api.getType = () => Combobox
    const container = document.createElement("div")

    render(Combobox.render(entity, api), container)
    container
      .querySelector(".iw-combobox-frame")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }))

    expect(api.getEvents()).toEqual([])
  })

  it("navigates instead of toggling once open", () => {
    // A non-searchable combobox keeps focus on the control, so it has to drive
    // the same navigation the search input does — toggling here would close the
    // list on the first arrow press and leave no way to pick an option.
    const entity = {
      id: "sel",
      type: "Combobox",
      options: [{ label: "A", value: "a" }],
      isOpen: true,
    }
    const api = createMockApi({ [entity.id]: entity })
    api.getType = () => Combobox
    const container = document.createElement("div")

    render(Combobox.render(entity, api), container)
    const control = container.querySelector(".iw-combobox-frame")

    expect(control.getAttribute("aria-expanded")).toBe("true")

    control.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    )
    expect(api.getEvents()).toEqual([{ type: "#sel:focusNext" }])
  })

  it("closes on Escape from the control", () => {
    const entity = {
      id: "sel",
      type: "Combobox",
      options: [{ label: "A", value: "a" }],
      isOpen: true,
    }
    const api = createMockApi({ [entity.id]: entity })
    api.getType = () => Combobox
    const container = document.createElement("div")

    render(Combobox.render(entity, api), container)
    container
      .querySelector(".iw-combobox-frame")
      .dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      )

    expect(api.getEvents()).toEqual([{ type: "#sel:close" }])
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

  // `entityId` is normally "favorite"; passing null renders a combobox with no
  // id at all, which the store accepts.
  function mountCombobox(options, overrides = {}, entityId = "favorite") {
    const entity = {
      type: "Combobox",
      isSearchable: true,
      isMulti: false,
      isClearable: true,
      options,
      ...overrides,
    }
    if (entityId) entity.id = entityId

    const store = createStore({
      types: { Combobox },
      entities: { favorite: entity },
    })

    const container = document.createElement("div")
    document.body.appendChild(container)
    mount(store, (api) => api.render("favorite"), container)

    return {
      store,
      container,
      entity: () => store._api.getEntity("favorite"),
      control: () => container.querySelector(".iw-combobox-frame"),
      open: () => container.querySelector(".iw-combobox-frame").click(),
      options: () =>
        container.querySelectorAll(".iw-combobox-dropdown-options-option"),
      dropdown: () => container.querySelector(".iw-combobox-dropdown"),
    }
  }

  const regions = [
    { label: "Lazio", value: "Lazio" },
    { label: "Lombardia", value: "Lombardia" },
  ]

  // A real tap delivers touch events and then a click the browser decides on;
  // these tests dispatch the touch half only, so no click follows.
  const tap = (el) => {
    el.dispatchEvent(
      new TouchEvent("touchstart", { bubbles: true, cancelable: true }),
    )
    el.dispatchEvent(
      new TouchEvent("touchend", { bubbles: true, cancelable: true }),
    )
  }

  afterEach(() => {
    document.body.innerHTML = ""
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

  it("opens on a tap that the browser turns into a click", async () => {
    const ui = mountCombobox(regions)

    // A real tap delivers touchstart/touchend and then a click. The control
    // stays on click so a finger that starts scrolling never opens the dropdown.
    tap(ui.control())
    ui.control().click()
    await tick()

    expect(ui.entity().isOpen).toBe(true)
  })

  it("does not open when a touch turns into a scroll gesture", async () => {
    const ui = mountCombobox(regions)

    // The browser suppresses click when the touch drifts into a pan, which is
    // exactly what should stop the dropdown from opening mid-scroll.
    tap(ui.control())
    await tick()

    expect(ui.entity().isOpen).toBe(false)
    expect(ui.dropdown()).toBeNull()
  })

  it("still toggles on a mouse click", async () => {
    const ui = mountCombobox(regions)

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

    // The browser never delivers the click that would follow the tap.
    ui.control().dispatchEvent(pointerdown({ pointerType: "touch" }))
    await tick()

    expect(ui.entity().isOpen).toBe(false)
    expect(ui.dropdown()).toBeNull()
  })

  it("closes on an outside touch and leaves no armed listener", async () => {
    const ui = mountCombobox(regions)

    ui.open()
    await tick()

    const outside = document.createElement("button")
    document.body.appendChild(outside)
    outside.dispatchEvent(pointerdown({ pointerType: "touch" }))
    await tick()

    expect(ui.entity().isOpen).toBe(false)

    ui.open()
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

  it("closes an open dropdown when another combobox's clear button is pressed", async () => {
    // Pressing inside one combobox must still reach the document, otherwise the
    // other combobox stays open behind it.
    const first = mountCombobox(regions, { selectedValue: "Lazio" })
    first.open()
    await tick()
    expect(first.entity().isOpen).toBe(true)

    const second = mountCombobox(regions, { selectedValue: "Lombardia" })
    await tick()

    const clear = second.container.querySelector(".iw-combobox-clear")
    expect(clear).not.toBeNull()

    clear.dispatchEvent(pointerdown({ pointerType: "touch" }))
    await tick()

    expect(first.entity().isOpen).toBe(false)
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

    ui.store._api.notify("#favorite:close")
    await tick()

    expect(ui.dropdown()).toBeNull()

    ui.open()
    await tick()

    expect(ui.entity().isOpen).toBe(true)
  })

  it("does not close when the dropdown is gone and a press arrives", async () => {
    const ui = mountCombobox(regions)

    ui.open()
    await tick()
    ui.store._api.notify("#favorite:close")
    await tick()

    // A press now finds a listener whose dropdown has already left the DOM. It
    // must retire itself rather than close whatever happens to be open.
    document.body.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse" }),
    )
    await tick()

    expect(ui.dropdown()).toBeNull()

    ui.open()
    await tick()

    expect(ui.entity().isOpen).toBe(true)

    document.body.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse" }),
    )
    await tick()

    expect(ui.entity().isOpen).toBe(false)
  })

  it("registers one document listener no matter how often it re-renders", async () => {
    const ui = mountCombobox(regions)

    const original = document.addEventListener.bind(document)
    let registered = 0
    document.addEventListener = (type, ...rest) => {
      if (type === "pointerdown") registered++
      return original(type, ...rest)
    }

    try {
      ui.open()
      await tick()

      // The ref callback is handed a fresh arrow every render, and hovering an
      // option re-renders the dropdown, so each pass must reuse its listener.
      for (let pass = 0; pass < 3; pass++) {
        for (const option of ui.options()) {
          option.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }))
        }
        await tick()
      }

      expect(registered).toBe(1)
    } finally {
      document.addEventListener = original
    }
  })

  it("keeps id-less comboboxes independent", async () => {
    const first = mountCombobox(regions, {}, null)
    const second = mountCombobox(regions, {}, null)

    first.open()
    second.open()
    await tick()

    expect(first.entity().isOpen).toBe(true)
    expect(second.entity().isOpen).toBe(true)

    // One outside press closes both, each through its own listener.
    document.body.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse" }),
    )
    await tick()

    expect(first.entity().isOpen).toBe(false)
    expect(second.entity().isOpen).toBe(false)

    // And reopening one does not inherit the other's state.
    first.open()
    await tick()

    expect(first.entity().isOpen).toBe(true)
    expect(second.entity().isOpen).toBe(false)
  })
})

describe("combobox label, hint and error", () => {
  it("labels the control by id, since a div cannot take a for binding", () => {
    const container = document.createElement("div")

    render(
      Combobox.render({ id: "c", label: "Country", options: [] }),
      container,
    )

    const label = container.querySelector(".iw-combobox-label")
    expect(label.id).toBe("c-label")
    expect(label.textContent.trim()).toBe("Country")
    expect(
      container
        .querySelector(".iw-combobox-frame")
        .getAttribute("aria-labelledby"),
    ).toBe("c-label")
  })

  it("marks a required combobox for assistive tech", () => {
    const container = document.createElement("div")

    render(
      Combobox.render({
        id: "c",
        label: "Country",
        isRequired: true,
        options: [],
      }),
      container,
    )

    expect(container.querySelector(".iw-combobox-required")).toBeTruthy()
    expect(
      container
        .querySelector(".iw-combobox-frame")
        .getAttribute("aria-required"),
    ).toBe("true")
  })

  it("shows a hint and points the control at it", () => {
    const container = document.createElement("div")

    render(
      Combobox.render({ id: "c", hint: "Start typing", options: [] }),
      container,
    )

    const hint = container.querySelector(".iw-combobox-hint")
    expect(hint.textContent).toBe("Start typing")
    expect(
      container
        .querySelector(".iw-combobox-frame")
        .getAttribute("aria-describedby"),
    ).toBe(hint.id)
  })

  it("shows an error, marks the control invalid, and drops the hint", () => {
    const container = document.createElement("div")

    render(
      Combobox.render({
        id: "c",
        hint: "Start typing",
        error: "Pick a country",
        options: [],
      }),
      container,
    )

    const control = container.querySelector(".iw-combobox-frame")
    expect(control.getAttribute("aria-invalid")).toBe("true")
    expect(control.classList.contains("iw-combobox-frame-error")).toBe(true)
    expect(
      container.querySelector(".iw-combobox-error-message").textContent,
    ).toBe("Pick a country")
    // Showing both tells someone how to fix a field they already got wrong.
    expect(container.querySelector(".iw-combobox-hint")).toBeNull()
  })

  it("does not point at a label or message that is not there", () => {
    const container = document.createElement("div")

    render(Combobox.render({ id: "c", options: [] }), container)

    const control = container.querySelector(".iw-combobox-frame")
    // A reference to an id that is not in the DOM is worse than none, and an
    // empty reference is still a reference: the attribute is left off.
    expect(control.hasAttribute("aria-labelledby")).toBe(false)
    expect(control.hasAttribute("aria-describedby")).toBe(false)
  })

  it("reports required and valid explicitly rather than omitting them", () => {
    const container = document.createElement("div")

    render(Combobox.render({ id: "c", options: [] }), container)

    const control = container.querySelector(".iw-combobox-frame")
    // An absent aria-invalid reads as ambiguous, and aria-invalid="" is not a
    // valid token. Both booleans state their value.
    expect(control.getAttribute("aria-required")).toBe("false")
    expect(control.getAttribute("aria-invalid")).toBe("false")
  })

  it("styles the hint muted and the error as danger", async () => {
    const css = await import("./style.css?raw")

    expect(css.default).toMatch(
      /\.iw-combobox-hint\s*\{[^}]*--iw-color-text-muted/,
    )
    expect(css.default).toMatch(
      /\.iw-combobox-error-message\s*\{[^}]*--iw-color-error/,
    )
    expect(css.default).toMatch(/\.iw-combobox-frame-error/)
  })
})

describe("combobox arrow", () => {
  it("pins its glyph size so it matches the select arrow", async () => {
    const css = (await import("./style.css?raw")).default.replace(
      /\/\*[\s\S]*?\*\//g,
      "",
    )

    // The glyph is a text character, so an unpinned font-size lets each arrow
    // inherit whatever context it was dropped into and the two stop matching.
    // Captured per block rather than scanned whole-file: a bare
    // `toMatch(/\.iw-combobox-arrow\s*\{[^}]*font-size:/)` can be satisfied by
    // a *different* rule and silently stop checking this one.
    const block = css.match(/\.iw-combobox-arrow \{([^}]*)\}/)
    expect(block).toBeTruthy()
    expect(block[1]).toMatch(/font-size:/)
  })
})
