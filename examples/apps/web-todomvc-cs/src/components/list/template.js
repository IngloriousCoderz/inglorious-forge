import { classMap, html } from "@inglorious/web"

import { filteredTasks } from "@/store/selectors"

import classes from "./list.module.css"

export function render(entity, api) {
  const tasks = api.select(filteredTasks)

  return html`<ul class="list">
    ${tasks.map(
      (task) =>
        html`<li>
          <span
            class=${classMap({ [classes.completed]: task.completed })}
            @click=${() => api.notify("toggleClick", task.id)}
            >${task.text}</span
          >
          <button @click=${() => api.notify("deleteClick", task.id)}>x</button>
        </li>`,
    )}
  </ul>`
}
