import { createStore } from "@inglorious/store"
import { mount } from "@inglorious/web"
import { createMockApi, render } from "@inglorious/web/test"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Combobox, groupedVisibleOptions, visibleOptions } from "."

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

  it("removes a tag whose value is not among the options", () => {
    const entity = {
      id: "sel",
      type: "Combobox",
      isMulti: true,
      selectedValue: ["Atlantis"],
      options: [],
    }
    const api = createMockApi({ [entity.id]: entity })
    api.getType = () => Combobox
    const container = document.createElement("div")

    render(Combobox.render(entity, api), container)

    expect(container.querySelector(".iw-chip-label").textContent).toBe(
      "Atlantis",
    )
    container.querySelector(".iw-chip-remove").click()

    expect(api.getEvents()).toEqual([
      { type: "#sel:optionSelect", payload: "Atlantis" },
    ])
  })

  it("toggles from a tap on a tag, but not from its remove button", () => {
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

    container.querySelector(".iw-chip-label").click()
    expect(api.getEvents()).toEqual([{ type: "#sel:toggle" }])

    container.querySelector(".iw-chip-remove").click()
    expect(api.getEvents().map(({ type }) => type)).toEqual([
      "#sel:toggle",
      "#sel:optionSelect",
    ])
  })

  it("leaves the keys of a tag's remove button alone", () => {
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

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    })
    container.querySelector(".iw-chip-remove").dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(api.getEvents()).toEqual([])
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

describe("creatable combobox", () => {
  const options = [
    { label: "Lazio", value: "lazio" },
    { label: "Lombardia", value: "lombardia" },
  ]
  const added = (entity) =>
    visibleOptions({ options, isCreatable: true, ...entity }).find(
      (option) => option.isCreated,
    )

  it("offers the trimmed term after the options that match it", () => {
    const listed = visibleOptions({
      options,
      isCreatable: true,
      searchTerm: "  Lomb ",
    })

    expect(listed.map(({ value }) => value)).toEqual(["lombardia", "Lomb"])
    expect(listed[1].label).toBe('Add "Lomb"')
  })

  it("offers nothing when not creatable or without a term", () => {
    expect(added({ isCreatable: false, searchTerm: "Bavaria" })).toBeUndefined()
    expect(added({ searchTerm: "  " })).toBeUndefined()
  })

  it("offers nothing for a known option or a selected value, in any case", () => {
    expect(added({ searchTerm: "LAZIO" })).toBeUndefined()
    expect(
      added({ searchTerm: "bavaria", selectedValue: ["Bavaria"] }),
    ).toBeUndefined()
  })

  it("ignores disabled headings when looking for a known option", () => {
    const heading = { label: "Regions", value: "group", isDisabled: true }

    expect(
      visibleOptions({
        options: [heading],
        isCreatable: true,
        searchTerm: "regions",
      }).at(-1),
    ).toMatchObject({ value: "regions", isCreated: true })
  })

  it("finds an option by its keywords, and offers nothing for an exact one", () => {
    const listed = (searchTerm) =>
      visibleOptions({
        options: [
          { label: "Tuscany", value: "Tuscany", keywords: ["Toscana"] },
        ],
        isCreatable: true,
        searchTerm,
      }).map(({ value }) => value)

    expect(listed("toscana")).toEqual(["Tuscany"])
    expect(listed("tosc")).toEqual(["Tuscany", "tosc"])
  })

  it("labels the option with formatCreateLabel", () => {
    expect(
      added({
        searchTerm: "Bavaria",
        formatCreateLabel: (term) => `Aggiungi ${term}`,
      }).label,
    ).toBe("Aggiungi Bavaria")
  })

  it("selects a created value and clears the search", () => {
    const entity = {
      id: "sel",
      options,
      isMulti: true,
      isSearchable: true,
      isCreatable: true,
    }
    Combobox.create(entity)

    Combobox.searchChange(entity, "Bavaria")
    expect(entity.focusedIndex).toBe(0)

    Combobox.optionSelect(entity, visibleOptions(entity)[0])
    expect(entity.selectedValue).toEqual(["Bavaria"])
    expect(entity.searchTerm).toBe("")
    expect(entity.focusedIndex).toBe(-1)
  })

  it("clears the search after a pick, so the whole list is back", () => {
    const entity = { id: "sel", options, isMulti: true, isSearchable: true }
    Combobox.create(entity)

    Combobox.searchChange(entity, "Laz")
    Combobox.optionSelect(entity, visibleOptions(entity)[0])
    expect(entity.selectedValue).toEqual(["lazio"])
    expect(entity.searchTerm).toBe("")
    expect(visibleOptions(entity)).toHaveLength(options.length)
  })

  it("forgets the search when it closes", () => {
    const entity = { id: "sel", options, isSearchable: true }
    Combobox.create(entity)

    Combobox.open(entity)
    Combobox.searchChange(entity, "Laz")
    Combobox.close(entity)
    expect(entity.searchTerm).toBe("")
  })

  it("adds the term on Enter, without a no-options message", () => {
    const entity = {
      id: "sel",
      type: "Combobox",
      isOpen: true,
      isSearchable: true,
      isCreatable: true,
      isMulti: true,
      searchTerm: "Bavaria",
      focusedIndex: 0,
      selectedValue: [],
      options,
    }
    const api = createMockApi({ [entity.id]: entity })
    api.getType = () => Combobox
    const container = document.createElement("div")

    render(Combobox.render(entity, api), container)

    expect(container.querySelector(".iw-combobox-no-options")).toBeNull()
    const row = container.querySelector(".iw-combobox-dropdown-options-option")
    expect(row.textContent.trim()).toBe('Add "Bavaria"')
    expect(row.querySelector("input")).toBeNull()

    container
      .querySelector(".iw-combobox-dropdown-search")
      .dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      )

    expect(api.getEvents()).toEqual([
      {
        type: "#sel:optionSelect",
        payload: expect.objectContaining({
          value: "Bavaria",
          isCreated: true,
        }),
      },
    ])
  })
})

