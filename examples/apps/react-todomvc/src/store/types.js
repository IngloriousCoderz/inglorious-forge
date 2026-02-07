const TASKS_TO_REMOVE = 1
const DEFAULT_ID = 1
const LAST_TASK = 1
const NEXT_ID = 1

export const types = {
  form: {
    inputChange(entity, value) {
      entity.value = value
    },

    formSubmit(entity) {
      entity.value = ""
    },
  },

  list: {
    formSubmit(entity, value) {
      entity.tasks.push({ id: nextId(entity.tasks), text: value })
    },

    toggleClick(entity, id) {
      const task = entity.tasks.find((task) => task.id === id)
      task.completed = !task.completed
    },

    deleteClick(entity, id) {
      const index = entity.tasks.findIndex((task) => task.id === id)
      entity.tasks.splice(index, TASKS_TO_REMOVE)
    },

    clearClick(entity) {
      entity.tasks = entity.tasks.filter((task) => !task.completed)
    },
  },

  footer: {
    filterClick(entity, id) {
      entity.activeFilter = id
    },

    clearClick(entity) {
      entity.activeFilter = "all"
    },
  },
}

function nextId(tasks) {
  if (!tasks.length) return DEFAULT_ID
  return tasks[tasks.length - LAST_TASK].id + NEXT_ID
}
