import { vi, it, expect, beforeEach } from "vitest"
import { createStore } from "@inglorious/store"

import { types } from "./types"
import { entities } from "./entities"

vi.mock("../services/client", () => ({
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  clearCompleted: vi.fn(),
}))

import * as client from "../services/client"

beforeEach(() => {
  client.fetchTasks.mockReset()
  client.createTask.mockReset()
  client.updateTask.mockReset()
  client.deleteTask.mockReset()
  client.clearCompleted.mockReset()
})

it("should fetch tasks on listMount and update the store on tasksFetched", async () => {
  const mockTasks = [{ id: 1, text: "Fetched Task", completed: false }]
  client.fetchTasks.mockResolvedValue(mockTasks)

  const store = createStore({ types, entities })

  await store.dispatch({ type: "listMount" })

  const state = store.getState()

  expect(state.list.tasks).toEqual(mockTasks)
  expect(state).toEqual({
    form: { id: "form", type: "Form", value: "" },
    list: { id: "list", type: "List", tasks: mockTasks },
    footer: { id: "footer", type: "Footer", activeFilter: "all" },
  })
})

it("should create a task on formSubmit and update the store on taskCreated", async () => {
  const newTaskText = "New Task"
  const mockCreatedTask = { id: 2, text: newTaskText, completed: false }
  client.createTask.mockResolvedValue(mockCreatedTask)

  const store = createStore({ types, entities })

  await store.dispatch({ type: "formSubmit", payload: newTaskText })

  const state = store.getState()

  expect(state.list.tasks).toEqual([mockCreatedTask])
  expect(state.form.value).toBe("") // Also check that the form was cleared
})

it("should toggle a task on toggleClick and update the store on taskUpdated", async () => {
  const initialTask = { id: 1, text: "Initial Task", completed: false }
  const mockUpdatedTask = { ...initialTask, completed: true }
  client.updateTask.mockResolvedValue(mockUpdatedTask)

  const stateBefore = {
    ...entities,
    list: { ...entities.list, tasks: [initialTask] },
  }
  const store = createStore({ types, entities: stateBefore })

  await store.dispatch({ type: "toggleClick", payload: 1 })

  const state = store.getState()

  expect(state.list.tasks).toEqual([mockUpdatedTask])
})

it("should delete a task on deleteClick and update the store on taskDeleted", async () => {
  const initialTask = { id: 1, text: "Initial Task", completed: false }
  client.deleteTask.mockResolvedValue()

  const stateBefore = {
    ...entities,
    list: { ...entities.list, tasks: [initialTask] },
  }
  const store = createStore({ types, entities: stateBefore })

  await store.dispatch({ type: "deleteClick", payload: 1 })

  const state = store.getState()

  expect(state.list.tasks).toEqual([])
})

it("should clear completed tasks on clearClick and update the store on tasksCleared", async () => {
  const initialTasks = [
    { id: 1, text: "Active Task", completed: false },
    { id: 2, text: "Completed Task", completed: true },
  ]
  client.clearCompleted.mockResolvedValue()

  const stateBefore = {
    ...entities,
    list: { ...entities.list, tasks: initialTasks },
  }
  const store = createStore({ types, entities: stateBefore })

  await store.dispatch({ type: "clearClick" })

  const state = store.getState()

  expect(state.list.tasks).toEqual([
    { id: 1, text: "Active Task", completed: false },
  ])
})
