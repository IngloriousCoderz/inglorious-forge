import type { TemplateResult, Api } from "@inglorious/web"

export interface TableColumn {
  id: string
  label?: string
  title?: string
  align?: "left" | "center" | "right"
  [key: string]: unknown
}

export interface TableEntity {
  id?: string
  type?: string
  columns?: TableColumn[]
  rows?: Record<string, unknown>[]
  fullWidth?: boolean
  striped?: boolean
  [key: string]: unknown
}

export interface TableType {
  render(entity: TableEntity, api: Api): TemplateResult
  renderHeaderCell(
    entity: TableEntity,
    payload: { column: TableColumn; index: number },
    api: Api,
  ): TemplateResult
  renderRow(
    entity: TableEntity,
    payload: { row: Record<string, unknown>; index: number },
    api: Api,
  ): TemplateResult
  renderCell(
    entity: TableEntity,
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
