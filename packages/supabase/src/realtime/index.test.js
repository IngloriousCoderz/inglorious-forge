import { describe, expect, it, vi } from "vitest"

import { realtimeSource } from "./index.js"

function fakeClient() {
  let restore
  const session = new Promise((resolve) => {
    restore = resolve
  })
  const channels = []
  return {
    channels,
    restoreSession: () => restore({ data: { session: null } }),
    auth: { getSession: () => session },
    channel: vi.fn((topic) => {
      const channel = {
        topic,
        on: vi.fn((_, filter, onChange) => {
          channel.filter = filter
          channel.change = onChange
          return channel
        }),
        subscribe: vi.fn((onStatus) => {
          channel.status = onStatus
          return channel
        }),
      }
      channels.push(channel)
      return channel
    }),
    removeChannel: vi.fn(async () => {}),
  }
}

const settle = () => new Promise((resolve) => setTimeout(resolve))

describe("realtimeSource", () => {
  it("shares one channel per table between its subscribers", async () => {
    const client = fakeClient()
    const source = realtimeSource(client)
    const first = vi.fn()
    const second = vi.fn()

    source.subscribe("applications", first)
    source.subscribe("applications", second)
    source.subscribe("events", vi.fn())

    expect(client.channel).toHaveBeenCalledTimes(2)
    expect(client.channels[0].filter).toEqual({
      event: "*",
      schema: "public",
      table: "applications",
    })

    client.channels[0].change()
    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)
  })

  it("joins only once the saved session is restored", async () => {
    const client = fakeClient()
    realtimeSource(client).subscribe("applications", vi.fn())
    await settle()
    expect(client.channels[0].subscribe).not.toHaveBeenCalled()

    client.restoreSession()
    await settle()
    expect(client.channels[0].subscribe).toHaveBeenCalledTimes(1)
  })

  it("tells its subscribers when it joins again after a dropped connection", async () => {
    const client = fakeClient()
    const onChange = vi.fn()
    realtimeSource(client).subscribe("applications", onChange)
    client.restoreSession()
    await settle()

    const { status } = client.channels[0]
    status("SUBSCRIBED")
    expect(onChange).not.toHaveBeenCalled()
    status("CHANNEL_ERROR")
    status("SUBSCRIBED")
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it("closes a table's channel with its last subscriber", async () => {
    const client = fakeClient()
    const source = realtimeSource(client)
    const unsubscribeFirst = source.subscribe("applications", vi.fn())
    const unsubscribeSecond = source.subscribe("applications", vi.fn())

    unsubscribeFirst()
    expect(client.removeChannel).not.toHaveBeenCalled()
    unsubscribeSecond()
    unsubscribeSecond()
    expect(client.removeChannel).toHaveBeenCalledTimes(1)

    client.restoreSession()
    await settle()
    expect(client.channels[0].subscribe).not.toHaveBeenCalled()

    source.subscribe("applications", vi.fn())
    expect(client.channel).toHaveBeenCalledTimes(2)
  })

  it("names its channels apart from another source's on the same client", () => {
    const client = fakeClient()
    realtimeSource(client).subscribe("applications", vi.fn())
    realtimeSource(client).subscribe("applications", vi.fn())

    const [first, second] = client.channels.map((channel) => channel.topic)
    expect(first).not.toBe(second)
  })
})
