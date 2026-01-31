import { classMap, html } from "@inglorious/web"

import { selectTasksCount } from "../store/selectors"

const SINGLE_TASK = 1

export const footer = {
  create(entity) {
    entity.activeFilter = "all"
  },

  filterClick(entity, id) {
    entity.activeFilter = id
  },

  render(entity, api) {
    const entities = api.getEntities()

    const tasksCount = selectTasksCount()(entities)
    const completedTasksCount = selectTasksCount("completed")(entities)
    const activeTasksCount = selectTasksCount("active")(entities)

    if (!tasksCount) return null

    return html`<footer>
      <span>
        ${activeTasksCount}
        item${activeTasksCount === SINGLE_TASK ? "" : "s"}${" "} left
      </span>

      <span class="filters">
        <a
          class=${classMap({ selected: entity.activeFilter === "all" })}
          @click=${() => api.notify("filterClick", "all")}
        >
          All
        </a>
        <a
          class=${classMap({ selected: entity.activeFilter === "active" })}
          @click=${() => api.notify("filterClick", "active")}
        >
          Active
        </a>
        <a
          class=${classMap({ selected: entity.activeFilter === "completed" })}
          @click=${() => api.notify("filterClick", "completed")}
        >
          Completed
        </a>
      </span>

      <a
        class=${classMap({ hidden: !completedTasksCount })}
        @click=${() => api.notify("clearClick")}
      >
        Clear Completed
      </a>
    </footer>`
  },
}
