import { expect, test } from "vitest"

import { createApi } from "./api.js"

test("api.select runs selectors against current state", () => {
  let state = {
    alpha: { type: "test", value: 2 },
    beta: { type: "test", value: 5 },
  }

  const store = {
    getTypes: () => ({}),
    getType: () => ({}),
    setType: () => {},
    getState: () => state,
    dispatch: () => {},
    notify: () => {},
  }

  const api = createApi(store)
  const selectTotal = (entities) => entities.alpha.value + entities.beta.value

  expect(api.select(selectTotal)).toBe(7)

  state = {
    alpha: { type: "test", value: 3 },
    beta: { type: "test", value: 4 },
  }

  expect(api.select(selectTotal)).toBe(7)
})
