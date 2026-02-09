import { classMap } from "@inglorious/web"

import { filteredTasks } from "@/store/select"

import classes from "./list.module.css"

export default function render(entity, api) {
  const tasks = api.select(filteredTasks)

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <span
            className={classMap({ [classes.completed]: task.completed })}
            onClick={() => api.notify("toggleClick", task.id)}
          >
            {task.text}
          </span>
          <button onClick={() => api.notify("deleteClick", task.id)}>x</button>
        </li>
      ))}
    </ul>
  )
}
