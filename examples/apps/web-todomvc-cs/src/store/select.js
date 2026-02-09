import { compute } from "@inglorious/web"

export const value = (entities) => entities.form.value
export const tasks = (entities) => entities.list.tasks

export const tasksCount = (filter) =>
  compute((tasks) => getTasks(tasks, filter).length, [tasks])

export const activeFilter = (entities) => entities.footer.activeFilter

export const filteredTasks = compute(
  (tasks, activeFilter) => getTasks(tasks, activeFilter),
  [tasks, activeFilter],
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