describe("grouped combobox", () => {
  const options = [
    { label: "Italy", options: ["Lazio", "Liguria"] },
    { label: "Elsewhere", options: ["Bavaria"] },
    "Unknown",
  ]

  function created(overrides = {}) {
    const entity = { id: "sel", type: "Combobox", options, ...overrides }
    Combobox.create(entity)
    return entity
  }

  function rendered(entity) {
    const api = createMockApi({ [entity.id]: entity })
    api.getType = () => Combobox
    const container = document.createElement("div")
    render(Combobox.render(entity, api), container)
    return container
  }

  it("lists the options of every group, in order", () => {
    expect(visibleOptions(created()).map(({ value }) => value)).toEqual([
      "Lazio",
      "Liguria",
      "Bavaria",
      "Unknown",
    ])
  })

  it("keeps only the groups with a match, holding only the matches", () => {
    const listed = groupedVisibleOptions(created({ searchTerm: "li" }))

    expect(listed).toEqual([
      {
        label: "Italy",
        options: [{ value: "Liguria", label: "Liguria" }],
      },
    ])
  })

  it("renders each group under a heading that is not an option", () => {
    const container = rendered(created({ isOpen: true, focusedIndex: 2 }))

    const groups = container.querySelectorAll('[role="group"]')
    expect(groups).toHaveLength(2)
    const heading = groups[1].querySelector(
      ".iw-combobox-dropdown-options-group-label",
    )
    expect(heading.textContent.trim()).toBe("Elsewhere")
    expect(groups[1].getAttribute("aria-labelledby")).toBe(heading.id)
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(4)
    expect(
      container.querySelector(".iw-combobox-dropdown-options-option-focused")
        .textContent,
    ).toContain("Bavaria")
  })

  it("moves focus across groups", () => {
    const entity = created()
    Combobox.open(entity)
    Combobox.focusNext(entity)
    Combobox.focusNext(entity)

    expect(visibleOptions(entity)[entity.focusedIndex].value).toBe("Bavaria")
  })

  it("shows the label of a value found in a group", () => {
    const container = rendered(
      created({
        options: [
          { label: "Sort", options: [{ value: "new", label: "Newest" }] },
        ],
        selectedValue: "new",
      }),
    )

    expect(container.querySelector(".iw-combobox-value").textContent).toBe(
      "Newest",
    )
  })

  it("does not offer to add a term an option in a group already has", () => {
    const listed = visibleOptions(
      created({ isCreatable: true, searchTerm: "bavaria" }),
    )

    expect(listed.map(({ value }) => value)).toEqual(["Bavaria"])
  })
})

