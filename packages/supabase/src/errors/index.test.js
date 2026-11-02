import { describe, expect, it } from "vitest"

import { isNetworkError } from "./index.js"

describe("isNetworkError", () => {
  it("recognizes each client's failed request", () => {
    expect(isNetworkError({ message: "TypeError: Failed to fetch" })).toBe(true)
    expect(isNetworkError(new TypeError("Load failed"))).toBe(true)
    expect(
      isNetworkError({
        name: "FunctionsFetchError",
        message: "Failed to send",
      }),
    ).toBe(true)
    expect(isNetworkError({ name: "AuthRetryableFetchError" })).toBe(true)
    expect(
      isNetworkError({
        name: "StorageUnknownError",
        originalError: new TypeError(
          "NetworkError when attempting to fetch resource.",
        ),
      }),
    ).toBe(true)
  })

  it("leaves the server's own refusals alone", () => {
    expect(
      isNetworkError({ message: "new row violates row-level security policy" }),
    ).toBe(false)
    expect(isNetworkError(new TypeError("x is undefined"))).toBe(false)
    expect(isNetworkError(null)).toBe(false)
    expect(isNetworkError("Failed to fetch")).toBe(false)
  })
})
