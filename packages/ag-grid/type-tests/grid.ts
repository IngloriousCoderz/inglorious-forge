import { createStore, type EntitiesState } from "@inglorious/store"
import { createGrid } from "ag-grid-community"

import { AgGrid, type AgGridEntity, configureAgGrid } from "../types"

interface Car {
  id: string
  make: string
  price: number
}

interface CarGridEntity extends AgGridEntity<Car> {
  type: "CarGrid"
}

interface AppState extends EntitiesState<CarGridEntity> {
  cars: CarGridEntity
}

configureAgGrid({ createGrid })

export const store = createStore<CarGridEntity, AppState>({
  types: { CarGrid: AgGrid },
  entities: {
    cars: {
      type: "CarGrid",
      rowData: [{ id: "1", make: "Fiat", price: 10000 }],
      columnDefs: [{ field: "make" }, { field: "price" }],
    },
  },
})

export const wrongField: CarGridEntity = {
  type: "CarGrid",
  // @ts-expect-error: a car has no color
  columnDefs: [{ field: "color" }],
}

store.notify("#cars:apiCall", "sizeColumnsToFit")
store.notify("#cars:apiCall", {
  method: "setGridOption",
  args: ["rowHeight", 40],
})

declare const cars: CarGridEntity & { id: string }
AgGrid.apiCall(cars, "sizeColumnsToFit")
AgGrid.apiCall(cars, { method: "ensureIndexVisible", args: [3] })
// @ts-expect-error: no such grid api method
AgGrid.apiCall(cars, "nope")
// @ts-expect-error: ensureIndexVisible takes a row index
AgGrid.apiCall(cars, { method: "ensureIndexVisible", args: ["3"] })
