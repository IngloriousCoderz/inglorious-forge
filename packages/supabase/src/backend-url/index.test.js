import { describe, expect, it } from "vitest"

import { backendUrl } from "./index.js"

const LOCAL = "http://127.0.0.1:54321"

describe("backendUrl", () => {
  it("keeps a local backend for a page served on this computer", () => {
    expect(backendUrl(LOCAL, "localhost")).toBe(LOCAL)
    expect(backendUrl(LOCAL, "")).toBe(LOCAL)
  })

  it("reaches a local backend from a phone on the network", () => {
    expect(backendUrl(LOCAL, "192.168.1.20")).toBe("http://192.168.1.20:54321")
  })

  it("never changes a hosted backend", () => {
    const hosted = "https://abcd.supabase.co"
    expect(backendUrl(hosted, "192.168.1.20")).toBe(hosted)
  })
})
