import { it, expect } from "vitest"
import { createStore } from "@inglorious/store"
import type { Event } from "@inglorious/store"

import { types } from "./types"
import { entities } from "./entities"
import type { AppEntity, AppState } from "#types"

it("should update the form value on inputChange", () => {
  const event: Event = { type: "inputChange", payload: "Hello world!" }
  const stateAfter: AppState = {
    form: { id: "form", type: "Form", value: "Hello world!" },
    list: { id: "list", type: "List", tasks: [] },
    footer: { id: "footer", type: "Footer", activeFilter: "all" },
  }

  doTest(entities, event, stateAfter)
})

it("should add a new task and a clear the form value at the same time on formSubmit", () => {
  const event: Event = { type: "formSubmit", payload: "Hello world!" }
  const stateAfter: AppState = {
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

it("should toggle a task as completed on taskToggle", () => {
  const stateBefore: AppState = {
    form: { id: "form", type: "Form", value: "" },
    list: {
      id: "list",
      type: "List",
      tasks: [{ id: 1, text: "Hello world!", completed: false }],
    },
    footer: { id: "footer", type: "Footer", activeFilter: "all" },
  }
  const event: Event = { type: "taskToggle", payload: 1 }
  const stateAfter: AppState = {
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

it("should delete a task on taskDelete", () => {
  const stateBefore: AppState = {
    form: { id: "form", type: "Form", value: "" },
    list: {
      id: "list",
      type: "List",
      tasks: [{ id: 1, text: "Hello world!", completed: false }],
    },
    footer: { id: "footer", type: "Footer", activeFilter: "all" },
  }
  const event: Event = { type: "taskDelete", payload: 1 }
  const stateAfter: AppState = {
    form: { id: "form", type: "Form", value: "" },
    list: { id: "list", type: "List", tasks: [] },
    footer: { id: "footer", type: "Footer", activeFilter: "all" },
  }

  doTest(stateBefore, event, stateAfter)
})

it("should clear all completed tasks on completedClear", () => {
  const stateBefore: AppState = {
    form: { id: "form", type: "Form", value: "" },
    list: {
      id: "list",
      type: "List",
      tasks: [{ id: 1, text: "Hello world!", completed: true }],
    },
    footer: { id: "footer", type: "Footer", activeFilter: "all" },
  }
  const event: Event = { type: "completedClear" }
  const stateAfter: AppState = {
    form: { id: "form", type: "Form", value: "" },
    list: { id: "list", type: "List", tasks: [] },
    footer: { id: "footer", type: "Footer", activeFilter: "all" },
  }

  doTest(stateBefore, event, stateAfter)
})

it("should update the filter on filterChange", () => {
  const event: Event = { type: "filterChange", payload: "completed" }
  const stateAfter: AppState = {
    form: { id: "form", type: "Form", value: "" },
    list: { id: "list", type: "List", tasks: [] },
    footer: { id: "footer", type: "Footer", activeFilter: "completed" },
  }

  doTest(entities, event, stateAfter)
})

function doTest(stateBefore: AppState, event: Event, stateAfter: AppState) {
  const store = createStore<AppEntity, AppState>({
    types,
    entities: stateBefore,
  })

  store.dispatch(event)
  const state = store.getState()

  expect(state).toEqual(stateAfter)
}
