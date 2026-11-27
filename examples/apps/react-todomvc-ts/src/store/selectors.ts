import { compute } from "@inglorious/store/select"

import type { Filter, Task, AppState } from "#types"

export const selectValue = (entities: AppState) => entities.form.value
export const selectTasks = (entities: AppState) => entities.list.tasks

export const selectTasksCount = (filter?: Filter) =>
  compute<AppState, [Task[]], number>(
    (tasks: Task[]) => getTasks(tasks, filter).length,
    [selectTasks],
  )

export const selectActiveFilter = (entities: AppState): Filter =>
  entities.footer.activeFilter

export const selectFilteredTasks = compute<AppState, [Task[], Filter], Task[]>(
  (tasks: Task[], activeFilter: Filter) => getTasks(tasks, activeFilter),
  [selectTasks, selectActiveFilter],
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
