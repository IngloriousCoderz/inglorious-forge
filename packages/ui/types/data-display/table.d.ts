import type { TemplateResult, Api } from "@inglorious/web"

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
  fullWidth?: boolean
  striped?: boolean
  onRowClick?: (row: TableRow) => void
  [key: string]: unknown
}

export interface TableType {
  render(entity: TableProps, api: Api): TemplateResult
  renderHeaderCell(
    entity: TableProps,
    payload: { column: TableColumn; index: number },
    api: Api,
  ): TemplateResult
  renderRow(
    entity: TableProps,
    payload: { row: Record<string, unknown>; index: number },
    api: Api,
  ): TemplateResult
  renderCell(
    entity: TableProps,
    payload: {
      column: TableColumn
      row: Record<string, unknown>
      index: number
      columnIndex: number
    },
    api: Api,
  ): TemplateResult
}

export declare const table: TableType
