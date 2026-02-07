import type { AppTypes, Task } from "../../types"

const TASKS_TO_REMOVE = 1
const DEFAULT_ID = 1
const LAST_TASK = 1
const NEXT_ID = 1

export const types: AppTypes = {
  form: {
    inputChange(entity, value) {
      if (entity.type !== "form") return
      entity.value = value
    },

    formSubmit(entity) {
      if (entity.type !== "form") return
      entity.value = ""
    },
  },

  list: {
    formSubmit(entity, value) {
      if (entity.type !== "list") return
      entity.tasks.push({ id: nextId(entity.tasks), text: value })
    },

    toggleClick(entity, id) {
      if (entity.type !== "list") return
      const task = entity.tasks.find((task) => task.id === id)!
      task.completed = !task.completed
    },

    deleteClick(entity, id) {
      if (entity.type !== "list") return
      const index = entity.tasks.findIndex((task) => task.id === id)
      entity.tasks.splice(index, TASKS_TO_REMOVE)
    },

    clearClick(entity) {
      if (entity.type !== "list") return
      entity.tasks = entity.tasks.filter((task) => !task.completed)
    },
  },

  footer: {
    filterClick(entity, id) {
      if (entity.type !== "footer") return
      entity.activeFilter = id
    },

    clearClick(entity) {
      entity.activeFilter = "all"
    },
  },
}

function nextId(tasks: Task[]): number {
  if (!tasks.length) return DEFAULT_ID
  return tasks[tasks.length - LAST_TASK].id + NEXT_ID
}
