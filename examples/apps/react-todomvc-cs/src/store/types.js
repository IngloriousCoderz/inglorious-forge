import * as client from "../services/client"

const TASKS_TO_REMOVE = 1

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
    async listMount(entity, _, api) {
      const tasks = await client.fetchTasks()
      api.notify("tasksFetched", tasks)
    },

    tasksFetched(entity, tasks) {
      entity.tasks = tasks
    },

    async formSubmit(entity, value, api) {
      const createdTask = await client.createTask({ text: value })
      api.notify("taskCreated", createdTask)
    },

    taskCreated(entity, createdTask) {
      entity.tasks.push(createdTask)
    },

    async toggleClick(entity, id, api) {
      const task = entity.tasks.find((task) => task.id === id)
      const updatedTask = await client.updateTask(id, {
        completed: !task.completed,
      })
      api.notify("taskUpdated", { id, updatedTask })
    },

    taskUpdated(entity, { id, updatedTask }) {
      const index = entity.tasks.findIndex((task) => task.id === id)
      entity.tasks[index] = updatedTask
    },

    async deleteClick(entity, id, api) {
      await client.deleteTask(id)
      api.notify("taskDeleted", id)
    },

    taskDeleted(entity, id) {
      const index = entity.tasks.findIndex((task) => task.id === id)
      entity.tasks.splice(index, TASKS_TO_REMOVE)
    },

    async clearClick(entity, _, api) {
      await client.clearCompleted(entity.tasks)
      api.notify("tasksCleared")
    },

    tasksCleared(entity) {
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
