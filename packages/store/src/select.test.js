import { describe, expect, it, vi } from "vitest"

import { compute } from "./select"

describe("compute() function", () => {
  it("computes the result on first call", () => {
    const a = (state) => state.a
    const b = (state) => state.b

    const resultFn = vi.fn((a, b) => a + b)
    const selector = compute(resultFn, [a, b])

    const state = { a: 1, b: 2 }

    expect(selector(state)).toBe(3)
    expect(resultFn).toHaveBeenCalledTimes(1)
  })

  it("returns the cached result if inputs have not changed", () => {
    const a = (state) => state.a
    const b = (state) => state.b

    const resultFn = vi.fn((a, b) => ({ sum: a + b }))
    const selector = compute(resultFn, [a, b])

    const state = { a: 1, b: 2 }

    const first = selector(state)
    const second = selector(state)

    expect(second).toBe(first) // same reference
    expect(resultFn).toHaveBeenCalledTimes(1)
  })

  it("recomputes when an input selector result changes", () => {
    const a = (state) => state.a
    const b = (state) => state.b

    const resultFn = vi.fn((a, b) => a + b)
    const selector = compute(resultFn, [a, b])

    const state1 = { a: 1, b: 2 }
    const state2 = { a: 1, b: 3 }

    expect(selector(state1)).toBe(3)
    expect(selector(state2)).toBe(4)
    expect(resultFn).toHaveBeenCalledTimes(2)
  })

  it("uses referential equality for input comparison", () => {
    const obj = (state) => state.obj

    const resultFn = vi.fn((obj) => obj.value)
    const selector = compute(resultFn, [obj])

    const state1 = { obj: { value: 1 } }
    const state2 = { obj: { value: 1 } } // same shape, different reference

    selector(state1)
    selector(state2)

    expect(resultFn).toHaveBeenCalledTimes(2)
  })

  it("works with a single input selector", () => {
    const count = (state) => state.count

    const resultFn = vi.fn((count) => count * 2)
    const selector = compute(resultFn, [count])

    expect(selector({ count: 2 })).toBe(4)
    expect(selector({ count: 2 })).toBe(4)
    expect(resultFn).toHaveBeenCalledTimes(1)
  })

  it("supports zero input selectors", () => {
    const resultFn = vi.fn(() => 42)
    const selector = compute(resultFn, [])

    expect(selector({})).toBe(42)
    expect(selector({ foo: "bar" })).toBe(42)
    expect(resultFn).toHaveBeenCalledTimes(1)
  })

  it("memoizes per selector instance", () => {
    const a = (state) => state.a
    const resultFn = vi.fn((a) => a)

    const selector1 = compute(resultFn, [a])
    const selector2 = compute(resultFn, [a])

    selector1({ a: 1 })
    selector2({ a: 1 })

    expect(resultFn).toHaveBeenCalledTimes(2)
  })

  it("only calls resultFunc when inputs change", () => {
    const value = (state) => state.value
    const resultFn = vi.fn((v) => v)

    const selector = compute(resultFn, [value])

    selector({ value: 1 })
    selector({ value: 1 })
    selector({ value: 2 })

    expect(resultFn).toHaveBeenCalledTimes(2)
  })
})
