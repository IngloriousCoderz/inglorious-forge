export const agGrid: {
  create(entity: Record<string, any>): void
  render(entity: Record<string, any>): any
  tick(entity: Record<string, any>): void
  shuffleRows(entity: Record<string, any>): void
  bumpPrices(entity: Record<string, any>): void
  addRow(entity: Record<string, any>): void
  toggleColumnSet(entity: Record<string, any>): void
  destroy(entity: Record<string, any>): void
}
