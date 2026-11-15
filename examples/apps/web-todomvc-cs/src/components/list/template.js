import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"

import { filteredTasks } from "@/store/select"

import classes from "./list.module.css"

export const template = {
  render(entity, api) {
    const tasks = api.select(filteredTasks)

    return html`<ul>
      ${tasks.map(
        (task) =>
          html`<li>
            <span
              class=${classMap({ [classes.completed]: task.completed })}
              @click=${() => api.notify("taskToggle", task.id)}
              >${task.text}</span
            >
            <button @click=${() => api.notify("taskDelete", task.id)}>x</button>
          </li>`,
      )}
    </ul>`
  },
}
