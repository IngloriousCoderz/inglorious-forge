import { describe, expect, it, vi } from "vitest"

import { handleAsync } from "./async"
import { optimistic } from "./optimistic"
import { createMockApi, trigger } from "./test"

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

    expect(events).toEqual([
      { type: "#items:saveItemStart", payload },
      { type: "#items:saveItemRun", payload },
    ])

    const { entity: optimisticEntity } = trigger(
      triggeredEntity,
      asyncHandlers.saveItemStart,
      payload,
      api,
    )

    expect(optimisticEntity.items).toEqual([
      { id: 1, title: "Old title", completed: false },
      { id: "temp-1", title: "New title", completed: true, pending: true },
    ])

    await asyncHandlers.saveItemRun(optimisticEntity, payload, api)

    expect(handlers.run).toHaveBeenCalled()
    expect(api.getEvents()).toContainEqual({
      type: "#items:saveItemError",
      payload: testError,
    })
    expect(api.getEvents()).toContainEqual({
      type: "#items:saveItemFinally",
      payload: undefined,
    })

    const { entity: rolledBackEntity } = trigger(
      optimisticEntity,
      asyncHandlers.saveItemError,
      testError,
      api,
    )

    expect(rolledBackEntity.items).toEqual([
      { id: 1, title: "Old title", completed: false },
    ])
    expect(rolledBackEntity.error).toBe("Failed to save item")

    const { entity: finalEntity } = trigger(
      rolledBackEntity,
      asyncHandlers.saveItemFinally,
      undefined,
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

    const { entity: afterStart } = trigger(
      entity,
      asyncHandlers.saveItemStart,
      { title: "Optimistic title", completed: true },
      api,
    )

    expect(afterStart.status).toBe("saving")

    await asyncHandlers.saveItemRun(
      afterStart,
      { title: "Optimistic title" },
      api,
    )

    const { entity: afterSuccess } = trigger(
      afterStart,
      asyncHandlers.saveItemSuccess,
      { id: 1, title: "Saved title", completed: true },
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

    expect(events).toEqual([
      { type: "#items:saveItemStart", payload },
      { type: "#items:saveItemRun", payload },
    ])

    const { entity: afterStart } = trigger(
      entity,
      asyncHandlers.saveItemStart,
      payload,
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
    await asyncHandlers.saveItemRun(afterStart, payload, api)

    const { entity: afterSuccess } = trigger(
      afterStart,
      asyncHandlers.saveItemSuccess,
      result,
      api,
    )

    expect(afterSuccess.items).toEqual(expectedItems)
    expect(afterSuccess.loading).toBe(false)

    const { entity: afterFinally } = trigger(
      afterSuccess,
      asyncHandlers.saveItemFinally,
      undefined,
      api,
    )

    expect(afterFinally.finished).toBe(true)
  })
})
