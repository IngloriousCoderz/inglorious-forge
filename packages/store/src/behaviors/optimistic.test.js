import { describe, expect, it, vi } from "vitest"

import { createMockApi, trigger } from "../test.js"
import { handleAsync } from "./async.js"
import { optimistic } from "./optimistic.js"

describe("optimistic", () => {
  it("should add a temporary item on start and remove it again on error", async () => {
    const testError = new Error("Failed to save item")
    const payload = {
      tempId: "temp-1",
      title: "New title",
      completed: true,
    }

    const handlers = {
      run: vi.fn(async () => {
        throw testError
      }),
      error: vi.fn((entity, error) => {
        entity.error = error.message
      }),
      finally: vi.fn((entity) => {
        entity.completed = true
      }),
    }

    const asyncHandlers = optimistic(
      handleAsync("saveItem", handlers),
      (entity, nextItem) => ({
        items: [
          ...entity.items,
          {
            id: nextItem.tempId,
            title: nextItem.title,
            completed: nextItem.completed,
            pending: true,
          },
        ],
      }),
    )

    const entity = {
      type: "ItemList",
      id: "items",
      items: [{ id: 1, title: "Old title", completed: false }],
      error: null,
      completed: false,
    }

    const api = createMockApi({ items: entity })

    const { entity: triggeredEntity, events } = trigger(
      entity,
      asyncHandlers.saveItem,
      payload,
      api,
    )

    const callId = events[0].payload.callId
    expect(events).toEqual([
      { type: "#items:saveItemStart", payload: { payload, callId } },
      { type: "#items:saveItemRun", payload: { payload, callId } },
    ])

    const { entity: optimisticEntity } = trigger(
      triggeredEntity,
      asyncHandlers.saveItemStart,
      { payload, callId },
      api,
    )

    expect(optimisticEntity.items).toEqual([
      { id: 1, title: "Old title", completed: false },
      { id: "temp-1", title: "New title", completed: true, pending: true },
    ])

    await asyncHandlers.saveItemRun(optimisticEntity, { payload, callId }, api)

    expect(handlers.run).toHaveBeenCalled()
    expect(api.getEvents()).toContainEqual({
      type: "#items:saveItemError",
      payload: { error: testError, callId },
    })
    expect(api.getEvents()).toContainEqual({
      type: "#items:saveItemFinally",
      payload: { callId },
    })

    const { entity: rolledBackEntity } = trigger(
      optimisticEntity,
      asyncHandlers.saveItemError,
      { error: testError, callId },
      api,
    )

    expect(rolledBackEntity.items).toEqual([
      { id: 1, title: "Old title", completed: false },
    ])
    expect(rolledBackEntity.error).toBe("Failed to save item")

    const { entity: finalEntity } = trigger(
      rolledBackEntity,
      asyncHandlers.saveItemFinally,
      { callId },
      api,
    )

    expect(finalEntity.completed).toBe(true)
  })

  it("should still support a static patch when the optimistic state does not depend on the payload", async () => {
    const handlers = {
      run: vi.fn(async () => {
        return { id: 1, title: "Saved title", completed: true }
      }),
      success: vi.fn((entity, result) => {
        entity.data = result
      }),
    }

    const asyncHandlers = optimistic(handleAsync("saveItem", handlers), {
      status: "saving",
    })

    const entity = {
      type: "Item",
      id: "item1",
      data: { id: 1, title: "Draft title", completed: false },
      status: "idle",
    }

    const api = createMockApi({ item1: entity })

    const payload = { title: "Optimistic title", completed: true }
    const { entity: afterStart } = trigger(
      entity,
      asyncHandlers.saveItemStart,
      { payload, callId: 1 },
      api,
    )

    expect(afterStart.status).toBe("saving")

    await asyncHandlers.saveItemRun(afterStart, { payload, callId: 1 }, api)

    const { entity: afterSuccess } = trigger(
      afterStart,
      asyncHandlers.saveItemSuccess,
      { result: { id: 1, title: "Saved title", completed: true }, callId: 1 },
      api,
    )

    expect(afterSuccess.data).toEqual({
      id: 1,
      title: "Saved title",
      completed: true,
    })
  })

  it("should compose with existing start, success, and finally handlers", async () => {
    const handlers = {
      start: vi.fn((entity) => {
        entity.loading = true
      }),
      run: vi.fn(async () => {
        return {
          id: 2,
          tempId: "temp-1",
          title: "Saved title",
          completed: true,
        }
      }),
      success: vi.fn((entity, result) => {
        const { tempId, ...savedItem } = result
        entity.items = entity.items.map((item) =>
          item.id === tempId ? savedItem : item,
        )
        entity.loading = false
      }),
      finally: vi.fn((entity) => {
        entity.finished = true
      }),
    }

    const asyncHandlers = optimistic(
      handleAsync("saveItem", handlers),
      (entity, nextItem) => ({
        items: [
          ...entity.items,
          {
            id: nextItem.tempId,
            title: nextItem.title,
            completed: nextItem.completed,
            pending: true,
          },
        ],
      }),
    )

    const entity = {
      type: "ItemList",
      id: "items",
      items: [{ id: 1, title: "Draft title", completed: false }],
      loading: false,
      finished: false,
    }

    const api = createMockApi({ items: entity })
    const payload = {
      tempId: "temp-1",
      title: "Optimistic title",
      completed: true,
    }

    const { events } = trigger(entity, asyncHandlers.saveItem, payload, api)
    const callId = events[0].payload.callId

    expect(events).toEqual([
      { type: "#items:saveItemStart", payload: { payload, callId } },
      { type: "#items:saveItemRun", payload: { payload, callId } },
    ])

    const { entity: afterStart } = trigger(
      entity,
      asyncHandlers.saveItemStart,
      { payload, callId },
      api,
    )

    expect(afterStart.loading).toBe(true)
    expect(afterStart.items).toEqual([
      { id: 1, title: "Draft title", completed: false },
      {
        id: "temp-1",
        title: "Optimistic title",
        completed: true,
        pending: true,
      },
    ])

    const result = {
      id: 2,
      tempId: "temp-1",
      title: "Saved title",
      completed: true,
    }
    const expectedItems = [
      { id: 1, title: "Draft title", completed: false },
      { id: 2, title: "Saved title", completed: true },
    ]
    await asyncHandlers.saveItemRun(afterStart, { payload, callId }, api)

    const { entity: afterSuccess } = trigger(
      afterStart,
      asyncHandlers.saveItemSuccess,
      { result, callId },
      api,
    )

    expect(afterSuccess.items).toEqual(expectedItems)
    expect(afterSuccess.loading).toBe(false)

    const { entity: afterFinally } = trigger(
      afterSuccess,
      asyncHandlers.saveItemFinally,
      { callId },
      api,
    )

    expect(afterFinally.finished).toBe(true)
  })

  it("should pass the api to the finally handler", () => {
    const handlers = {
      run: vi.fn(async () => ({})),
      finally: vi.fn((entity, api) => {
        api.notify("saveItemDone", entity.id)
      }),
    }

    const asyncHandlers = optimistic(handleAsync("saveItem", handlers), {
      pending: true,
    })

    const entity = { type: "ItemList", id: "items" }
    const api = createMockApi({ items: entity })

    const { events } = trigger(
      entity,
      asyncHandlers.saveItemFinally,
      { callId: 1 },
      api,
    )

    expect(handlers.finally.mock.calls[0][1]).toBe(api)
    expect(events).toEqual([{ type: "saveItemDone", payload: "items" }])
  })

  describe("overlapping calls", () => {
    const failure = new Error("Failed")

    function setup(options) {
      const asyncHandlers = optimistic(
        handleAsync("rename", { run: async () => {} }),
        (entity, title) => ({ title }),
        options,
      )
      let entity = { type: "Item", id: "item", title: "Original" }
      const handle = (event, payload) => {
        entity = trigger(
          entity,
          asyncHandlers[event],
          payload,
          createMockApi({ item: entity }),
        ).entity
      }
      return { handle, getEntity: () => entity }
    }

    it("should restore a key to what it was before every pending call that patched it", () => {
      const { handle, getEntity } = setup()
      handle("renameStart", { payload: "First", callId: 1 })
      handle("renameStart", { payload: "Second", callId: 2 })

      handle("renameError", { error: failure, callId: 1 })
      expect(getEntity().title).toBe("Second")

      handle("renameFinally", { callId: 1 })
      handle("renameError", { error: failure, callId: 2 })
      expect(getEntity().title).toBe("Original")
    })

    it("should restore only its own patch when a later call fails", () => {
      const { handle, getEntity } = setup()
      handle("renameStart", { payload: "First", callId: 1 })
      handle("renameStart", { payload: "Second", callId: 2 })

      handle("renameError", { error: failure, callId: 2 })
      expect(getEntity().title).toBe("First")
    })

    it("should keep the snapshot of a call another call's finally ran for", () => {
      const { handle, getEntity } = setup()
      handle("renameStart", { payload: "First", callId: 1 })
      handle("renameStart", { payload: "Second", callId: 2 })

      handle("renameSuccess", { result: undefined, callId: 1 })
      handle("renameFinally", { callId: 1 })
      handle("renameError", { error: failure, callId: 2 })
      expect(getEntity().title).toBe("First")
    })
  })

  it("should undo a failed call with rollback in place of the snapshot", () => {
    const asyncHandlers = optimistic(
      handleAsync("addTodo", { run: async () => {} }),
      (entity, todo) => ({ todos: [...entity.todos, todo] }),
      {
        rollback(entity, todo) {
          entity.todos = entity.todos.filter(({ id }) => id !== todo.id)
        },
      },
    )
    let entity = { type: "TodoList", id: "todos", todos: [] }
    const handle = (event, payload) => {
      entity = trigger(
        entity,
        asyncHandlers[event],
        payload,
        createMockApi({ todos: entity }),
      ).entity
    }

    handle("addTodoStart", { payload: { id: "a" }, callId: 1 })
    handle("addTodoStart", { payload: { id: "b" }, callId: 2 })
    handle("addTodoError", { error: new Error("Failed"), callId: 1 })

    expect(entity.todos).toEqual([{ id: "b" }])
  })
})
