import { classMap, html } from "@inglorious/web"

import { selectFilteredTasks } from "../store/selectors"

const TASKS_TO_REMOVE = 1
const DEFAULT_ID = 1
const LAST_TASK = 1
const NEXT_ID = 1

export const list = {
  create(entity) {
    entity.tasks = []
  },

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

  render(entity, api) {
    const filteredTasks = selectFilteredTasks(api.getEntities())

    return html`<ul class="list">
      ${filteredTasks.map(
        (task) =>
          html`<li>
            <span
              class=${classMap({ completed: task.completed })}
              @click=${() => api.notify("toggleClick", task.id)}
              >${task.text}</span
            >
            <button @click=${() => api.notify("deleteClick", task.id)}>
              x
            </button>
          </li>`,
      )}
    </ul>`
  },
}

function nextId(tasks) {
  if (!tasks.length) return DEFAULT_ID
  return tasks[tasks.length - LAST_TASK].id + NEXT_ID
}
