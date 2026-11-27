import { it, expect } from "vitest"

import {
  selectValue,
  selectTasks,
  selectTasksCount,
  selectActiveFilter,
  selectFilteredTasks,
} from "./selectors"
import type { AppState } from "#types"

it("should select the form value", () => {
  const state = {
    form: { value: "Hello world!" },
  } as AppState

  expect(selectValue(state)).toBe("Hello world!")
})

it("should select the tasks", () => {
  const state = {
    list: { tasks: [{ id: 1, text: "Hello world!" }] },
  } as AppState

  expect(selectTasks(state)).toEqual([{ id: 1, text: "Hello world!" }])
})

it("should select the tasks count", () => {
  const state = {
    list: { tasks: [{ id: 1, text: "Hello world!" }] },
  } as AppState

  expect(selectTasksCount("all")(state)).toBe(1)
})

it("should select the active filter", () => {
  const state = {
    footer: { activeFilter: "completed" },
  } as AppState

  expect(selectActiveFilter(state)).toBe("completed")
})

it("should select the filtered tasks", () => {
  const state = {
    list: {
      tasks: [
        { id: 1, text: "Hello world!", completed: true },
        { id: 2, text: "Hello again!", completed: false },
      ],
    },
    footer: { activeFilter: "completed" },
  } as AppState

  expect(selectFilteredTasks(state)).toEqual([
    { id: 1, text: "Hello world!", completed: true },
  ])
})
