import type { TemplateResult } from "@inglorious/web"

export interface TableColumn {
  id: string
  label?: string
  title?: string
  align?: "left" | "center" | "right"
  [key: string]: unknown
}

export type TableRow = Record<string, unknown>

export interface TableProps {
  id?: string
  type?: string
  columns?: TableColumn[]
  rows?: TableRow[]
  isFullWidth?: boolean
  isStriped?: boolean
  onRowClick?: (row: TableRow) => void
  [key: string]: unknown
}

export interface TableType {
  render(props: TableProps): TemplateResult
  renderTable(props: TableProps): TemplateResult
  renderHeaderCell(
    props: TableProps,
    payload: { column: TableColumn; index: number },
  ): TemplateResult
  renderRow(
    props: TableProps,
    payload: { row: Record<string, unknown>; index: number },
  ): TemplateResult
  renderCell(
    props: TableProps,
    payload: {
      column: TableColumn
      row: Record<string, unknown>
      index: number
      columnIndex: number
    },
  ): TemplateResult
}

export declare const Table: TableType
