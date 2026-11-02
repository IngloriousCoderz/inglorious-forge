import { describe, expect, it } from "vitest"

import { format, toField } from "./helpers.js"

describe("toField", () => {
  it("shows no value as an empty field", () => {
    expect(toField(undefined, "number")).toBe("")
    expect(toField(Number.NaN, "time")).toBe("")
  })

  it("turns a date filter back into the text it came from", () => {
    expect(toField(format("2026-03-04", "date"), "date")).toBe("2026-03-04")
  })

  it("turns a datetime filter back into the text it came from", () => {
    expect(toField(format("2026-03-04T10:30", "date"), "datetime-local")).toBe(
      "2026-03-04T10:30",
    )
  })

  it("keeps numbers and text as they are", () => {
    expect(toField(30, "number")).toBe(30)
    expect(toField("Ali", "text")).toBe("Ali")
  })
})
