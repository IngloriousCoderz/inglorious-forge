import { describe, expect, it, vi } from "vitest"

import { supabaseNativeUpdate } from "./index.js"

function fakeClient(result) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    abortSignal: vi.fn(() => query),
    maybeSingle: vi.fn(async () => result),
  }
  return { query, from: vi.fn(() => query) }
}

describe("supabaseNativeUpdate", () => {
  it("reads the platform's row of app_versions", async () => {
    const client = fakeClient({
      data: { min_build: 4, store_url: "https://apps.apple.com/app/id1" },
      error: null,
    })

    const requirement = await supabaseNativeUpdate(client).requirement("ios")

    expect(client.from).toHaveBeenCalledWith("app_versions")
    expect(client.query.select).toHaveBeenCalledWith("min_build, store_url")
    expect(client.query.eq).toHaveBeenCalledWith("platform", "ios")
    expect(requirement).toEqual({
      minBuild: 4,
      storeUrl: "https://apps.apple.com/app/id1",
    })
  })

  it("answers null for a platform with no row", async () => {
    const client = fakeClient({ data: null, error: null })

    expect(await supabaseNativeUpdate(client).requirement("android")).toBe(null)
  })

  it("reads another table", async () => {
    const client = fakeClient({ data: null, error: null })

    await supabaseNativeUpdate(client, { table: "builds" }).requirement("ios")

    expect(client.from).toHaveBeenCalledWith("builds")
  })

  it("throws what Supabase refused", async () => {
    const error = new Error("permission denied")
    const client = fakeClient({ data: null, error })

    await expect(supabaseNativeUpdate(client).requirement("ios")).rejects.toBe(
      error,
    )
  })
})
