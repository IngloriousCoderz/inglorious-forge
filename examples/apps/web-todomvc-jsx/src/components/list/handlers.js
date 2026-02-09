const TASKS_TO_REMOVE = 1
const DEFAULT_ID = 1
const LAST_TASK = 1
const NEXT_ID = 1

export function create(entity) {
  entity.tasks = []
}

export function formSubmit(entity, value) {
  entity.tasks.push({ id: nextId(entity.tasks), text: value })
}

export function toggleClick(entity, id) {
  const task = entity.tasks.find((task) => task.id === id)
  task.completed = !task.completed
}

export function deleteClick(entity, id) {
  const index = entity.tasks.findIndex((task) => task.id === id)
  entity.tasks.splice(index, TASKS_TO_REMOVE)
}

export function clearClick(entity) {
  entity.tasks = entity.tasks.filter((task) => !task.completed)
}

function nextId(tasks) {
  if (!tasks.length) return DEFAULT_ID
  return tasks[tasks.length - LAST_TASK].id + NEXT_ID
}
