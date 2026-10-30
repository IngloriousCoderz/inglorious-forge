import { createStore } from "@inglorious/store"
import { mount } from "@inglorious/web"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { Select } from "../../controls/select/index.js"
import {
  DataGrid,
  getCellValue,
  getEditCount,
  getEditedRows,
  getPaginationInfo,
  getRows,
  getSortDirection,
  getTotalRows,
  isAllSelected,
  isSomeSelected,
} from "."

const sampleData = [
  { id: 1, name: "Charlie", age: 35, active: true, role: "Admin" },
  { id: 2, name: "Alice", age: 30, active: true, role: "User" },
  { id: 3, name: "Bob", age: 25, active: false, role: "User" },
  { id: 4, name: "David", age: 40, active: true, role: "Admin" },
]

const sampleColumns = [
  { id: "name", title: "Name", isSortable: true, isFilterable: true },
  {
    id: "age",
    title: "Age",
    type: "number",
    isSortable: true,
    isFilterable: true,
  },
  { id: "active", title: "Active", type: "boolean", isFilterable: true },
  {
    id: "role",
    title: "Role",
    isFilterable: true,
    filter: { type: "select", options: ["Admin", "User"] },
  },
]

const GRID_ID = "test-DataGrid"

/**
 * Creates a store, mounts it to a detached DOM element, and waits for the
 * first render. Returns the store, the container, and convenience accessors.
 */
async function setup(entityOverrides = {}) {
  const store = createStore({
    types: { DataGrid, Select },
    entities: {
      [GRID_ID]: {
        type: "DataGrid",
        rows: JSON.parse(JSON.stringify(sampleData)),
        columns: JSON.parse(JSON.stringify(sampleColumns)),
        pagination: { page: 0, pageSize: 2, pageSizes: [10, 20, 30] },
        search: { value: "" },
        ...entityOverrides,
      },
    },
  })

  const container = document.createElement("div")
  document.body.appendChild(container)

  const { getEntity } = store._api

  const unsubscribe = await mount(
    store,
    (api) => {
      const e = getEntity(GRID_ID)
      return e ? DataGrid.render(e, api) : null
    },
    container,
  )

  return {
    store,
    container,
    unsubscribe,
    getGrid: () => getEntity(GRID_ID),
  }
}

