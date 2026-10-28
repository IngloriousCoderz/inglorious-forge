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
import {
  cropImage,
  ImageCropper,
  type ImageCropperProps,
} from "../types/controls/image-cropper"
import {
  DataGrid,
  getEditCount,
  getEditedRows,
  getRows,
} from "../types/data-display/data-grid"
import {
  VirtualList,
  type VirtualListEntity,
} from "../types/data-display/virtual-list"
import { Tabs } from "../types/navigation/tabs"
import { withTransitions } from "../types/navigation/view-transitions"

interface GridEntity extends DataGridProps<{ name: string }> {
  type: "DataGrid"
}
interface CropperEntity extends ImageCropperProps {
  type: "Cropper"
}
interface ListEntity extends VirtualListEntity {
  type: "List"
}
interface CounterEntity extends BaseEntity {
  type: "Counter"
  value: number
}

type AppEntity = GridEntity | CropperEntity | ListEntity | CounterEntity

interface AppState extends EntitiesState<AppEntity> {
  grid: GridEntity
  cropper: CropperEntity
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
  types: { DataGrid, Cropper: ImageCropper, List: VirtualList, Counter },
  entities: { counter: { type: "Counter", value: 0 } },
})

// withTransitions is a middleware for the app's typed store
export const transitioned = createStore<AppEntity, AppState>({
  types: { Counter },
  entities: { counter: { type: "Counter", value: 0 } },
  middlewares: [withTransitions({ routes: ["detail"] })],
})
// @ts-expect-error: routes are names or a predicate
withTransitions({ routes: 42 })

// An app's Api is the Api components take
declare const api: AppApi
declare const grid: GridEntity
DataGrid.render(grid, api)
export const names: string[] = getRows(grid).map((row) => row.name)
export const editCount: number = getEditCount(grid)
export const saved: string[] = getEditedRows(grid).map((row) => row.name)
DataGrid.cellChange(grid, { rowId: "1", columnId: "name", value: "Ada" })
// @ts-expect-error: an edit names its column
DataGrid.cellChange(grid, { rowId: "1", value: "Ada" })
export const tabs = Tabs.render({ value: null })

// The crop rect the cropper reports is what cropImage takes
declare const cropper: CropperEntity
export const cropped: Promise<Blob> = cropImage(new Blob(), cropper.rect, {
  aspectRatio: 1,
  maxWidth: 512,
})
// @ts-expect-error: a rect has all four sides
cropImage(new Blob(), { x: 0, y: 0 })
