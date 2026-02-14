import { expect, it } from "vitest"

import {
  selectActiveFilter,
  selectFilteredTasks,
  selectTasks,
  selectTasksCount,
  selectValue,
} from "./selectors"

it("should select the form value", () => {
  const state = {
    form: { value: "Hello world!" },
  }

  expect(selectValue(state)).toBe("Hello world!")
})

it("should select the tasks", () => {
  const state = {
    list: { tasks: [{ id: 1, text: "Hello world!" }] },
  }

  expect(selectTasks(state)).toEqual([{ id: 1, text: "Hello world!" }])
})

it("should select the tasks count", () => {
  const state = {
    list: { tasks: [{ id: 1, text: "Hello world!" }] },
  }

  expect(selectTasksCount("all")(state)).toBe(1)
})

it("should select the active filter", () => {
  const state = {
    footer: { activeFilter: "completed" },
  }

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
  }

  expect(selectFilteredTasks(state)).toEqual([
    { id: 1, text: "Hello world!", completed: true },
  ])
})
