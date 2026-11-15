import { clsx } from "clsx"
import { useDispatch, useSelector } from "react-redux"

import { selectFilteredTasks } from "../store/selectors"
import { taskDelete, taskToggle } from "./list"

export default function List() {
  const dispatch = useDispatch()

  const tasks = useSelector(selectFilteredTasks)

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <span
            className={clsx({ completed: task.completed })}
            onClick={() => dispatch(taskToggle(task.id))}
          >
            {task.text}
          </span>{" "}
          <button onClick={() => dispatch(taskDelete(task.id))}>x</button>
        </li>
      ))}
    </ul>
  )
}
