import { describe, expect, it, vi } from "vitest"

import { createStore } from "../store.js"
import { handleRequest } from "./async.js"

function storeWith(behavior) {
  return createStore({
    types: { Search: behavior },
    entities: { search: { type: "Search" } },
  })
}

function settle() {
  return new Promise((resolve) => setTimeout(resolve))
}

function deferred() {
  let resolve, reject
  const promise = new Promise((ok, fail) => {
    resolve = ok
    reject = fail
  })
  return { promise, resolve, reject }
}

const search = (store) => store.getEntity("search")

describe("handleRequest", () => {
  it("shows the request loading, then its result", async () => {
    const answer = deferred()
    const store = storeWith(
      handleRequest("find", {
        run: () => answer.promise,
        success(entity, results) {
          entity.results = results
        },
      }),
    )

    store.notify("#search:find", "ada")
    await settle()
    expect(search(store)).toMatchObject({ status: "loading", error: null })

    answer.resolve(["Ada"])
    await settle()
    expect(search(store)).toMatchObject({
      status: "success",
      error: null,
      results: ["Ada"],
    })
  })

  it("keeps the error, as toError turns it, and lets the handler change it", async () => {
    const seen = []
    const store = storeWith(
      handleRequest(
        "find",
        {
          run: () =>
            Promise.reject(Object.assign(new Error("x"), { code: 42 })),
          error(entity, value) {
            seen.push(value)
            entity.isRetryShown = true
          },
        },
        { toError: (err) => `errors.${err.code}` },
      ),
    )

    store.notify("#search:find")
    await settle()

    expect(search(store)).toMatchObject({
      status: "error",
      error: "errors.42",
      isRetryShown: true,
    })
    expect(seen).toEqual(["errors.42"])
  })

  it("stores the error's message by default, and clears it on the next call", async () => {
    let shouldFail = true
    const store = storeWith(
      handleRequest("find", {
        run: async () => {
          if (shouldFail) throw new Error("Server down")
          return []
        },
      }),
    )

    store.notify("#search:find")
    await settle()
    expect(search(store).error).toBe("Server down")

    shouldFail = false
    store.notify("#search:find")
    await settle()
    expect(search(store)).toMatchObject({ status: "success", error: null })
  })

  it("drops the answer of a call that a newer one replaced", async () => {
    const answers = { slow: deferred(), quick: deferred() }
    const finished = vi.fn()
    const store = storeWith(
      handleRequest("find", {
        run: (query) => answers[query].promise,
        success(entity, results) {
          entity.results = results
        },
        finally: finished,
      }),
    )

    store.notify("#search:find", "slow")
    store.notify("#search:find", "quick")
    await settle()
    answers.quick.resolve(["quick"])
    await settle()
    answers.slow.resolve(["slow"])
    await settle()

    expect(search(store)).toMatchObject({
      status: "success",
      results: ["quick"],
    })
    expect(finished).toHaveBeenCalledTimes(1)
  })

  it("drops an outdated failure too", async () => {
    const answers = { slow: deferred(), quick: deferred() }
    const store = storeWith(
      handleRequest("find", { run: (query) => answers[query].promise }),
    )

    store.notify("#search:find", "slow")
    store.notify("#search:find", "quick")
    await settle()
    answers.quick.resolve([])
    answers.slow.reject(new Error("too late"))
    await settle()

    expect(search(store)).toMatchObject({ status: "success", error: null })
  })

  it("lets every call count when asked", async () => {
    const answers = { a: deferred(), b: deferred() }
    const store = storeWith(
      handleRequest(
        "save",
        {
          run: (id) => answers[id].promise,
          success(entity, id) {
            entity.saved = [...(entity.saved ?? []), id]
          },
        },
        { isLatestOnly: false },
      ),
    )

    store.notify("#search:save", "a")
    store.notify("#search:save", "b")
    await settle()
    answers.b.resolve("b")
    answers.a.resolve("a")
    await settle()

    expect(search(store).saved).toEqual(["b", "a"])
  })

  it("uses fields of its own, for an entity with several requests", async () => {
    const store = storeWith({
      ...handleRequest(
        "save",
        { run: () => Promise.reject(new Error("full")) },
        { status: "saveStatus", error: "saveError" },
      ),
      ...handleRequest("find", { run: async () => [] }),
    })

    store.notify("#search:save")
    store.notify("#search:find")
    await settle()

    expect(search(store)).toMatchObject({
      saveStatus: "error",
      saveError: "full",
      status: "success",
      error: null,
    })
  })

  it("keeps calls of different entities apart", async () => {
    const answers = { one: deferred(), two: deferred() }
    const store = createStore({
      types: {
        Search: handleRequest("find", {
          run: (id) => answers[id].promise,
          success(entity, id) {
            entity.result = id
          },
        }),
      },
      entities: {
        one: { type: "Search" },
        two: { type: "Search" },
      },
    })

    store.notify("#one:find", "one")
    store.notify("#two:find", "two")
    await settle()
    answers.two.resolve("two")
    answers.one.resolve("one")
    await settle()

    expect(store.getEntity("one").result).toBe("one")
    expect(store.getEntity("two").result).toBe("two")
  })

  it("sends its events where scope says, as handleAsync does", async () => {
    const store = storeWith(
      handleRequest(
        "find",
        {
          run: async () => ["Ada"],
          success(entity, results) {
            entity.results = results
          },
        },
        { scope: "type" },
      ),
    )

    store.notify("#search:find")
    await settle()

    expect(search(store)).toMatchObject({
      status: "success",
      results: ["Ada"],
    })
  })
})
