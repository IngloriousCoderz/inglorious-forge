import { createStore } from "@inglorious/store"
import { expect, it } from "vitest"

import { Footer, setFilter } from "../footer/footer"
import { Form, inputChange } from "../form/form"
import { deleteClick, List, toggleClick } from "../list/list"
import { clearClick, formSubmit } from "./actions"

const baseState = {
  form: { id: "form", type: "Form", value: "" },
  list: { id: "list", type: "List", tasks: [] },
  footer: { id: "footer", type: "Footer", activeFilter: "all" },
}

it("should update the form value on inputChange", () => {
  const event = inputChange("Hello world!")
  const stateAfter = {
    form: { id: "form", type: "Form", value: "Hello world!" },
    list: { id: "list", type: "List", tasks: [] },
    footer: { id: "footer", type: "Footer", activeFilter: "all" },
  }

  doTest(baseState, event, stateAfter)
})

it("should add a new task and a clear the form value at the same time on formSubmit", () => {
  const event = formSubmit("Hello world!")
  const stateAfter = {
    form: { id: "form", type: "Form", value: "" },
    list: {
      id: "list",
      type: "List",
      tasks: [{ id: 1, text: "Hello world!" }],
    },
    footer: { id: "footer", type: "Footer", activeFilter: "all" },
  }

  doTest(baseState, event, stateAfter)
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
  const event = toggleClick(1)
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
  const event = deleteClick(1)
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
  const event = clearClick()
  const stateAfter = {
    form: { id: "form", type: "Form", value: "" },
    list: { id: "list", type: "List", tasks: [] },
    footer: { id: "footer", type: "Footer", activeFilter: "all" },
  }

  doTest(stateBefore, event, stateAfter)
})

it("should update the filter on filterClick", () => {
  const event = setFilter("completed")
  const stateAfter = {
    form: { id: "form", type: "Form", value: "" },
    list: { id: "list", type: "List", tasks: [] },
    footer: { id: "footer", type: "Footer", activeFilter: "completed" },
  }

  doTest(baseState, event, stateAfter)
})

function doTest(stateBefore, event, stateAfter) {
  const store = createStore({
    types: { Form, List, Footer },
    entities: stateBefore,
  })

  store.dispatch(event)

  const state = store.getState()

  expect(state).toEqual(stateAfter)
}
