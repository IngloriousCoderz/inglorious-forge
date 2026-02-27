import { html } from "@inglorious/web"

export const rangeFilter = {
  render(entity, column, api) {
    return html`${api.render(
      `${entity.id}-filter-${column.id}Min`,
    )}${api.render(`${entity.id}-filter-${column.id}Max`)}`
  },
}
