import { expect, test } from "vitest"

import { createApi } from "./api.js"

test("api.select runs selectors against current state", () => {
  let state = {
    alpha: { type: "Test", value: 2 },
    beta: { type: "Test", value: 5 },
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
    alpha: { type: "Test", value: 3 },
    beta: { type: "Test", value: 4 },
  }

  expect(api.select(selectTotal)).toBe(7)
})

test("api.getEntities supports optional type filtering", () => {
  const state = {
    alpha: { type: "Test", value: 2 },
    beta: { type: "Other", value: 5 },
    gamma: { type: "Test", value: 8 },
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

  expect(api.getEntities()).toBe(state)
  expect(api.getEntities("Test")).toEqual([state.alpha, state.gamma])
  expect(api.getEntities("Missing")).toEqual([])
})
