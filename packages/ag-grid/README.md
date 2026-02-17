# @inglorious/ag-grid

AG Grid integration for Inglorious Web.

This package is intentionally thin: it provides a generic `agGrid` type and minimal adapter CSS.
Keep app-specific data mutations and domain handlers in your app types via composition.

## Install

```bash
pnpm add @inglorious/ag-grid @inglorious/web ag-grid-community
```

## Usage

```js
import { createStore } from "@inglorious/web"
import { agGrid, configureAgGrid } from "@inglorious/ag-grid"
import {
  AllCommunityModule,
  createGrid,
  ModuleRegistry,
} from "ag-grid-community"

configureAgGrid({
  createGrid,
  registerModules() {
    ModuleRegistry.registerModules([AllCommunityModule])
  },
})

const store = createStore({
  types: {
    grid: agGrid,
  },
  entities: {
    agGrid: {
      type: "grid",
      columnDefs: [],
      rowData: [],
    },
  },
})
```

```js
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-quartz.css"
```

Set sizing from entity state:

```js
{
  type: "grid",
  themeClass: "ag-theme-quartz",
  height: 520, // number (px) or CSS string like "70vh"
  gridOptions: {
    suppressCellFocus: true,
  },
  columnDefs: [],
  rowData: [],
}
```

For AG Grid Enterprise, import enterprise modules and license setup in your app, then pass the enterprise `createGrid` and module registration via `configureAgGrid(...)`.

## Event handlers

The adapter keeps a small event surface:

- `mounted` updates runtime status when the grid instance is ready.
- `rowDataChange` replaces `entity.rowData`.
- `columnDefsChange` replaces `entity.columnDefs`.
- `gridOptionsChange` replaces `entity.gridOptions`.
- `apiCall` calls a grid API method by name:

```js
api.notify("#agGrid:apiCall", { method: "sizeColumnsToFit" })
api.notify("#agGrid:apiCall", {
  method: "setFilterModel",
  args: [{ id: null }],
})
```

Backward-compatible aliases still exist (`gridMounted`, `setRowData`, `setColumnDefs`, `setGridOptions`).
