import { classMap, html } from "@inglorious/web"

import type { FooterType } from "../../../types"
import { tasksCount } from "../../store/select"
import classes from "./footer.module.css"

const SINGLE_TASK = 1

export const footer: FooterType = {
  create(entity) {
    entity.activeFilter = "all"
  },

  filterClick(entity, id) {
    entity.activeFilter = id
  },

  clearClick(entity) {
    entity.activeFilter = "all"
  },

  render(entity, api) {
    const allTasksCount = api.select(tasksCount())
    const completedTasksCount = api.select(tasksCount("completed"))
    const activeTasksCount = api.select(tasksCount("active"))

    if (!allTasksCount) return null

    return html`<footer class=${classes.footer}>
      <span>
        ${activeTasksCount}
        item${activeTasksCount === SINGLE_TASK ? "" : "s"}${" "} left
      </span>

      <span class=${classes.filters}>
        <a
          class=${classMap({
            [classes.selected]: entity.activeFilter === "all",
          })}
          @click=${() => api.notify("filterClick", "all")}
        >
          All
        </a>
        <a
          class=${classMap({
            [classes.selected]: entity.activeFilter === "active",
          })}
          @click=${() => api.notify("filterClick", "active")}
        >
          Active
        </a>
        <a
          class=${classMap({
            [classes.selected]: entity.activeFilter === "completed",
          })}
          @click=${() => api.notify("filterClick", "completed")}
        >
          Completed
        </a>
      </span>

      <a
        class=${classMap({ [classes.hidden]: !completedTasksCount })}
        @click=${() => api.notify("clearClick")}
      >
        Clear Completed
      </a>
    </footer>`
  },
}
