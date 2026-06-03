import { afterEach, expect, test, vi } from "vitest"

import { compose, debounce, pipe, throttle } from "./functions.js"

afterEach(() => {
  vi.useRealTimers()
})

test("it should compose unary functions", () => {
  const shout = (x) => x.toUpperCase()
  const punctuate = (mark) => (x) => `${x}${mark}`
  const html = (tag) => (x) => `<${tag}>${x}</${tag}>`

  const fn = compose(html("p"), punctuate("!"), shout)
  expect(fn("Hello world")).toBe("<p>HELLO WORLD!</p>")
})

test("it should compose functions with multiple initial arguments", () => {
  const add = (a, b) => a + b
  const square = (x) => x * x
  const half = (x) => x / 2

  const fn = compose(half, square, add) // half(square(add(2, 3)))
  expect(fn(2, 3)).toBe(12.5)
})

test("it should return an identity-like function if compose is called with no arguments", () => {
  const fn = compose()
  expect(fn(42)).toBe(42)
  expect(fn({ a: 1 })).toStrictEqual({ a: 1 })
})

test("it should debounce function calls", () => {
  vi.useFakeTimers()
  const fn = vi.fn()
  const debounced = debounce(fn, 100)

  debounced("first")
  debounced("second")

  expect(fn).not.toHaveBeenCalled()

  vi.advanceTimersByTime(99)
  expect(fn).not.toHaveBeenCalled()

  vi.advanceTimersByTime(1)
  expect(fn).toHaveBeenCalledTimes(1)
  expect(fn).toHaveBeenCalledWith("second")
})

test("it should cancel pending calls", () => {
  vi.useFakeTimers()
  const fn = vi.fn()
  const debounced = debounce(fn, 100)

  debounced("value")
  expect(debounced.pending()).toBe(true)

  debounced.cancel()
  expect(debounced.pending()).toBe(false)

  vi.advanceTimersByTime(100)
  expect(fn).not.toHaveBeenCalled()
})

test("it should flush pending calls", () => {
  vi.useFakeTimers()
  const fn = vi.fn((value) => value.toUpperCase())
  const debounced = debounce(fn, 100)

  debounced("value")

  expect(debounced.flush()).toBe("VALUE")
  expect(debounced.pending()).toBe(false)
  expect(fn).toHaveBeenCalledTimes(1)

  vi.advanceTimersByTime(100)
  expect(fn).toHaveBeenCalledTimes(1)
})

test("it should preserve the latest call context and arguments", () => {
  vi.useFakeTimers()
  const context = {
    prefix: "hello",
    fn: debounce(function (value) {
      return `${this.prefix} ${value}`
    }, 100),
  }

  context.fn("world")

  vi.advanceTimersByTime(100)
  expect(context.fn.flush()).toBe("hello world")
})

test("it should pipe unary functions", () => {
  const shout = (x) => x.toUpperCase()
  const punctuate = (mark) => (x) => `${x}${mark}`
  const html = (tag) => (x) => `<${tag}>${x}</${tag}>`

  const fn = pipe(shout, punctuate("!"), html("p"))
  expect(fn("Hello world")).toBe("<p>HELLO WORLD!</p>")
})

test("it should pipe functions with multiple initial arguments", () => {
  const add = (a, b) => a + b
  const square = (x) => x * x
  const half = (x) => x / 2

  const fn = pipe(add, square, half) // half(square(add(2, 3)))
  expect(fn(2, 3)).toBe(12.5)
})

test("it should return an identity-like function if pipe is called with no arguments", () => {
  const fn = pipe()
  expect(fn(42)).toBe(42)
  expect(fn({ a: 1 })).toStrictEqual({ a: 1 })
})

test("it should throttle function calls", () => {
  vi.useFakeTimers()
  const fn = vi.fn((value) => value)
  const throttled = throttle(fn, 100)

  expect(throttled("first")).toBe("first")
  expect(throttled("second")).toBe("first")

  expect(fn).toHaveBeenCalledTimes(1)
  expect(fn).toHaveBeenCalledWith("first")

  vi.advanceTimersByTime(100)
  expect(throttled("third")).toBe("third")
  expect(fn).toHaveBeenCalledTimes(2)
  expect(fn).toHaveBeenLastCalledWith("third")
})

test("it should cancel throttled state", () => {
  vi.useFakeTimers()
  const fn = vi.fn()
  const throttled = throttle(fn, 100)

  throttled("first")
  expect(throttled.pending()).toBe(true)

  throttled.cancel()
  expect(throttled.pending()).toBe(false)

  throttled("second")
  expect(fn).toHaveBeenCalledTimes(2)
  expect(fn).toHaveBeenLastCalledWith("second")
})
