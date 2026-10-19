// Type-level tests: `tsc -p type-tests` fails on any error, and on any
// `@ts-expect-error` whose error does not happen.

import {
  type BaseEntity,
  createStore,
  type EntitiesState,
  type EntityType,
} from "@inglorious/store"
import type { Api } from "@inglorious/web"

import { Button, Chip, type DataGridProps } from "../types"
import { DataGrid, getRows } from "../types/data-display/data-grid"
import {
  VirtualList,
  type VirtualListEntity,
} from "../types/data-display/virtual-list"
import { Tabs } from "../types/navigation/tabs"

interface GridEntity extends DataGridProps<{ name: string }> {
  type: "DataGrid"
}
interface ListEntity extends VirtualListEntity {
  type: "List"
}
interface CounterEntity extends BaseEntity {
  type: "Counter"
  value: number
}

type AppEntity = GridEntity | ListEntity | CounterEntity

interface AppState extends EntitiesState<AppEntity> {
  grid: GridEntity
  list: ListEntity
  counter: CounterEntity
}

type AppApi = Api<AppEntity, AppState>

// A type wrapping a component passes it callbacks, which entities never hold
const Counter = {
  increment(entity) {
    entity.value++
  },
  render(entity, api) {
    // @ts-expect-error: the api is typed in render too
    api.getEntity("counter")?.nope
    return Button.render({
      color: "default",
      children: Chip.render({ children: String(entity.value) }),
      onClick: () => api.notify(`#${entity.id}:increment`),
    })
  },
} satisfies EntityType<CounterEntity, AppApi>

// Stateful components register under the app's names, with no cast
export const store = createStore<AppEntity, AppState>({
  types: { DataGrid, List: VirtualList, Counter },
  entities: { counter: { type: "Counter", value: 0 } },
})

// An app's Api is the Api components take
declare const api: AppApi
declare const grid: GridEntity
DataGrid.render(grid, api)
export const names: string[] = getRows(grid).map((row) => row.name)
export const tabs = Tabs.render({ value: null })
