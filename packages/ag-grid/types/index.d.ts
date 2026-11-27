import type { BaseEntity, Stored } from "@inglorious/store"
import type { Api, TemplateResult } from "@inglorious/web"
import type {
  ColDef,
  ColGroupDef,
  GridApi,
  GridOptions,
} from "ag-grid-community"

/** How the grid is made: AG Grid's own `createGrid`, and the modules it needs. */
export type AgGridRuntimeConfig = {
  createGrid: <TData>(
    element: HTMLElement,
    options: GridOptions<TData>,
  ) => GridApi<TData>
  registerModules?: () => void
}

export function configureAgGrid(config: AgGridRuntimeConfig): void

/**
 * An AG Grid entity, for rows of `TData`. `create` fills in what is left out:
 * the row id from `id`, the Quartz theme, a height of 520 pixels, sortable
 * and filterable columns.
 */
export interface AgGridEntity<TData = any> extends BaseEntity {
  rowData?: TData[]
  columnDefs?: (ColDef<TData> | ColGroupDef<TData>)[]
  /** Merged over the default: filterable, sortable, resizable flexible columns. */
  defaultColDef?: ColDef<TData>
  /** Any other grid option. `getRowId` defaults to the row's `rowIdField`. */
  gridOptions?: GridOptions<TData>
  /** The field that identifies a row. Defaults to `"id"`. */
  rowIdField?: string
  /** Defaults to `"ag-theme-quartz"`. */
  themeClass?: string
  /** Pixels, or any CSS height. Defaults to 520. */
  height?: number | string
  /** Set once the grid is mounted. */
  gridApiId?: number | null
  gridStatus?: "mounting" | "mounted"
}

type GridApiMethod<TData> = {
  [K in keyof GridApi<TData>]: GridApi<TData>[K] extends (
    ...args: never[]
  ) => unknown
    ? K
    : never
}[keyof GridApi<TData>]

/** A grid api method to call: its name, or its name and arguments. */
export type AgGridApiCall<TData = any> =
  | GridApiMethod<TData>
  | {
      [K in GridApiMethod<TData>]: {
        method: K
        args?: Parameters<
          Extract<GridApi<TData>[K], (...args: never[]) => unknown>
        >
      }
    }[GridApiMethod<TData>]

export type AgGridType<TData = any> = {
  create(entity: AgGridEntity<TData>): void
  render(entity: Stored<AgGridEntity<TData>>, api: Api): TemplateResult
  mounted(entity: AgGridEntity<TData>, payload: { gridApiId: number }): void
  rowDataChange(entity: AgGridEntity<TData>, rowData: TData[]): void
  columnDefsChange(
    entity: AgGridEntity<TData>,
    columnDefs: (ColDef<TData> | ColGroupDef<TData>)[],
  ): void
  gridOptionsChange(
    entity: AgGridEntity<TData>,
    gridOptions: GridOptions<TData>,
  ): void
  /** Calls a method of the entity's grid api, once it is mounted. */
  apiCall(
    entity: Stored<AgGridEntity<TData>>,
    payload: AgGridApiCall<TData>,
  ): void
  /** Alias of `mounted`. */
  gridMounted: AgGridType<TData>["mounted"]
  /** Alias of `rowDataChange`. */
  setRowData: AgGridType<TData>["rowDataChange"]
  /** Alias of `columnDefsChange`. */
  setColumnDefs: AgGridType<TData>["columnDefsChange"]
  /** Alias of `gridOptionsChange`. */
  setGridOptions: AgGridType<TData>["gridOptionsChange"]
  destroy(entity: Stored<AgGridEntity<TData>>): void
}

export declare const AgGrid: AgGridType
