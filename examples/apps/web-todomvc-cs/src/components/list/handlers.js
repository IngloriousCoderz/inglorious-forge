import * as client from "@/services/client"
const TASKS_TO_REMOVE = 1

export async function create(entity, payload, api) {
  entity.tasks = []
  const tasks = await client.fetchTasks()
  api.notify("tasksFetched", tasks)
}

export function tasksFetched(entity, tasks) {
  entity.tasks = tasks
}

export async function formSubmit(entity, value, api) {
  const createdTask = await client.createTask({ text: value })
  api.notify("taskCreated", createdTask)
}

export function taskCreated(entity, createdTask) {
  entity.tasks.push(createdTask)
}

export async function toggleClick(entity, id, api) {
  const task = entity.tasks.find((task) => task.id === id)
  const updatedTask = await client.updateTask(id, {
    completed: !task.completed,
  })
  api.notify("taskUpdated", { id, updatedTask })
}

export function taskUpdated(entity, { id, updatedTask }) {
  const index = entity.tasks.findIndex((task) => task.id === id)
  entity.tasks[index] = updatedTask
}

export async function deleteClick(entity, id, api) {
  await client.deleteTask(id)
  api.notify("taskDeleted", id)
}

export function taskDeleted(entity, id) {
  const index = entity.tasks.findIndex((task) => task.id === id)
  entity.tasks.splice(index, TASKS_TO_REMOVE)
}

export async function clearClick(entity, _, api) {
  await client.clearCompleted(entity.tasks)
  api.notify("tasksCleared")
}

export function tasksCleared(entity) {
  entity.tasks = entity.tasks.filter((task) => !task.completed)
}
