import { describe, expect, it } from "vitest"

import {
  apiCall,
  columnDefsChange,
  create,
  gridMounted,
  gridOptionsChange,
  mounted,
  rowDataChange,
  setColumnDefs,
  setGridOptions,
  setRowData,
} from "./handlers.js"

describe("handlers", () => {
  it("initializes default entity values", () => {
    const entity = { id: "grid-1" }

    create(entity)

    expect(entity.rowIdField).toBe("id")
    expect(entity.themeClass).toBe("ag-theme-quartz")
    expect(entity.height).toBe(520)
    expect(entity.gridStatus).toBe("mounting")
    expect(entity.rowData).toEqual([])
    expect(entity.columnDefs).toEqual([])
    expect(entity.gridOptions).toEqual({})
    expect(entity.defaultColDef).toEqual(
      expect.objectContaining({
        filter: true,
        floatingFilter: true,
        sortable: true,
      }),
    )
  })

  it("keeps custom defaults when provided", () => {
    const entity = {
      id: "grid-1",
      rowIdField: "customId",
      themeClass: "ag-theme-alpine",
      height: "70vh",
      defaultColDef: { sortable: false, minWidth: 200 },
      rowData: [{ id: 1 }],
      columnDefs: [{ field: "id" }],
      gridOptions: { suppressCellFocus: true },
    }

    create(entity)

    expect(entity.rowIdField).toBe("customId")
    expect(entity.themeClass).toBe("ag-theme-alpine")
    expect(entity.height).toBe("70vh")
    expect(entity.defaultColDef.sortable).toBe(false)
    expect(entity.defaultColDef.minWidth).toBe(200)
    expect(entity.rowData).toEqual([{ id: 1 }])
    expect(entity.columnDefs).toEqual([{ field: "id" }])
    expect(entity.gridOptions).toEqual({ suppressCellFocus: true })
  })

  it("applies mounted and data change handlers", () => {
    const entity = { id: "grid-1", gridStatus: "mounting" }
    const rowData = [{ id: 1 }]
    const columnDefs = [{ field: "id" }]
    const gridOptions = { suppressMovableColumns: true }

    mounted(entity, { gridApiId: 7 })
    rowDataChange(entity, rowData)
    columnDefsChange(entity, columnDefs)
    gridOptionsChange(entity, gridOptions)

    expect(entity.gridApiId).toBe(7)
    expect(entity.gridStatus).toBe("mounted")
    expect(entity.rowData).toBe(rowData)
    expect(entity.columnDefs).toBe(columnDefs)
    expect(entity.gridOptions).toBe(gridOptions)
  })

  it("exposes backward-compatible aliases", () => {
    expect(gridMounted).toBe(mounted)
    expect(setRowData).toBe(rowDataChange)
    expect(setColumnDefs).toBe(columnDefsChange)
    expect(setGridOptions).toBe(gridOptionsChange)
  })

  it("apiCall does not throw when grid does not exist", () => {
    const entity = { id: "missing-grid" }
    expect(() => apiCall(entity, { method: "sizeColumnsToFit" })).not.toThrow()
  })
})
