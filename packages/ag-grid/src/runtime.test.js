import { describe, expect, it, vi } from "vitest"

import { callGridApi, destroyGrid, mountOrUpdateGrid } from "./runtime.js"
import { configureAgGrid } from "./runtime-config.js"

function createEntity(id) {
  return {
    id,
    rowIdField: "id",
    defaultColDef: { sortable: true },
    rowData: [{ id: 1, name: "Alpha" }],
    columnDefs: [{ field: "name" }],
    gridOptions: { suppressCellFocus: true },
  }
}

describe("runtime", () => {
  it("mounts grid and emits mounted event", async () => {
    const createGrid = vi.fn(() => ({
      destroy: vi.fn(),
      updateGridOptions: vi.fn(),
    }))
    const registerModules = vi.fn()
    const notify = vi.fn()
    const entity = createEntity("grid-runtime-1")
    const element = {}

    configureAgGrid({ createGrid, registerModules })
    mountOrUpdateGrid(entity, element, { notify })
    await Promise.resolve()

    expect(registerModules).toHaveBeenCalledTimes(1)
    expect(createGrid).toHaveBeenCalledTimes(1)
    expect(createGrid).toHaveBeenCalledWith(
      element,
      expect.objectContaining({
        defaultColDef: entity.defaultColDef,
        rowData: entity.rowData,
        columnDefs: entity.columnDefs,
        suppressCellFocus: true,
      }),
    )
    expect(notify).toHaveBeenCalledWith("#grid-runtime-1:mounted", {
      gridApiId: expect.any(Number),
    })
  })

  it("updates grid options only when tracked values change", async () => {
    const updateGridOptions = vi.fn()
    const createGrid = vi.fn(() => ({
      destroy: vi.fn(),
      updateGridOptions,
    }))
    const notify = vi.fn()
    const entity = createEntity("grid-runtime-2")
    const element = {}

    configureAgGrid({ createGrid })

    mountOrUpdateGrid(entity, element, { notify })
    await Promise.resolve()
    mountOrUpdateGrid(entity, element, { notify })

    expect(updateGridOptions).not.toHaveBeenCalled()

    entity.rowData = [...entity.rowData, { id: 2, name: "Beta" }]
    mountOrUpdateGrid(entity, element, { notify })

    expect(updateGridOptions).toHaveBeenCalledTimes(1)
    expect(updateGridOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        rowData: entity.rowData,
        columnDefs: entity.columnDefs,
      }),
    )
  })

  it("calls underlying grid api methods via apiCall payload", async () => {
    const sizeColumnsToFit = vi.fn()
    const setFilterModel = vi.fn()
    const createGrid = vi.fn(() => ({
      destroy: vi.fn(),
      updateGridOptions: vi.fn(),
      sizeColumnsToFit,
      setFilterModel,
    }))
    const entity = createEntity("grid-runtime-3")
    const element = {}

    configureAgGrid({ createGrid })
    mountOrUpdateGrid(entity, element, { notify: vi.fn() })
    await Promise.resolve()

    callGridApi(entity.id, "sizeColumnsToFit")
    callGridApi(entity.id, {
      method: "setFilterModel",
      args: [{ id: null }],
    })

    expect(sizeColumnsToFit).toHaveBeenCalledTimes(1)
    expect(setFilterModel).toHaveBeenCalledWith({ id: null })
  })

  it("destroys mounted grid instances", async () => {
    const destroy = vi.fn()
    const createGrid = vi.fn(() => ({
      destroy,
      updateGridOptions: vi.fn(),
    }))
    const entity = createEntity("grid-runtime-4")
    const element = {}

    configureAgGrid({ createGrid })
    mountOrUpdateGrid(entity, element, { notify: vi.fn() })
    await Promise.resolve()

    destroyGrid(entity.id)
    expect(destroy).toHaveBeenCalledTimes(1)

    callGridApi(entity.id, "sizeColumnsToFit")
    expect(destroy).toHaveBeenCalledTimes(1)
  })
})
