import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"

import { tasksCount } from "@/store/select"
import type { FooterType } from "#types"

import classes from "./footer.module.css"

const SINGLE_TASK = 1

export const Footer: FooterType = {
  create(entity) {
    entity.activeFilter = "all"
  },

  filterChange(entity, id) {
    entity.activeFilter = id
  },

  completedClear(entity) {
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
          @click=${() => api.notify("filterChange", "all")}
        >
          All
        </a>
        <a
          class=${classMap({
            [classes.selected]: entity.activeFilter === "active",
          })}
          @click=${() => api.notify("filterChange", "active")}
        >
          Active
        </a>
        <a
          class=${classMap({
            [classes.selected]: entity.activeFilter === "completed",
          })}
          @click=${() => api.notify("filterChange", "completed")}
        >
          Completed
        </a>
      </span>

      <a
        class=${classMap({ [classes.hidden]: !completedTasksCount })}
        @click=${() => api.notify("completedClear")}
      >
        Clear Completed
      </a>
    </footer>`
  },
}