describe("DataGrid / handlers", () => {
  let entity, api

  beforeEach(() => {
    const store = createStore({ types: { DataGrid, Select } })
    store.notify("init")
    api = store._api

    entity = {
      id: GRID_ID,
      type: "DataGrid",
      rows: JSON.parse(JSON.stringify(sampleData)),
      columns: JSON.parse(JSON.stringify(sampleColumns)),
      pagination: { page: 0, pageSize: 2 },
      search: { value: "" },
    }
    DataGrid.create(entity, undefined, api)
  })

  describe("create()", () => {
    it("initialises default state", () => {
      const e = { rows: [{ id: 1, name: "Test" }], search: { value: "" } }
      DataGrid.create(e, undefined, api)
      expect(e.sorts).toEqual([])
      expect(e.filters).toEqual({})
      expect(e.selection).toEqual([])
      expect(e.columns[0].id).toBe("id")
      expect(e.columns[0].title).toBe("Id")
    })

    it("throws when rows do not have a valid default id key", () => {
      expect(() => DataGrid.create({ rows: [{ name: "No id" }] })).toThrow(
        'for field "id". Keys must be string or number',
      )
    })

    it("supports a custom rowId", () => {
      expect(() =>
        DataGrid.create(
          {
            rowId: "uuid",
            rows: [
              { uuid: "a1", name: "A" },
              { uuid: "b1", name: "B" },
            ],
            search: { value: "" },
          },
          undefined,
          api,
        ),
      ).not.toThrow()
    })

    it("throws on duplicate row keys", () => {
      expect(() =>
        DataGrid.create({
          rowId: "uuid",
          rows: [
            { uuid: "same", name: "A" },
            { uuid: "same", name: "B" },
          ],
        }),
      ).toThrow('Duplicate row key "same" for field "uuid"')
    })
  })

  describe("sortChange()", () => {
    it("adds a new sort", () => {
      DataGrid.sortChange(entity, "name")
      expect(entity.sorts).toEqual([{ column: "name", direction: "asc" }])
    })

    it("toggles asc to desc", () => {
      DataGrid.sortChange(entity, "name")
      DataGrid.sortChange(entity, "name")
      expect(entity.sorts).toEqual([{ column: "name", direction: "desc" }])
    })

    it("removes the sort when toggling past desc", () => {
      DataGrid.sortChange(entity, "name")
      DataGrid.sortChange(entity, "name")
      DataGrid.sortChange(entity, "name")
      expect(entity.sorts).toEqual([])
    })

    it("resets to page 0", () => {
      entity.pagination.page = 1
      DataGrid.sortChange(entity, "name")
      expect(entity.pagination.page).toBe(0)
    })
  })

  describe("filterChange()", () => {
    it("adds a filter", () => {
      DataGrid.filterChange(entity, { columnId: "name", value: "Alice" })
      expect(entity.filters.name).toBe("Alice")
    })

    it("removes a filter when value is empty", () => {
      DataGrid.filterChange(entity, { columnId: "name", value: "Alice" })
      DataGrid.filterChange(entity, { columnId: "name", value: "" })
      expect(entity.filters.name).toBeUndefined()
    })

    it("resets to page 0", () => {
      entity.pagination.page = 1
      DataGrid.filterChange(entity, { columnId: "name", value: "Alice" })
      expect(entity.pagination.page).toBe(0)
    })
  })

  describe("searchChange()", () => {
    it("updates the search value", () => {
      DataGrid.searchChange(entity, "Ali")
      expect(entity.search.value).toBe("Ali")
    })

    it("resets to page 0", () => {
      entity.pagination.page = 1
      DataGrid.searchChange(entity, "Ali")
      expect(entity.pagination.page).toBe(0)
    })
  })

  describe("pagination", () => {
    it("pageNext: advances page", () => {
      DataGrid.pageNext(entity)
      expect(entity.pagination.page).toBe(1)
    })

    it("pageNext: does not go past the last page", () => {
      DataGrid.pageNext(entity)
      DataGrid.pageNext(entity)
      expect(entity.pagination.page).toBe(1)
    })

    it("pagePrev: goes back one page", () => {
      entity.pagination.page = 1
      DataGrid.pagePrev(entity)
      expect(entity.pagination.page).toBe(0)
    })

    it("pagePrev: does not go before page 0", () => {
      DataGrid.pagePrev(entity)
      expect(entity.pagination.page).toBe(0)
    })

    it("pageSizeChange: updates size and resets to page 0", () => {
      entity.pagination.page = 1
      DataGrid.pageSizeChange(entity, 4)
      expect(entity.pagination.pageSize).toBe(4)
      expect(entity.pagination.page).toBe(0)
    })

    it("columnResize: updates size and enforces a minimum width", () => {
      DataGrid.columnResize(entity, { columnId: "name", width: 180 })
      expect(entity.columns.find((column) => column.id === "name").width).toBe(
        180,
      )

      DataGrid.columnResize(entity, { columnId: "name", width: 10 })
      expect(entity.columns.find((column) => column.id === "name").width).toBe(
        72,
      )
    })
  })

  describe("selection", () => {
    it("rowToggle: selects an unselected row", () => {
      DataGrid.rowToggle(entity, 1)
      expect(entity.selection).toContain(1)
    })

    it("rowToggle: deselects a selected row", () => {
      entity.selection = [1]
      DataGrid.rowToggle(entity, 1)
      expect(entity.selection).not.toContain(1)
    })

    it("rowToggle: replaces selection in single-select mode", () => {
      entity.isMultiSelect = false
      entity.selection = [1]
      DataGrid.rowToggle(entity, 2)
      expect(entity.selection).toEqual([2])
    })

    it("rowClick: plain click replaces selection and sets the anchor", () => {
      entity.selection = [1, 2]
      DataGrid.rowClick(entity, { rowId: 3 })
      expect(entity.selection).toEqual([3])
      expect(entity.selectionAnchor).toBe(3)
    })

    it("rowClick: ctrl/meta click toggles selection", () => {
      entity.selection = [1]
      DataGrid.rowClick(entity, { rowId: 2, ctrlKey: true })
      expect(entity.selection).toEqual([1, 2])
      DataGrid.rowClick(entity, { rowId: 1, metaKey: true })
      expect(entity.selection).toEqual([2])
    })

    it("rowClick: shift click selects the visible row range from the anchor", () => {
      entity.pagination.pageSize = 10
      entity.selection = [1]
      entity.selectionAnchor = 1
      DataGrid.rowClick(entity, { rowId: 3, shiftKey: true })
      expect(entity.selection).toEqual([1, 2, 3])
    })

    it("rowsToggleAll: selects all visible rows when not all selected", () => {
      entity.selection = [1]
      DataGrid.rowsToggleAll(entity)
      expect(isAllSelected(entity)).toBe(true)
      expect(entity.selection).toContain(1)
      expect(entity.selection).toContain(2)
    })

    it("rowsToggleAll: deselects all visible rows when all selected", () => {
      entity.selection = [1, 2]
      DataGrid.rowsToggleAll(entity)
      expect(entity.selection).toEqual([])
    })

    it("rowsToggleAll: respects custom rowId", () => {
      const e = {
        rowId: "uuid",
        rows: [
          { uuid: "u1", name: "Alice" },
          { uuid: "u2", name: "Bob" },
        ],
        columns: [{ id: "name", title: "Name", isFilterable: false }],
        pagination: { page: 0, pageSize: 10 },
      }
      DataGrid.create(e, undefined, api)
      DataGrid.rowsToggleAll(e)
      expect(e.selection).toEqual(["u1", "u2"])
    })
  })

  describe("selectors", () => {
    it("getRows: applies sort, filter and pagination in order", () => {
      DataGrid.sortChange(entity, "age")
      DataGrid.sortChange(entity, "age")
      DataGrid.filterChange(entity, { columnId: "active", value: true })
      expect(getRows(entity).map((r) => r.name)).toEqual(["David", "Charlie"])
    })

    it("getTotalRows: counts rows after filtering", () => {
      DataGrid.filterChange(entity, { columnId: "role", value: "Admin" })
      expect(getTotalRows(entity)).toBe(2)
    })

    it("getPaginationInfo: returns correct details", () => {
      expect(getPaginationInfo(entity)).toEqual({
        page: 0,
        pageSize: 2,
        totalPages: 2,
        totalRows: 4,
        start: 0,
        end: 2,
        hasNextPage: true,
        hasPrevPage: false,
      })
    })

    it("getSortDirection: returns the direction for a sorted column", () => {
      DataGrid.sortChange(entity, "name")
      expect(getSortDirection(entity, "name")).toBe("asc")
      expect(getSortDirection(entity, "age")).toBeNull()
    })

    it("isAllSelected: true when all visible rows are selected", () => {
      entity.selection = [1, 2]
      expect(isAllSelected(entity)).toBe(true)
    })

    it("isSomeSelected: true when some but not all visible rows are selected", () => {
      entity.selection = [1]
      expect(isSomeSelected(entity)).toBe(true)
      entity.selection = [1, 2]
      expect(isSomeSelected(entity)).toBe(false)
    })

    it("isAllSelected/isSomeSelected: respect custom rowId", () => {
      const e = {
        rowId: "uuid",
        rows: [
          { uuid: "u1", name: "Alice" },
          { uuid: "u2", name: "Bob" },
        ],
        columns: [{ id: "name", title: "Name", isFilterable: false }],
        pagination: { page: 0, pageSize: 10 },
        selection: ["u1"],
      }
      DataGrid.create(e, undefined, api)
      expect(isSomeSelected(e)).toBe(true)
      e.selection = ["u1", "u2"]
      expect(isAllSelected(e)).toBe(true)
    })
  })
})

