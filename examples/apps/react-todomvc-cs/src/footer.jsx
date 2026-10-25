import clsx from "clsx"

import { useEntity, useNotify, useSelector } from "./store"
import { selectTasksCount } from "./store/selectors"

const SINGLE_TASK = 1

export default function Footer() {
  const notify = useNotify()

  const tasksCount = useSelector(selectTasksCount())
  const completedTasksCount = useSelector(selectTasksCount("completed"))
  const activeTasksCount = useSelector(selectTasksCount("active"))
  const { activeFilter } = useEntity("footer")

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
          onClick={() => notify("filterClick", "all")}
        >
          All
        </a>
        <a
          className={clsx({ selected: activeFilter === "active" })}
          onClick={() => notify("filterClick", "active")}
        >
          Active
        </a>
        <a
          className={clsx({ selected: activeFilter === "completed" })}
          onClick={() => notify("filterClick", "completed")}
        >
          Completed
        </a>
      </span>

      <a
        className={clsx({ hidden: !completedTasksCount })}
        onClick={() => notify("clearClick")}
      >
        Clear Completed
      </a>
    </footer>
  )
}
