import { html, repeat } from "@inglorious/web"

import {
  generateData,
  MAX_VALUE,
  ROWS_TO_GENERATE,
  ROWS_TO_UPDATE,
  updateData,
} from "../../data"
import { filteredRows } from "../store/select"
import { row } from "./row"

export const table = {
  create(entity) {
    entity.data = generateData(ROWS_TO_GENERATE)
  },

  randomUpdate(entity) {
    entity.data = updateData(entity.data, ROWS_TO_UPDATE)
  },

  click(entity, id) {
    const index = entity.data.findIndex((row) => row.id === id)
    entity.data[index].value = Math.floor(Math.random() * MAX_VALUE)
  },

  render(entity, api) {
    const rows = api.select(filteredRows)

    return html`
      <table>
        <thead>
          <tr>
            <th @click=${() => api.notify("#metrics:setSort", "id")}>ID</th>
            <th>Name</th>
            <th @click=${() => api.notify("#metrics:setSort", "value")}>
              Value
            </th>
            <th>Status</th>
            <th @click=${() => api.notify("#metrics:setSort", "progress")}>
              Progress
            </th>
          </tr>
        </thead>
        <tbody>
          ${repeat(
            rows,
            (r) => r.id,
            (r) => html`${row.render(r, api)}`,
          )}
        </tbody>
      </table>
    `
  },
}
