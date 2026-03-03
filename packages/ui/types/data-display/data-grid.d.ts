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

export interface DataGridProps<T extends Row = Row> {
  id: string | number
  type: string
  data: T[]
  columns: Column[]
  sorts: { column: string; direction: "asc" | "desc" }[]
  filters: Record<string, any>
  search: { value: string; placeholder?: string } | null
  selection: (string | number)[]
  pagination?: { page: number; pageSize: number; pageSizes: number[] } | null
  rowId?: string
  isMultiSelect: boolean
  onMount?: (element: HTMLElement) => void
  onSortChange?: (columnId: string) => void
  onFilterChange?: (payload: { columnId: string; value: any }) => void
  onSearchChange?: (value: string) => void
  onRowToggle?: (rowId: string | number) => void
  onPageChange?: (page: number) => void
  onPageNext?: () => void
  onPagePrev?: () => void
  onPageSizeChange?: (pageSize: number) => void
  [key: string]: any
}

export interface DataGridType {
  create(entity: DataGridProps): void
  sortChange(entity: DataGridProps, columnId: string): void
  sortsClear(entity: DataGridProps): void
  filterChange(
    entity: DataGridProps,
    payload: { columnId: string; value: any },
  ): void
  filtersClear(entity: DataGridProps): void
  searchChange(entity: DataGridProps, search: string): void
  pageChange(entity: DataGridProps, page: number): void
  pageNext(entity: DataGridProps): void
  pagePrev(entity: DataGridProps): void
  pageSizeChange(entity: DataGridProps, pageSize: number): void
  rowSelect(entity: DataGridProps, rowId: string | number): void
  rowDeselect(entity: DataGridProps, rowId: string | number): void
  rowToggle(entity: DataGridProps, rowId: string | number): void
  rowsToggleAll(entity: DataGridProps): void
  rowsSelectAll(entity: DataGridProps): void
  selectionClear(entity: DataGridProps): void
  render(entity: DataGridProps, api: Api): TemplateResult
  renderHeader(entity: DataGridProps, api: Api): TemplateResult
  renderBody(entity: DataGridProps, api: Api): TemplateResult
  renderRow(
    entity: DataGridProps,
    payload: { row: Row; index: number },
    api: Api,
  ): TemplateResult
  renderCell(
    entity: DataGridProps,
    payload: { cell: any; index: number },
    api: Api,
  ): TemplateResult
  renderValue(
    entity: DataGridProps,
    payload: { value: any; column: Column; index: number },
    api: Api,
  ): any
}
