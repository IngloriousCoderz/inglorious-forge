import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { compose, debounce, pipe, throttle } from "./functions.js"

describe("compose", () => {
  it("composes unary functions", () => {
    const shout = (x) => x.toUpperCase()
    const punctuate = (mark) => (x) => `${x}${mark}`
    const html = (tag) => (x) => `<${tag}>${x}</${tag}>`

    const fn = compose(html("p"), punctuate("!"), shout)
    expect(fn("Hello world")).toBe("<p>HELLO WORLD!</p>")
  })

  it("composes functions with multiple initial arguments", () => {
    const add = (a, b) => a + b
    const square = (x) => x * x
    const half = (x) => x / 2

    const fn = compose(half, square, add) // half(square(add(2, 3)))
    expect(fn(2, 3)).toBe(12.5)
  })

  it("returns an identity-like function if called with no arguments", () => {
    const fn = compose()
    expect(fn(42)).toBe(42)
    expect(fn({ a: 1 })).toStrictEqual({ a: 1 })
  })
})

describe("pipe", () => {
  it("pipes unary functions", () => {
    const shout = (x) => x.toUpperCase()
    const punctuate = (mark) => (x) => `${x}${mark}`
    const html = (tag) => (x) => `<${tag}>${x}</${tag}>`

    const fn = pipe(shout, punctuate("!"), html("p"))
    expect(fn("Hello world")).toBe("<p>HELLO WORLD!</p>")
  })

  it("pipes functions with multiple initial arguments", () => {
    const add = (a, b) => a + b
    const square = (x) => x * x
    const half = (x) => x / 2

    const fn = pipe(add, square, half) // half(square(add(2, 3)))
    expect(fn(2, 3)).toBe(12.5)
  })

  it("returns an identity-like function if called with no arguments", () => {
    const fn = pipe()
    expect(fn(42)).toBe(42)
    expect(fn({ a: 1 })).toStrictEqual({ a: 1 })
  })
})

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("debounces function calls", () => {
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

  it("cancels pending calls", () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced("value")
    expect(debounced.pending()).toBe(true)

    debounced.cancel()
    expect(debounced.pending()).toBe(false)

    vi.advanceTimersByTime(100)
    expect(fn).not.toHaveBeenCalled()
  })

  it("flushes pending calls", () => {
    const fn = vi.fn((value) => value.toUpperCase())
    const debounced = debounce(fn, 100)

    debounced("value")

    expect(debounced.flush()).toBe("VALUE")
    expect(debounced.pending()).toBe(false)
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("preserves the latest call context and arguments", () => {
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
})

describe("throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("leading edge (default)", () => {
    it("invokes immediately on the first call", () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)

      throttled("a")

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith("a")
    })

    it("suppresses calls made before the delay elapses", () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)

      throttled("a")
      throttled("b")
      throttled("c")

      expect(fn).toHaveBeenCalledTimes(1)
    })

    it("drops the last call of a burst once the window closes", () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)

      throttled("a")
      throttled("b") // suppressed and discarded, not trailing by default

      vi.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith("a")
    })

    it("allows a new call once the delay has elapsed", () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)

      throttled("a")
      vi.advanceTimersByTime(100)
      throttled("b")

      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenNthCalledWith(2, "b")
    })

    it("returns the last computed result while suppressed", () => {
      const fn = vi.fn((x) => x * 2)
      const throttled = throttle(fn, 100)

      const first = throttled(5)
      const second = throttled(999) // suppressed, fn not called

      expect(first).toBe(10)
      expect(second).toBe(10)
    })
  })

  describe("hasTrailing: true", () => {
    it("invokes leading immediately, then trailing once with the last args", () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100, { hasTrailing: true })

      throttled("a")
      throttled("b")
      throttled("c")

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith("a")

      vi.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenNthCalledWith(2, "c")
    })

    it("does not fire a trailing call if nothing arrived during the window", () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100, { hasTrailing: true })

      throttled("a")
      vi.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledTimes(1)
    })

    it("preserves `this` binding for both leading and trailing calls", () => {
      const context = { value: 42 }
      let leadingThis
      let trailingThis

      const fn = vi.fn(function () {
        if (fn.mock.calls.length === 1) {
          leadingThis = this
        } else {
          trailingThis = this
        }
      })
      const throttled = throttle(fn, 100, { hasTrailing: true })

      throttled.call(context, "a")
      throttled.call(context, "b")
      vi.advanceTimersByTime(100)

      expect(leadingThis).toBe(context)
      expect(trailingThis).toBe(context)
    })
  })

  describe("cancel", () => {
    it("prevents a pending trailing call from firing", () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100, { hasTrailing: true })

      throttled("a")
      throttled("b")
      throttled.cancel()

      vi.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledTimes(1) // only the leading call
    })

    it("allows an immediate leading call right after cancel", () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)

      throttled("a")
      throttled.cancel()
      throttled("b")

      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe("pending", () => {
    it("is false before any call", () => {
      const throttled = throttle(vi.fn(), 100)
      expect(throttled.pending()).toBe(false)
    })

    it("is true during the suppression window", () => {
      const throttled = throttle(vi.fn(), 100)
      throttled("a")
      expect(throttled.pending()).toBe(true)
    })

    it("is false once the window closes with no trailing call queued", () => {
      const throttled = throttle(vi.fn(), 100)
      throttled("a")
      vi.advanceTimersByTime(100)
      expect(throttled.pending()).toBe(false)
    })

    it("reflects a queued trailing call even after the window nominally closes", () => {
      const throttled = throttle(vi.fn(), 100, { hasTrailing: true })
      throttled("a")
      throttled("b") // queues the trailing call
      expect(throttled.pending()).toBe(true)
    })
  })
})
