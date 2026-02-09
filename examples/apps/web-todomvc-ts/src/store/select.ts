import { compute } from "@inglorious/web"

import type { AppState, Filter, Task } from "../../types"

export const value = (entities: AppState) => entities.form.value
export const tasks = (entities: AppState) => entities.list.tasks

export const tasksCount = (filter?: Filter) =>
  compute((tasks: Task[]) => getTasks(tasks, filter).length, [tasks])

export const activeFilter = (entities: AppState): Filter =>
  entities.footer.activeFilter

export const filteredTasks = compute(
  (tasks: Task[], activeFilter: Filter) => getTasks(tasks, activeFilter),
  [tasks, activeFilter],
)

function getTasks(tasks: Task[], filter?: Filter) {
  return tasks.filter((task) => {
    switch (filter) {
      case "active":
        return !task.completed
      case "completed":
        return task.completed
      default:
        return true
    }
  })
}
