import { classMap } from "@inglorious/web"

import { tasksCount } from "../store/selectors"

const SINGLE_TASK = 1

export const footer = {
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

    return (
      <footer>
        <span>
          {activeTasksCount}
          item{activeTasksCount === SINGLE_TASK ? "" : "s"} left
        </span>

        <span className="filters">
          <a
            className={classMap({ selected: entity.activeFilter === "all" })}
            onClick={() => api.notify("filterClick", "all")}
          >
            All
          </a>
          <a
            className={classMap({ selected: entity.activeFilter === "active" })}
            onClick={() => api.notify("filterClick", "active")}
          >
            Active
          </a>
          <a
            className={classMap({
              selected: entity.activeFilter === "completed",
            })}
            onClick={() => api.notify("filterClick", "completed")}
          >
            Completed
          </a>
        </span>

        <a
          className={classMap({ hidden: !completedTasksCount })}
          onClick={() => api.notify("clearClick")}
        >
          Clear Completed
        </a>
      </footer>
    )
  },
}