describe("DataGrid / template", () => {
  let store, container, unsubscribe, getGrid

  beforeEach(async () => {
    ;({ store, container, unsubscribe, getGrid } = await setup())
  })

  afterEach(() => {
    unsubscribe()
    container.remove()
  })

  describe("structure", () => {
    it("renders header, body and footer", () => {
      expect(container.querySelector(".iw-data-grid-header")).not.toBeNull()
      expect(container.querySelector(".iw-data-grid-body")).not.toBeNull()
      expect(container.querySelector(".iw-data-grid-footer")).not.toBeNull()
    })

    it("renders the toolbar above the header row", () => {
      const header = container.querySelector(".iw-data-grid-header")
      expect(
        header.firstElementChild.classList.contains("iw-data-grid-toolbar"),
      ).toBe(true)
    })

    it("renders one header column per column definition", () => {
      expect(
        container.querySelectorAll(".iw-data-grid-header-column"),
      ).toHaveLength(getGrid().columns.length)
    })

    it("renders one resize handle per header column", () => {
      expect(
        container.querySelectorAll(".iw-data-grid-column-resizer"),
      ).toHaveLength(getGrid().columns.length)
    })

    it("renders one body row per visible (paginated) item", () => {
      expect(
        container.querySelectorAll(".iw-data-grid-body .iw-data-grid-row"),
      ).toHaveLength(getRows(getGrid()).length)
    })

    it("applies explicit semantics for auto, fractional, and percentage widths", async () => {
      unsubscribe()
      container.remove()
      ;({ store, container, unsubscribe, getGrid } = await setup({
        columns: [
          { id: "id", title: "Id", type: "number", width: "auto" },
          { id: "name", title: "Name", width: "2fr" },
          { id: "role", title: "Role", width: "40%" },
        ],
        rows: [
          { id: 1, name: "Alice", role: "Admin" },
          { id: 2, name: "Bob", role: "User" },
        ],
      }))

      const [autoColumn, fractionalColumn, percentColumn] =
        container.querySelectorAll(".iw-data-grid-header-column")

      expect(autoColumn.getAttribute("style")).toContain("flex: 1 1 0")
      expect(fractionalColumn.getAttribute("style")).toContain("flex: 2 1 0")
      expect(percentColumn.getAttribute("style")).toContain("width: 40%")
      expect(percentColumn.getAttribute("style")).toContain("flex: 0 0 40%")
    })
  })

  describe("sorting", () => {
    it("shows the asc sort icon after clicking a sortable column header", () => {
      container.querySelector(".iw-data-grid-header-title").click()
      expect(
        container.querySelector(".iw-data-grid-header-title").textContent,
      ).toContain("▲")
    })

    it("shows the desc sort icon after clicking the same column twice", () => {
      const title = container.querySelector(".iw-data-grid-header-title")
      title.click()
      title.click()
      expect(title.textContent).toContain("▼")
    })
  })

  describe("row click modifiers", () => {
    it("ctrl click adds a row to the current selection", () => {
      const rows = container.querySelectorAll(
        ".iw-data-grid-body .iw-data-grid-row",
      )
      rows[0].dispatchEvent(new MouseEvent("click", { bubbles: true }))
      rows[1].dispatchEvent(
        new MouseEvent("click", { bubbles: true, ctrlKey: true }),
      )
      expect(getGrid().selection).toEqual([1, 2])
    })

    it("shift click selects a contiguous row range", () => {
      const rows = container.querySelectorAll(
        ".iw-data-grid-body .iw-data-grid-row",
      )
      rows[0].dispatchEvent(new MouseEvent("click", { bubbles: true }))
      rows[1].dispatchEvent(
        new MouseEvent("click", { bubbles: true, shiftKey: true }),
      )
      expect(getGrid().selection).toEqual([1, 2])
    })
  })

  describe("pagination controls", () => {
    it("renders the page number input", () => {
      expect(
        container.querySelector('.iw-data-grid-footer input[name="page"]'),
      ).not.toBeNull()
    })

    it("disables prev buttons on the first page", () => {
      const [first, prev] = container.querySelectorAll("button")
      expect(first.disabled).toBe(true)
      expect(prev.disabled).toBe(true)
    })

    it("clicking next page shows the next set of rows", () => {
      const nextBtn = container.querySelector(
        'button[aria-label="Go to page 2"]',
      )
      nextBtn.click()
      expect(getGrid().pagination.page).toBe(1)
      expect(
        container.querySelectorAll(".iw-data-grid-body .iw-data-grid-row"),
      ).toHaveLength(2)
    })

    it("disables next buttons on the last page", () => {
      store.notify(`#${GRID_ID}:pageChange`, 1)
      const buttons = [...container.querySelectorAll("button")]
      const [next, last] = buttons.slice(-2)
      expect(next.disabled).toBe(true)
      expect(last.disabled).toBe(true)
    })
  })

  describe("search", () => {
    it("typing in the searchbar filters visible rows", () => {
      const input = container.querySelector(".iw-data-grid-searchbar input")
      input.value = "Alice"
      input.dispatchEvent(new Event("input"))
      expect(
        container.querySelectorAll(".iw-data-grid-body .iw-data-grid-row"),
      ).toHaveLength(1)
    })

    it("clearing the search restores all rows on the current page", () => {
      const input = container.querySelector(".iw-data-grid-searchbar input")
      input.value = "Alice"
      input.dispatchEvent(new Event("input"))
      input.value = ""
      input.dispatchEvent(new Event("input"))
      expect(
        container.querySelectorAll(".iw-data-grid-body .iw-data-grid-row"),
      ).toHaveLength(2)
    })
  })
})

