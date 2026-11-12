import { createStore } from "@inglorious/store"
import { handleRequest } from "@inglorious/store/async"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { withDebounce } from "./index.js"

const DELAY = 150

describe("withDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const saves = {
    save(entity, value) {
      entity.saved = [...(entity.saved ?? []), value]
    },
  }

  function storeWith(type, entities = { form: { type: "Form" } }) {
    return createStore({ types: { Form: type }, entities })
  }

  it("runs the last call once the delay has passed, in an update subscribers hear of", async () => {
    const store = storeWith([saves, withDebounce(DELAY, ["save"])])
    const listener = vi.fn()

    store.notify("#form:save", 1)
    store.notify("#form:save", 2)
    store.subscribe(listener)
    await vi.advanceTimersByTimeAsync(DELAY - 1)
    expect(store.getEntity("form").saved).toBeUndefined()

    await vi.advanceTimersByTimeAsync(1)

    expect(store.getEntity("form").saved).toEqual([2])
    expect(listener).toHaveBeenCalled()
  })

  it("takes a delay per handler", async () => {
    const store = storeWith([
      {
        ...saves,
        load(entity) {
          entity.isLoaded = true
        },
      },
      withDebounce({ save: DELAY, load: DELAY * 2 }),
    ])

    store.notify("#form:save", 1)
    store.notify("#form:load")
    await vi.advanceTimersByTimeAsync(DELAY)
    expect(store.getEntity("form")).toMatchObject({ saved: [1] })
    expect(store.getEntity("form").isLoaded).toBeUndefined()

    await vi.advanceTimersByTimeAsync(DELAY)
    expect(store.getEntity("form").isLoaded).toBe(true)
  })

  it("debounces each entity on its own", async () => {
    const store = storeWith([saves, withDebounce(DELAY, ["save"])], {
      one: { type: "Form" },
      two: { type: "Form" },
    })

    store.notify("#one:save", 1)
    store.notify("#two:save", 2)
    await vi.advanceTimersByTimeAsync(DELAY)

    expect(store.getEntity("one").saved).toEqual([1])
    expect(store.getEntity("two").saved).toEqual([2])
  })

  it("cancels pending calls on destroy, and calls the type's own destroy", async () => {
    const destroy = vi.fn()
    const behavior = withDebounce(DELAY, ["save"])({ ...saves, destroy })
    const api = { notify: vi.fn() }
    const entity = { id: "form" }

    behavior.save(entity, 1, api)
    behavior.destroy(entity, undefined, api)
    await vi.advanceTimersByTimeAsync(DELAY)

    expect(api.notify).not.toHaveBeenCalled()
    expect(destroy).toHaveBeenCalled()
  })

  it("debounces the event that starts a request", async () => {
    const run = vi.fn(async (query) => [`${query} result`])
    const store = createStore({
      types: {
        Search: [
          handleRequest("search", {
            run,
            success(entity, results) {
              entity.results = results
            },
          }),
          withDebounce(300, ["search"]),
        ],
      },
      entities: { search: { type: "Search" } },
    })

    store.notify("#search:search", "p")
    store.notify("#search:search", "ph")
    store.notify("#search:search", "photo")
    await vi.advanceTimersByTimeAsync(299)
    expect(run).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)

    expect(run).toHaveBeenCalledTimes(1)
    expect(run).toHaveBeenCalledWith("photo", expect.anything())
    expect(store.getEntity("search")).toMatchObject({
      status: "success",
      results: ["photo result"],
    })
  })
})
