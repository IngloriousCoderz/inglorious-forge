import { createStore } from "@inglorious/store"
import { mount } from "@inglorious/web"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { select } from "../../controls/select"
import {
  dataGrid,
  getPaginationInfo,
  getRows,
  getSortDirection,
  getTotalRows,
  isAllSelected,
  isSomeSelected,
} from "."

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

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

const GRID_ID = "test-dataGrid"

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/**
 * Creates a store, mounts it to a detached DOM element, and waits for the
 * first render. Returns the store, the container, and convenience accessors.
 *
 * mount() calls store.notify("init") internally, which triggers the dataGrid's
 * init handler (registers child types) and then create (spawns sub-entities),
 * so by the time the returned promise resolves everything is ready.
 */
async function setup(entityOverrides = {}) {
  const store = createStore({
    types: { dataGrid, select },
    entities: {
      [GRID_ID]: {
        type: "dataGrid",
        rows: JSON.parse(JSON.stringify(sampleData)),
        columns: JSON.parse(JSON.stringify(sampleColumns)),
        pagination: { page: 0, pageSize: 2 },
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
      return e ? dataGrid.render(e, api) : null
    },
    container,
  )

  return {
    store,
    container,
    unsubscribe,
    getGrid: () => getEntity(GRID_ID),
    getPageSizeSelect: () => getEntity(`${GRID_ID}-pageSizeSelect`),
    getSearchbar: () => getEntity(`${GRID_ID}-searchbarInput`),
  }
}

// ---------------------------------------------------------------------------
// Handler tests — isolated, no store or DOM needed
// ---------------------------------------------------------------------------

describe("dataGrid / handlers", () => {
  let entity, api

  beforeEach(() => {
    const store = createStore({ types: { dataGrid, select } })
    store.notify("init")
    api = store._api

    entity = {
      id: GRID_ID,
      type: "dataGrid",
      rows: JSON.parse(JSON.stringify(sampleData)),
      columns: JSON.parse(JSON.stringify(sampleColumns)),
      pagination: { page: 0, pageSize: 2 },
      search: { value: "" },
    }
    dataGrid.create(entity, undefined, api)
  })

  describe("create()", () => {
    it("initialises default state", () => {
      const e = { rows: [{ id: 1, name: "Test" }], search: { value: "" } }
      dataGrid.create(e, undefined, api)
      expect(e.sorts).toEqual([])
      expect(e.filters).toEqual({})
      expect(e.selection).toEqual([])
      expect(e.columns[0].id).toBe("id")
      expect(e.columns[0].title).toBe("Id")
    })

    it("throws when rows do not have a valid default id key", () => {
      expect(() => dataGrid.create({ rows: [{ name: "No id" }] })).toThrow(
        'for field "id". Keys must be string or number',
      )
    })

    it("supports a custom rowId", () => {
      expect(() =>
        dataGrid.create(
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
        dataGrid.create({
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
      dataGrid.sortChange(entity, "name")
      expect(entity.sorts).toEqual([{ column: "name", direction: "asc" }])
    })

    it("toggles asc to desc", () => {
      dataGrid.sortChange(entity, "name")
      dataGrid.sortChange(entity, "name")
      expect(entity.sorts).toEqual([{ column: "name", direction: "desc" }])
    })

    it("removes the sort when toggling past desc", () => {
      dataGrid.sortChange(entity, "name")
      dataGrid.sortChange(entity, "name")
      dataGrid.sortChange(entity, "name")
      expect(entity.sorts).toEqual([])
    })

    it("resets to page 0", () => {
      entity.pagination.page = 1
      dataGrid.sortChange(entity, "name")
      expect(entity.pagination.page).toBe(0)
    })
  })

  describe("filterChange()", () => {
    it("adds a filter", () => {
      dataGrid.filterChange(entity, { columnId: "name", value: "Alice" })
      expect(entity.filters.name).toBe("Alice")
    })

    it("removes a filter when value is empty", () => {
      dataGrid.filterChange(entity, { columnId: "name", value: "Alice" })
      dataGrid.filterChange(entity, { columnId: "name", value: "" })
      expect(entity.filters.name).toBeUndefined()
    })

    it("resets to page 0", () => {
      entity.pagination.page = 1
      dataGrid.filterChange(entity, { columnId: "name", value: "Alice" })
      expect(entity.pagination.page).toBe(0)
    })
  })

  describe("searchChange()", () => {
    it("updates the search value", () => {
      dataGrid.searchChange(entity, "Ali")
      expect(entity.search.value).toBe("Ali")
    })

    it("resets to page 0", () => {
      entity.pagination.page = 1
      dataGrid.searchChange(entity, "Ali")
      expect(entity.pagination.page).toBe(0)
    })
  })

  describe("pagination", () => {
    it("pageNext: advances page", () => {
      dataGrid.pageNext(entity)
      expect(entity.pagination.page).toBe(1)
    })

    it("pageNext: does not go past the last page", () => {
      dataGrid.pageNext(entity)
      dataGrid.pageNext(entity)
      expect(entity.pagination.page).toBe(1)
    })

    it("pagePrev: goes back one page", () => {
      entity.pagination.page = 1
      dataGrid.pagePrev(entity)
      expect(entity.pagination.page).toBe(0)
    })

    it("pagePrev: does not go before page 0", () => {
      dataGrid.pagePrev(entity)
      expect(entity.pagination.page).toBe(0)
    })

    it("pageSizeChange: updates size and resets to page 0", () => {
      entity.pagination.page = 1
      dataGrid.pageSizeChange(entity, 4)
      expect(entity.pagination.pageSize).toBe(4)
      expect(entity.pagination.page).toBe(0)
    })
  })

  describe("selection", () => {
    it("rowToggle: selects an unselected row", () => {
      dataGrid.rowToggle(entity, 1)
      expect(entity.selection).toContain(1)
    })

    it("rowToggle: deselects a selected row", () => {
      entity.selection = [1]
      dataGrid.rowToggle(entity, 1)
      expect(entity.selection).not.toContain(1)
    })

    it("rowToggle: replaces selection in single-select mode", () => {
      entity.isMultiSelect = false
      entity.selection = [1]
      dataGrid.rowToggle(entity, 2)
      expect(entity.selection).toEqual([2])
    })

    it("rowsToggleAll: selects all visible rows when not all selected", () => {
      entity.selection = [1]
      dataGrid.rowsToggleAll(entity)
      expect(isAllSelected(entity)).toBe(true)
      expect(entity.selection).toContain(1)
      expect(entity.selection).toContain(2)
    })

    it("rowsToggleAll: deselects all visible rows when all selected", () => {
      entity.selection = [1, 2]
      dataGrid.rowsToggleAll(entity)
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
      dataGrid.create(e, undefined, api)
      dataGrid.rowsToggleAll(e)
      expect(e.selection).toEqual(["u1", "u2"])
    })
  })

  describe("selectors", () => {
    it("getRows: applies sort, filter and pagination in order", () => {
      dataGrid.sortChange(entity, "age")
      dataGrid.sortChange(entity, "age") // desc
      dataGrid.filterChange(entity, { columnId: "active", value: true })
      // active: Charlie(35), Alice(30), David(40) -> desc: David, Charlie, Alice -> page 0 size 2
      expect(getRows(entity).map((r) => r.name)).toEqual(["David", "Charlie"])
    })

    it("getTotalRows: counts rows after filtering", () => {
      dataGrid.filterChange(entity, { columnId: "role", value: "Admin" })
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
      dataGrid.sortChange(entity, "name")
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
      dataGrid.create(e, undefined, api)
      expect(isSomeSelected(e)).toBe(true)
      e.selection = ["u1", "u2"]
      expect(isAllSelected(e)).toBe(true)
    })
  })
})

// ---------------------------------------------------------------------------
// Template + integration tests — full end-to-end via mount()
// ---------------------------------------------------------------------------

describe("dataGrid / template", () => {
  let store, container, unsubscribe, getGrid, getPageSizeSelect, getSearchbar

  beforeEach(async () => {
    ;({
      store,
      container,
      unsubscribe,
      getGrid,
      getPageSizeSelect,
      getSearchbar,
    } = await setup())
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

    it("renders one header column per column definition", () => {
      expect(
        container.querySelectorAll(".iw-data-grid-header-column"),
      ).toHaveLength(getGrid().columns.length)
    })

    it("renders one body row per visible (paginated) item", () => {
      expect(
        container.querySelectorAll(".iw-data-grid-body .iw-data-grid-row"),
      ).toHaveLength(getRows(getGrid()).length)
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
      const buttons = [...container.querySelectorAll("button")]
      const nextBtn = buttons.find((b) => b.textContent.includes("\u276F"))
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

  describe("page size select (sub-entity integration)", () => {
    it("is created alongside the dataGrid", () => {
      expect(getPageSizeSelect()).toBeDefined()
    })

    it("selecting a page size updates the dataGrid pagination", () => {
      store.notify(`#${GRID_ID}-pageSizeSelect:optionSelect`, {
        value: 20,
        label: "20",
      })
      expect(getGrid().pagination.pageSize).toBe(20)
      expect(getGrid().pagination.page).toBe(0)
    })

    it("reflects the current pageSize as its selectedValue", () => {
      expect(getPageSizeSelect().selectedValue).toBe(2)
      store.notify(`#${GRID_ID}-pageSizeSelect:optionSelect`, {
        value: 30,
        label: "30",
      })
      expect(getPageSizeSelect().selectedValue).toBe(30)
    })

    it("renders the page size select in the footer", () => {
      expect(
        container.querySelector(".iw-data-grid-footer .iw-select"),
      ).not.toBeNull()
    })

    it("is removed from the store when the dataGrid is destroyed", () => {
      store.notify("remove", GRID_ID)
      expect(getPageSizeSelect()).toBeUndefined()
    })
  })

  describe("searchbar (sub-entity integration)", () => {
    it("is created alongside the dataGrid", () => {
      expect(getSearchbar()).toBeDefined()
    })

    it("is removed from the store when the dataGrid is destroyed", () => {
      store.notify("remove", GRID_ID)
      expect(getSearchbar()).toBeUndefined()
    })
  })
})
