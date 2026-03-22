import type { TemplateResult, Api } from "@inglorious/web"
import type { SelectOption } from "../controls/select"

export type Row = Record<string, any>

export interface DataGridVirtualization {
  /** The current scroll position from the top in pixels. */
  scrollTop: number

  /** The start and end indices of the currently visible items (including buffer). */
  visibleRange: { start: number; end: number }

  /** The height of the visible viewport in pixels. */
  viewportHeight: number

  /** The number of items to render outside the viewport (above and below). */
  bufferSize: number

  /** The measured height of a single row in pixels. Null until measured on mount. */
  itemHeight: number | null

  /** An estimated height for rows used for calculations before they are measured. */
  estimatedHeight: number
}

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
  /**
   * Column width semantics:
   * - `auto` or `undefined`: flexible column (`1fr`)
   * - `<n>fr`: proportional flex width
   * - `<n>%`: literal percentage width
   * - number / CSS length string: fixed width
   */
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
  isStriped?: boolean
  isVirtualized?: boolean
  virtualization?: DataGridVirtualization
  selection: (string | number)[]
  selectionAnchor?: string | number | null
  pagination?: { page: number; pageSize: number; pageSizes: number[] } | null
  rowId?: string
  isMultiSelect: boolean
  onSortChange?: (columnId: string) => void
  onFilterChange?: (payload: { columnId: string; value: any }) => void
  onSearchChange?: (value: string) => void
  onColumnResizeStart?: (payload: {
    columnId: string
    event: PointerEvent
    width: number
  }) => void
  onRowClick?: (payload: {
    rowId: string | number
    shiftKey?: boolean
    metaKey?: boolean
    ctrlKey?: boolean
  }) => void
  onVirtualScroll?: (containerEl: HTMLElement) => void
  onVirtualMount?: (containerEl: HTMLElement) => void
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
  columnResize(
    entity: DataGridProps,
    payload: { columnId: string; width: number },
  ): void
  pageChange(entity: DataGridProps, page: number): void
  pageNext(entity: DataGridProps): void
  pagePrev(entity: DataGridProps): void
  pageSizeChange(entity: DataGridProps, pageSize: number): void
  rowClick(
    entity: DataGridProps,
    payload: {
      rowId: string | number
      shiftKey?: boolean
      metaKey?: boolean
      ctrlKey?: boolean
    },
  ): void
  rowSelect(entity: DataGridProps, rowId: string | number): void
  rowDeselect(entity: DataGridProps, rowId: string | number): void
  rowToggle(entity: DataGridProps, rowId: string | number): void
  rowsToggleAll(entity: DataGridProps): void
  rowsSelectAll(entity: DataGridProps): void
  selectionClear(entity: DataGridProps): void
  virtualScroll(entity: DataGridProps, containerEl: HTMLElement): void
  virtualMount(entity: DataGridProps, containerEl: HTMLElement): void
  render(entity: DataGridProps, api: Api): TemplateResult
  renderHeader(entity: DataGridProps, api: Api): TemplateResult
  renderToolbar(entity: DataGridProps, api: Api): TemplateResult
  renderHeaderColumn(
    entity: DataGridProps,
    payload: { column: Column; index: number },
    api: Api,
  ): TemplateResult
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
