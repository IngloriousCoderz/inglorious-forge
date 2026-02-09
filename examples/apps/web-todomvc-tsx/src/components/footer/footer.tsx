import { classMap } from "@inglorious/web"

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

    return (
      <footer className={classes.footer}>
        <span>
          {activeTasksCount}
          item{activeTasksCount === SINGLE_TASK ? "" : "s"} left
        </span>

        <span className={classes.filters}>
          <a
            className={classMap({
              [classes.selected]: entity.activeFilter === "all",
            })}
            onClick={() => api.notify("filterClick", "all")}
          >
            All
          </a>
          <a
            className={classMap({
              [classes.selected]: entity.activeFilter === "active",
            })}
            onClick={() => api.notify("filterClick", "active")}
          >
            Active
          </a>
          <a
            className={classMap({
              [classes.selected]: entity.activeFilter === "completed",
            })}
            onClick={() => api.notify("filterClick", "completed")}
          >
            Completed
          </a>
        </span>

        <a
          className={classMap({ [classes.hidden]: !completedTasksCount })}
          onClick={() => api.notify("clearClick")}
        >
          Clear Completed
        </a>
      </footer>
    )
  },
}
