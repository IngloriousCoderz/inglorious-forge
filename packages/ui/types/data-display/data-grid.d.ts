import type { TemplateResult, Api } from "@inglorious/web"
import type { SelectOption } from "../controls/select"

export type Row = Record<string, any>

export interface Column {
  id: string
  title: string
  type?: "string" | "number" | "boolean" | "date"
  isSortable?: boolean
  isFilterable?: boolean
  filter?: {
    type: "text" | "number" | "range" | "select" | "date" | "time" | "datetime"
    options?: SelectOption[]
    [key: string]: any
  }
  width?: number | string
  formatter?: string | ((value: any) => any)
  sortFn?: (a: Row, b: Row) => number
  filterFn?: (row: Row, filterValue: any) => boolean
  format?: (value: any) => string
  [key: string]: any
}

export interface DataGridEntity<T extends Row = Row> {
  id: string | number
  type: string
  data: T[]
  columns: Column[]
  sorts: { column: string; direction: "asc" | "desc" }[]
  filters: Record<string, any>
  search: { value: string; placeholder?: string } | null
  selection: (string | number)[]
  pagination: { page: number; pageSize: number } | null
  rowId?: string
  isMultiSelect: boolean
  [key: string]: any
}

export interface DataGridType {
  create(entity: DataGridEntity): void
  sortChange(entity: DataGridEntity, columnId: string): void
  sortsClear(entity: DataGridEntity): void
  filterChange(
    entity: DataGridEntity,
    payload: { columnId: string; value: any },
  ): void
  filtersClear(entity: DataGridEntity): void
  searchChange(entity: DataGridEntity, search: string): void
  pageChange(entity: DataGridEntity, page: number): void
  pageNext(entity: DataGridEntity): void
  pagePrev(entity: DataGridEntity): void
  pageSizeChange(entity: DataGridEntity, pageSize: number): void
  rowSelect(entity: DataGridEntity, rowId: string | number): void
  rowDeselect(entity: DataGridEntity, rowId: string | number): void
  rowToggle(entity: DataGridEntity, rowId: string | number): void
  rowsToggleAll(entity: DataGridEntity): void
  rowsSelectAll(entity: DataGridEntity): void
  selectionClear(entity: DataGridEntity): void
  render(entity: DataGridEntity, api: Api): TemplateResult
  renderHeader(entity: DataGridEntity, api: Api): TemplateResult
  renderBody(entity: DataGridEntity, api: Api): TemplateResult
  renderRow(
    entity: DataGridEntity,
    payload: { row: Row; index: number },
    api: Api,
  ): TemplateResult
  renderCell(
    entity: DataGridEntity,
    payload: { cell: any; index: number },
    api: Api,
  ): TemplateResult
  renderValue(
    entity: DataGridEntity,
    payload: { value: any; column: Column; index: number },
    api: Api,
  ): any
}
