---
title: AG Grid (No Adapter)
description: Integrate AG Grid directly in Inglorious Web without a dedicated adapter package.
---

# AG Grid (No Adapter)

If your team prefers zero abstraction, you can mount AG Grid directly from an Inglorious Web type.

## When this is enough

- You only have one or two grid screens.
- You want full direct access to AG Grid API and options.
- You do not need a reusable adapter layer.

## Minimal direct integration

```js
import { html, ref } from "@inglorious/web"
import {
  AllCommunityModule,
  createGrid,
  ModuleRegistry,
} from "ag-grid-community"

ModuleRegistry.registerModules([AllCommunityModule])

const gridInstances = new Map()

export const gridType = {
  create(entity) {
    entity.themeClass ??= "ag-theme-quartz"
    entity.height ??= 520
    entity.rowData ??= []
    entity.columnDefs ??= []
  },

  render(entity) {
    const height =
      typeof entity.height === "number" ? `${entity.height}px` : entity.height

    return html`
      <div
        class="${entity.themeClass}"
        style="width: 100%; height: ${height};"
        ${ref((el) => {
          if (!el) return

          const current = gridInstances.get(entity.id)
          if (!current) {
            const api = createGrid(el, {
              rowData: entity.rowData,
              columnDefs: entity.columnDefs,
            })
            gridInstances.set(entity.id, { api, el })
            return
          }

          if (current.el !== el) {
            current.api.destroy()
            const api = createGrid(el, {
              rowData: entity.rowData,
              columnDefs: entity.columnDefs,
            })
            gridInstances.set(entity.id, { api, el })
            return
          }

          current.api.updateGridOptions({
            rowData: entity.rowData,
            columnDefs: entity.columnDefs,
          })
        })}
      ></div>
    `
  },

  destroy(entity) {
    const current = gridInstances.get(entity.id)
    if (!current) return
    current.api.destroy()
    gridInstances.delete(entity.id)
  },
}
```

## CSS imports

```js
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-quartz.css"
```

## Trade-off vs adapter package

- Direct recipe: less code upfront, maximum control.
- Adapter package: reusable lifecycle patterns and consistent event surface across apps.