describe("combobox outside click (store integration)", () => {
  const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

  const pointerdown = ({ pointerType = "mouse" } = {}) =>
    new PointerEvent("pointerdown", {
      bubbles: true,
      cancelable: true,
      pointerType,
      button: 0,
      isPrimary: true,
    })

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

    tap(ui.control())
    ui.control().click()
    await tick()

    expect(ui.entity().isOpen).toBe(true)
  })

  it("does not open when a touch turns into a scroll gesture", async () => {
    const ui = mountCombobox(regions)

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
    expect(ui.entity().isOpen).toBe(true)
  })

  it("reopens after selecting an option that is then dropped from the list", async () => {
    const ui = mountCombobox(regions)

    ui.open()
    await tick()

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

    document.body.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse" }),
    )
    await tick()

    expect(first.entity().isOpen).toBe(false)
    expect(second.entity().isOpen).toBe(false)

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
    expect(container.querySelector(".iw-combobox-hint")).toBeNull()
  })

  it("does not point at a label or message that is not there", () => {
    const container = document.createElement("div")

    render(Combobox.render({ id: "c", options: [] }), container)

    const control = container.querySelector(".iw-combobox-frame")
    expect(control.hasAttribute("aria-labelledby")).toBe(false)
    expect(control.hasAttribute("aria-describedby")).toBe(false)
  })

  it("reports required and valid explicitly rather than omitting them", () => {
    const container = document.createElement("div")

    render(Combobox.render({ id: "c", options: [] }), container)

    const control = container.querySelector(".iw-combobox-frame")
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

    const block = css.match(/\.iw-combobox-arrow \{([^}]*)\}/)
    expect(block).toBeTruthy()
    expect(block[1]).toMatch(/font-size:/)
  })
})

describe("combobox entity events", () => {
  const options = [
    { value: "north", label: "North", isDisabled: true },
    { value: "lombardia", label: "Lombardia" },
    { value: "south", label: "South", isDisabled: true },
    { value: "sicilia", label: "Sicilia" },
  ]

  function entityWith(overrides = {}) {
    const entity = { id: "region", options, ...overrides }
    Combobox.create(entity)
    return entity
  }

  it("skips disabled options when moving the focus", () => {
    const entity = entityWith()

    Combobox.open(entity)
    expect(entity.focusedIndex).toBe(1)

    Combobox.focusNext(entity)
    expect(entity.focusedIndex).toBe(3)

    Combobox.focusPrev(entity)
    expect(entity.focusedIndex).toBe(1)

    Combobox.focusPrev(entity)
    expect(entity.focusedIndex).toBe(-1)

    Combobox.focusLast(entity)
    expect(entity.focusedIndex).toBe(3)
  })

  it("refuses a disabled option", () => {
    const entity = entityWith()

    Combobox.optionSelect(entity, options[0])

    expect(entity.selectedValue).toBeNull()
  })

  it("notifies the change event with its payload and the value", () => {
    const api = { notify: vi.fn() }
    const entity = entityWith({
      changeEvent: "#form:fieldChange",
      changePayload: { path: "region" },
    })

    Combobox.optionSelect(entity, options[1], api)
    expect(api.notify).toHaveBeenLastCalledWith("#form:fieldChange", {
      path: "region",
      value: "lombardia",
    })

    Combobox.clear(entity, undefined, api)
    expect(api.notify).toHaveBeenLastCalledWith("#form:fieldChange", {
      path: "region",
      value: null,
    })
  })

  it("notifies a copy of a multiple value", () => {
    const api = { notify: vi.fn() }
    const entity = entityWith({ isMulti: true, changeEvent: "#form:pick" })

    Combobox.optionSelect(entity, options[1], api)

    const [, payload] = api.notify.mock.lastCall
    expect(payload.value).toEqual(["lombardia"])
    expect(payload.value).not.toBe(entity.selectedValue)
  })

  it("sets the value, the options and the error from outside, silently", () => {
    const api = { notify: vi.fn() }
    const entity = entityWith({ changeEvent: "#form:pick" })

    Combobox.valueSet(entity, "sicilia")
    Combobox.optionsSet(entity, ["a", "b"])
    Combobox.errorSet(entity, "Required")

    expect(entity.selectedValue).toBe("sicilia")
    Combobox.valueSet(entity, "")
    expect(entity.selectedValue).toBeNull()
    expect(entity.options.map((option) => option.value)).toEqual(["a", "b"])
    expect(entity.error).toBe("Required")
    expect(api.notify).not.toHaveBeenCalled()
  })
})
