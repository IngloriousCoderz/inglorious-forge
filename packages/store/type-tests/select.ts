import { compute, createSelector } from "../types/select"

interface Task {
  done: boolean
}
interface AppState {
  list: { tasks: Task[] }
  footer: { filter: "all" | "done" }
}

const tasks = (state: AppState) => state.list.tasks
const filter = (state: AppState) => state.footer.filter

// The result function's arguments are inferred from the input selectors
export const visible = compute(
  (tasks, filter) => tasks.filter((task) => filter === "all" || task.done),
  [tasks, filter],
)
declare const state: AppState
export const visibleTasks: Task[] = visible(state)

export const count = createSelector([tasks], (tasks) => tasks.length)
export const total: number = count(state)

// @ts-expect-error: the selector needs an AppState
visible({ list: { tasks: [] } })

// @ts-expect-error: tasks are Task[], not strings
compute((tasks: string[]) => tasks.length, [tasks])

// Explicit type arguments keep working
export const explicit = compute<AppState, [Task[]], number>(
  (tasks) => tasks.length,
  [tasks],
)
export const explicitCount: number = explicit(state)
