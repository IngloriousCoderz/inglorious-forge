import { useEffect } from "react"
import { clsx } from "clsx"

import { useNotify, useSelector } from "./store"
import { selectFilteredTasks } from "./store/selectors"

export default function List() {
  const notify = useNotify()

  const tasks = useSelector(selectFilteredTasks)

  useEffect(() => {
    notify("listMount")
  }, [notify])

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <span
            className={clsx({ completed: task.completed })}
            onClick={() => notify("toggleClick", task.id)}
          >
            {task.text}
          </span>{" "}
          <button onClick={() => notify("deleteClick", task.id)}>x</button>
        </li>
      ))}
    </ul>
  )
}
