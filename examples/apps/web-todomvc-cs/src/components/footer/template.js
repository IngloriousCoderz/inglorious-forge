import { classMap, html } from "@inglorious/web"

import { selectTasksCount } from "@/store/selectors"

import classes from "./footer.module.css"

const SINGLE_TASK = 1

export function render(entity, api) {
  const entities = api.getEntities()

  const tasksCount = selectTasksCount()(entities)
  const completedTasksCount = selectTasksCount("completed")(entities)
  const activeTasksCount = selectTasksCount("active")(entities)

  if (!tasksCount) return null

  return html`<footer class=${classes.footer}>
    <span>
      ${activeTasksCount}
      item${activeTasksCount === SINGLE_TASK ? "" : "s"}${" "} left
    </span>

    <span class=${classes.filters}>
      <a
        class=${classMap({ [classes.selected]: entity.activeFilter === "all" })}
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
}
