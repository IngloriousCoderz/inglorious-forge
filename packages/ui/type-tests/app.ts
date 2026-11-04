import {
  type BaseEntity,
  createStore,
  type EntitiesState,
  type EntityType,
} from "@inglorious/store"
import type { Api } from "@inglorious/web"

import {
  Button,
  Chip,
  ChipPicker,
  ConfirmDialog,
  CropDialog,
  type DataGridProps,
  Flex,
  IconButton,
  Input,
  Lightbox,
  LoadStatus,
} from "../types"
import {
  Combobox,
  filterOptions,
  getOptionValue,
} from "../types/controls/combobox"
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

export const store = createStore<AppEntity, AppState>({
  types: { DataGrid, Cropper: ImageCropper, List: VirtualList, Counter },
  entities: { counter: { type: "Counter", value: 0 } },
})

export const transitioned = createStore<AppEntity, AppState>({
  types: { Counter },
  entities: { counter: { type: "Counter", value: 0 } },
  middlewares: [withTransitions({ routes: ["detail"] })],
})
// @ts-expect-error: routes are names or a predicate
withTransitions({ routes: 42 })
withTransitions({
  direction: ({ type, to }) => (to.route === "detail" ? "forward" : type),
})
// @ts-expect-error: a direction is forward, back or replace
withTransitions({ direction: () => "sideways" })

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

declare const cropper: CropperEntity
export const cropped: Promise<Blob> = cropImage(new Blob(), cropper.rect, {
  aspectRatio: 1,
  maxWidth: 512,
})
// @ts-expect-error: a rect has all four sides
cropImage(new Blob(), { x: 0, y: 0 })

const icon = Button.render({ children: "x" })

export const flex = Flex.render({
  element: "form",
  className: "stack",
  style: "gap: 1rem",
  "data-tier": "gold",
  children: [icon, "text", 1, null],
  onClick: (event) => event.preventDefault(),
})
// @ts-expect-error: not a direction
Flex.render({ direction: "sideways" })
// @ts-expect-error: not an element
Flex.render({ element: "nope" })

export const iconButton = IconButton.render({
  icon,
  shape: "round",
  className: "fab",
  onClick: (event) => event.stopPropagation(),
})
// @ts-expect-error: primary is a color, not a variant
IconButton.render({ variant: "primary" })
// @ts-expect-error: primary is a color, not a variant
Button.render({ variant: "primary" })

export const input = Input.render({ icon, iconAfter: icon })
// @ts-expect-error: an icon is not a number
Input.render({ icon: 1 })

export const filtered = filterOptions(["a"], "a").map(getOptionValue)
// @ts-expect-error: the term is a string
filterOptions(["a"], 1)

export const picker = ChipPicker.render({
  options: ["a", { value: 1, label: "One" }],
  value: [1],
  onToggle: (value: string | number) => value,
})
// @ts-expect-error: the picked values are a list
ChipPicker.render({ value: "a" })

export const confirm = ConfirmDialog.render({
  confirmLabel: "Delete",
  tone: "primary",
})
// @ts-expect-error: the confirm button needs a label
ConfirmDialog.render({ isOpen: true })

export const crop = CropDialog.render(
  { cropperId: "cropper", onApply: (rect) => rect.w },
  api,
)
// @ts-expect-error: it names the cropper it shows
CropDialog.render({}, api)

export const lightbox = Lightbox.render({
  images: ["/a.jpg", { src: "/b.jpg", alt: "B" }],
  onStep: (step) => step,
})
// @ts-expect-error: an image has a src
Lightbox.render({ images: [{ alt: "B" }] })

export const status = LoadStatus.render({ isEmpty: true, emptyText: "None" })

declare const combobox: Parameters<typeof Combobox.create>[0]
Combobox.valueSet(combobox, ["a"])
Combobox.optionSelect(combobox, "a", api)
export const fieldCombobox = {
  changeEvent: "#form:fieldChange",
  changePayload: { path: "country" },
} satisfies Parameters<typeof Combobox.create>[0]
