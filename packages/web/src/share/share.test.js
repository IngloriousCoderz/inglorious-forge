/**
 * @vitest-environment jsdom
 */
import { createStore } from "@inglorious/store"
import { afterEach, describe, expect, it, vi } from "vitest"

import { createShare } from "./index.js"

const LINK = { title: "Wedding in Florence", url: "https://vaitu.app/jobs/1" }

function storeWith(config) {
  return createStore({
    types: { Share: createShare(config) },
    entities: { share: { type: "Share" } },
  })
}

async function shareWith(store, content) {
  store.notify("#share:share", content)
  await new Promise((resolve) => setTimeout(resolve))
  return store.getEntity("share")
}

function stubNavigator(fields) {
  vi.stubGlobal("navigator", { ...fields })
}

function native() {
  vi.stubGlobal("Capacitor", { isNativePlatform: () => true })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("createShare", () => {
  it("opens the system's sheet in a native app", async () => {
    native()
    const plugin = { share: vi.fn(async () => ({})) }

    const share = await shareWith(storeWith({ plugin }), LINK)

    expect(plugin.share).toHaveBeenCalledWith({
      ...LINK,
      text: undefined,
      dialogTitle: LINK.title,
    })
    expect(share).toMatchObject({ status: "success", result: "shared" })
  })

  it("takes a closed sheet as cancelled, not failed", async () => {
    native()
    const plugin = {
      share: vi.fn(async () => {
        throw new Error("Share canceled")
      }),
    }

    const share = await shareWith(storeWith({ plugin }), LINK)

    expect(share).toMatchObject({ status: "success", result: "cancelled" })
  })

  it("leaves the plugin to native apps", async () => {
    const plugin = { share: vi.fn() }
    const webShare = vi.fn(async () => {})
    stubNavigator({ share: webShare })

    await shareWith(storeWith({ plugin }), LINK)

    expect(plugin.share).not.toHaveBeenCalled()
    expect(webShare).toHaveBeenCalled()
  })

  it("downloads a file in a browser", async () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {})

    const share = await shareWith(storeWith(), {
      ...LINK,
      fileName: "wedding.ics",
    })

    const [link] = click.mock.contexts
    expect(link.download).toBe("wedding.ics")
    expect(link.href).toBe(LINK.url)
    expect(share.result).toBe("downloaded")
  })

  it("uses the browser's sheet, and takes closing it as cancelled", async () => {
    const webShare = vi.fn(async () => {
      throw Object.assign(new Error("closed"), { name: "AbortError" })
    })
    stubNavigator({ share: webShare })

    const share = await shareWith(storeWith(), LINK)

    expect(webShare).toHaveBeenCalledWith({ ...LINK, text: undefined })
    expect(share.result).toBe("cancelled")
  })

  it("copies the link where there is no sheet", async () => {
    const writeText = vi.fn(async () => {})
    stubNavigator({ clipboard: { writeText } })

    const share = await shareWith(storeWith(), LINK)

    expect(writeText).toHaveBeenCalledWith(LINK.url)
    expect(share).toMatchObject({ result: "copied", canShare: true })
  })

  it("says it can't share where nothing is available", async () => {
    stubNavigator({})
    const store = storeWith()

    expect(store.getEntity("share").canShare).toBe(false)
    const share = await shareWith(store, LINK)

    expect(share).toMatchObject({ status: "error", error: "unsupported" })
  })

  it("reports other failures", async () => {
    stubNavigator({
      share: vi.fn(async () => {
        throw new Error("NotAllowedError")
      }),
    })

    const share = await shareWith(storeWith(), LINK)

    expect(share).toMatchObject({ status: "error", error: "failed" })
  })
})
