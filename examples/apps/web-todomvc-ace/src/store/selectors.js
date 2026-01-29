import { compute } from "@inglorious/web"

export const selectValue = (entities) => entities.form.value
export const selectTasks = (entities) => entities.list.tasks

export const selectTasksCount = (filter) =>
  compute((tasks) => getTasks(tasks, filter).length, [selectTasks])

export const selectActiveFilter = (entities) => entities.footer.activeFilter

export const selectFilteredTasks = compute(
  (tasks, activeFilter) => getTasks(tasks, activeFilter),
  [selectTasks, selectActiveFilter],
)

function getTasks(tasks, filter) {
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
