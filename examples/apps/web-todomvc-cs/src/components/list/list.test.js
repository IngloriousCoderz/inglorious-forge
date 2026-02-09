import { createStore } from "@inglorious/web"
import { beforeEach, expect, it, vi } from "vitest"

import * as list from "@/components/list/handlers"
import * as client from "@/services/client"

const mockTasks = [
  { id: 1, text: "Learn Inglorious Web", completed: true },
  { id: 2, text: "...", completed: false },
  { id: 3, text: "Profit!" },
]
const mockNewTask = { id: 4, text: "New task" }

const types = { list }
let store = null

vi.mock("@/services/client", () => ({
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  clearCompleted: vi.fn(),
}))

beforeEach(() => {
  client.fetchTasks.mockResolvedValue(mockTasks)
  client.createTask.mockResolvedValue(mockNewTask)
  client.updateTask.mockResolvedValue({ id: 2, text: "...", completed: true })
  client.deleteTask.mockResolvedValue({ id: 2, text: "...", completed: true })
  client.clearCompleted.mockReset()

  store = createStore({ types, autoCreateEntities: true })
})

it("should fetch tasks on create and update the store on tasksFetched", async () => {
  expect(store.getState()).toEqual({
    list: { id: "list", type: "list", tasks: mockTasks },
  })
})

it("should create a task on formSubmit and update the store on taskCreated", async () => {
  await store.notify("formSubmit", "New Task")

  expect(store.getState()).toEqual({
    list: { id: "list", type: "list", tasks: [...mockTasks, mockNewTask] },
  })
})

it("should toggle a task on toggleClick and update the store on taskUpdated", async () => {
  await store.notify("toggleClick", 2)

  expect(store.getState()).toEqual({
    list: {
      id: "list",
      type: "list",
      tasks: mockTasks.map((task) =>
        task.id === 2 ? { ...task, completed: true } : task,
      ),
    },
  })
})

it("should delete a task on deleteClick and update the store on taskDeleted", async () => {
  await store.notify("deleteClick", 2)

  expect(store.getState()).toEqual({
    list: {
      id: "list",
      type: "list",
      tasks: mockTasks.filter((task) => task.id !== 2),
    },
  })
})

it("should clear completed tasks on clearClick and update the store on tasksCleared", async () => {
  const store = createStore({ types, autoCreateEntities: true })

  await store.notify("clearClick")

  expect(store.getState()).toEqual({
    list: {
      id: "list",
      type: "list",
      tasks: mockTasks.filter((task) => !task.completed),
    },
  })
})
