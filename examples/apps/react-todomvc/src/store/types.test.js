import { it, expect } from "vitest"
import { createStore } from "@inglorious/store"

import { types } from "./types"
import { entities } from "./entities"

it("should update the form value on inputChange", () => {
  const event = { type: "inputChange", payload: "Hello world!" }
  const stateAfter = {
    form: { id: "form", type: "Form", value: "Hello world!" },
    list: { id: "list", type: "List", tasks: [] },
    footer: { id: "footer", type: "Footer", activeFilter: "all" },
  }

  doTest(entities, event, stateAfter)
})

it("should add a new task and a clear the form value at the same time on formSubmit", () => {
  const event = { type: "formSubmit", payload: "Hello world!" }
  const stateAfter = {
    form: { id: "form", type: "Form", value: "" },
    list: {
      id: "list",
      type: "List",
      tasks: [{ id: 1, text: "Hello world!" }],
    },
    footer: { id: "footer", type: "Footer", activeFilter: "all" },
  }

  doTest(entities, event, stateAfter)
})

it("should toggle a task as completed on toggleClick", () => {
  const stateBefore = {
    form: { id: "form", type: "Form", value: "" },
    list: {
      id: "list",
      type: "List",
      tasks: [{ id: 1, text: "Hello world!", completed: false }],
    },
    footer: { id: "footer", type: "Footer", activeFilter: "all" },
  }
  const event = { type: "toggleClick", payload: 1 }
  const stateAfter = {
    form: { id: "form", type: "Form", value: "" },
    list: {
      id: "list",
      type: "List",
      tasks: [{ id: 1, text: "Hello world!", completed: true }],
    },
    footer: { id: "footer", type: "Footer", activeFilter: "all" },
  }

  doTest(stateBefore, event, stateAfter)
})

it("should delete a task on deleteClick", () => {
  const stateBefore = {
    form: { id: "form", type: "Form", value: "" },
    list: {
      id: "list",
      type: "List",
      tasks: [{ id: 1, text: "Hello world!", completed: false }],
    },
    footer: { id: "footer", type: "Footer", activeFilter: "all" },
  }
  const event = { type: "deleteClick", payload: 1 }
  const stateAfter = {
    form: { id: "form", type: "Form", value: "" },
    list: { id: "list", type: "List", tasks: [] },
    footer: { id: "footer", type: "Footer", activeFilter: "all" },
  }

  doTest(stateBefore, event, stateAfter)
})

it("should clear all completed tasks on clearClick", () => {
  const stateBefore = {
    form: { id: "form", type: "Form", value: "" },
    list: {
      id: "list",
      type: "List",
      tasks: [{ id: 1, text: "Hello world!", completed: true }],
    },
    footer: { id: "footer", type: "Footer", activeFilter: "all" },
  }
  const event = { type: "clearClick" }
  const stateAfter = {
    form: { id: "form", type: "Form", value: "" },
    list: { id: "list", type: "List", tasks: [] },
    footer: { id: "footer", type: "Footer", activeFilter: "all" },
  }

  doTest(stateBefore, event, stateAfter)
})

it("should update the filter on filterClick", () => {
  const event = { type: "filterClick", payload: "completed" }
  const stateAfter = {
    form: { id: "form", type: "Form", value: "" },
    list: { id: "list", type: "List", tasks: [] },
    footer: { id: "footer", type: "Footer", activeFilter: "completed" },
  }

  doTest(entities, event, stateAfter)
})

function doTest(stateBefore, event, stateAfter) {
  const store = createStore({ types, entities: stateBefore })

  store.dispatch(event)
  const state = store.getState()

  expect(state).toEqual(stateAfter)
}