const editableColumns = [
  { id: "name", title: "Name", isEditable: true, isSortable: true },
  { id: "age", title: "Age", type: "number", isEditable: true },
  { id: "active", title: "Active", type: "boolean", isEditable: true },
  {
    id: "role",
    title: "Role",
    isEditable: true,
    options: [
      { value: "Admin", label: "Admin" },
      { value: "User", label: "User" },
    ],
  },
]

describe("DataGrid / editing handlers", () => {
  let entity

  beforeEach(() => {
    entity = {
      id: GRID_ID,
      type: "DataGrid",
      rows: JSON.parse(JSON.stringify(sampleData)),
      columns: JSON.parse(JSON.stringify(editableColumns)),
    }
    DataGrid.create(entity)
  })

  it("keeps edits apart from the rows, and shows them over them", () => {
    DataGrid.cellChange(entity, { rowId: 2, columnId: "age", value: 31 })

    expect(entity.rows[1].age).toBe(30)
    expect(getCellValue(entity, entity.rows[1], "age")).toBe(31)
    expect(getEditCount(entity)).toBe(1)
  })

  it("drops an edit back to the saved value", () => {
    DataGrid.cellChange(entity, { rowId: 2, columnId: "age", value: 31 })
    DataGrid.cellChange(entity, { rowId: 2, columnId: "age", value: 30 })

    expect(entity.edits).toEqual({})
    expect(getEditCount(entity)).toBe(0)
  })

  it("resets edits, or saves them into the rows", () => {
    DataGrid.cellChange(entity, { rowId: 1, columnId: "name", value: "Carl" })
    DataGrid.editsReset(entity)
    expect(getEditCount(entity)).toBe(0)
    expect(entity.rows[0].name).toBe("Charlie")

    DataGrid.cellChange(entity, { rowId: 1, columnId: "name", value: "Carl" })
    expect(getEditedRows(entity)[0].name).toBe("Carl")
    DataGrid.editsSave(entity)
    expect(entity.rows[0].name).toBe("Carl")
    expect(getEditCount(entity)).toBe(0)
  })

  it("sorts by the saved values while edits are pending", () => {
    entity.sorts = [{ column: "name", direction: "asc" }]
    DataGrid.cellChange(entity, { rowId: 2, columnId: "name", value: "Zed" })

    expect(getRows(entity)[0].id).toBe(2)
  })
})

