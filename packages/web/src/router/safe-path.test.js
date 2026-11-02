import { describe, expect, it } from "vitest"

import { safePath } from "./safe-path.js"

describe("safePath", () => {
  it("keeps a path on this site, with its query and hash", () => {
    expect(safePath("/events/42?tab=info#top")).toBe("/events/42?tab=info#top")
  })

  it.each([
    "//evil.com",
    "/\\evil.com",
    "/\t/evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "events",
    "",
    null,
    undefined,
    42,
  ])("refuses %j", (value) => {
    expect(safePath(value)).toBeNull()
  })
})
