export type AgGridRuntimeConfig = {
  createGrid: (element: HTMLElement, options: Record<string, any>) => any
  registerModules?: () => void
}

export function configureAgGrid(config: AgGridRuntimeConfig): void

export type AgGridEntity = Record<string, any> & {
  height?: number | string
  gridOptions?: Record<string, any>
}

export const agGrid: {
  create(entity: AgGridEntity): void
  render(entity: AgGridEntity): any
  mounted(entity: AgGridEntity, payload?: any): void
  rowDataChange(entity: AgGridEntity, rowData: any[]): void
  columnDefsChange(entity: AgGridEntity, columnDefs: any[]): void
  gridOptionsChange(
    entity: AgGridEntity,
    gridOptions: Record<string, any>,
  ): void
  apiCall(
    entity: AgGridEntity,
    payload: string | { method: string; args?: any[] },
  ): void
  gridMounted(entity: AgGridEntity, payload?: any): void
  setRowData(entity: AgGridEntity, rowData: any[]): void
  setColumnDefs(entity: AgGridEntity, columnDefs: any[]): void
  setGridOptions(entity: AgGridEntity, gridOptions: Record<string, any>): void
  destroy(entity: AgGridEntity): void
}