describe("DataGrid / editing template", () => {
  let container, unsubscribe, getGrid

  beforeEach(async () => {
    ;({ container, unsubscribe, getGrid } = await setup({
      columns: JSON.parse(JSON.stringify(editableColumns)),
      pagination: null,
      search: null,
    }))
  })

  afterEach(() => {
    unsubscribe()
    container.remove()
  })

  it("puts an editor in every editable cell, by the column's type", () => {
    expect(container.querySelectorAll('input[aria-label="Name"]')).toHaveLength(
      4,
    )
    expect(container.querySelector('input[aria-label="Age"]').type).toBe(
      "number",
    )
    expect(
      container.querySelector('input[type="checkbox"][aria-label="Active"]'),
    ).not.toBeNull()
    expect(container.querySelector('select[aria-label="Role"]')).not.toBeNull()
  })

  it("counts edits in the footer, and resets or saves them", () => {
    const age = container.querySelectorAll('input[aria-label="Age"]')[1]
    age.value = "31"
    age.dispatchEvent(new Event("input", { bubbles: true }))

    expect(getGrid().edits).toEqual({ 2: { age: 31 } })
    expect(
      container.querySelector(".iw-data-grid-edits").textContent,
    ).toContain("1 change")
    expect(container.querySelector(".iw-data-grid-cell-edited")).not.toBeNull()

    const [reset, save] = container.querySelectorAll(
      ".iw-data-grid-edits button",
    )
    save.click()
    expect(getGrid().rows[1].age).toBe(31)
    expect(container.querySelector(".iw-data-grid-edits")).toBeNull()
    expect(reset.textContent.trim()).toBe("Reset")
  })

  it("shows sort arrows only on sortable columns", () => {
    const [name, age] = container.querySelectorAll(".iw-data-grid-header-title")
    expect(name.textContent).toContain("▲▼")
    expect(age.textContent).not.toContain("▲")
  })

  it("does not select a row when its editor is clicked", () => {
    container.querySelector('input[aria-label="Name"]').click()

    expect(getGrid().selection).toEqual([])
  })
})

