import clsx from "clsx"
import { useDispatch, useSelector } from "react-redux"

import { clearClick } from "../store/actions"
import { selectActiveFilter, selectTasksCount } from "../store/selectors"
import { setFilter } from "./footer"

const SINGLE_TASK = 1

export default function Footer() {
  const dispatch = useDispatch()

  const tasksCount = useSelector(selectTasksCount())
  const completedTasksCount = useSelector(selectTasksCount("completed"))
  const activeTasksCount = useSelector(selectTasksCount("active"))
  const activeFilter = useSelector(selectActiveFilter)

  if (!tasksCount) return null

  return (
    <footer>
      <span>
        {activeTasksCount} item{activeTasksCount === SINGLE_TASK ? "" : "s"}{" "}
        left
      </span>

      <span className="filters">
        <a
          className={clsx({ selected: activeFilter === "all" })}
          onClick={() => dispatch(setFilter("all"))}
        >
          All
        </a>
        <a
          className={clsx({ selected: activeFilter === "active" })}
          onClick={() => dispatch(setFilter("active"))}
        >
          Active
        </a>
        <a
          className={clsx({ selected: activeFilter === "completed" })}
          onClick={() => dispatch(setFilter("completed"))}
        >
          Completed
        </a>
      </span>

      <a
        className={clsx({ hidden: !completedTasksCount })}
        onClick={() => dispatch(clearClick())}
      >
        Clear Completed
      </a>
    </footer>
  )
}