describe("DataGrid / urls and dates", () => {
  let container, unsubscribe, getGrid

  const edit = (input, text) => {
    input.value = text
    input.dispatchEvent(new Event("input", { bubbles: true }))
  }

  afterEach(() => {
    unsubscribe()
    container.remove()
  })

  it("links web addresses in url columns, and nothing else", async () => {
    ;({ container, unsubscribe } = await setup({
      columns: [{ id: "site", title: "Site", type: "url" }],
      rows: [
        { id: 1, site: "https://example.com" },
        { id: 2, site: "javascript:alert(1)" },
      ],
      pagination: null,
      search: null,
    }))

    const links = container.querySelectorAll(".iw-data-grid-body a")
    expect(links).toHaveLength(1)
    expect(links[0].getAttribute("href")).toBe("https://example.com")
    expect(links[0].getAttribute("rel")).toBe("noopener noreferrer")
    expect(container.textContent).toContain("javascript:alert(1)")
  })

  it("edits a url column with a url field", async () => {
    ;({ container, unsubscribe } = await setup({
      columns: [{ id: "site", title: "Site", type: "url", isEditable: true }],
      rows: [{ id: 1, site: "https://example.com" }],
      pagination: null,
      search: null,
    }))

    expect(container.querySelector('input[aria-label="Site"]').type).toBe("url")
  })

  it("gives edited dates back in the form the row keeps them, time of day included", async () => {
    const createdAt = new Date(2026, 9, 27, 15, 30)
    ;({ container, unsubscribe, getGrid } = await setup({
      columns: [
        { id: "asDate", title: "As date", type: "date", isEditable: true },
        { id: "asTime", title: "As time", type: "date", isEditable: true },
        { id: "asText", title: "As text", type: "date", isEditable: true },
      ],
      rows: [
        {
          id: 1,
          asDate: createdAt,
          asTime: createdAt.getTime(),
          asText: "2026-10-27",
        },
      ],
      pagination: null,
      search: null,
    }))
    const field = (label) =>
      container.querySelector(`input[aria-label="${label}"]`)

    expect(field("As date").value).toBe("2026-10-27")
    expect(field("As time").value).toBe("2026-10-27")
    edit(field("As date"), "2026-11-02")
    edit(field("As time"), "2026-11-02")
    edit(field("As text"), "2026-11-02")

    const { asDate, asTime, asText } = getGrid().edits[1]
    expect(asDate).toBeInstanceOf(Date)
    expect([asDate.getDate(), asDate.getHours()]).toEqual([2, 15])
    expect(typeof asTime).toBe("number")
    expect(new Date(asTime).getMinutes()).toBe(30)
    expect(asText).toBe("2026-11-02")
  })

  it("does not count a date edited back to its saved day", async () => {
    const day = new Date(2026, 9, 27)
    ;({ container, unsubscribe, getGrid } = await setup({
      columns: [{ id: "day", title: "Day", type: "date", isEditable: true }],
      rows: [{ id: 1, day }],
      pagination: null,
      search: null,
    }))

    edit(container.querySelector('input[aria-label="Day"]'), "2026-10-28")
    edit(container.querySelector('input[aria-label="Day"]'), "2026-10-27")

    expect(getGrid().edits).toEqual({})
  })
})
