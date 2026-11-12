import { describe, expect, it } from "vitest"

import { DEFAULT_DEVICES, resolveDevices, screenUrl } from "./devices.js"
import { promoHtml } from "./promo.js"

describe("resolveDevices", () => {
  it("defaults to the sizes both stores require", () => {
    expect(resolveDevices().map(([name]) => name)).toEqual(DEFAULT_DEVICES)
  })

  it("gives each device the store's pixel size", () => {
    const [[, iphone]] = resolveDevices(["iphone-6.9"])
    expect(iphone.viewport.width * iphone.scale).toBe(1320)
    expect(iphone.viewport.height * iphone.scale).toBe(2868)
  })

  it("names the devices it doesn't know", () => {
    expect(() => resolveDevices(["iphone-6.9", "watch"])).toThrow("watch")
  })
})

describe("screenUrl", () => {
  it("adds the locale to the path's own query", () => {
    expect(
      screenUrl("http://localhost:5173", "/jobs?status=open", {
        locale: "it",
        localeParam: "lang",
      }),
    ).toBe("http://localhost:5173/jobs?status=open&lang=it")
  })

  it("leaves the path alone when the app doesn't read the locale from links", () => {
    expect(screenUrl("http://localhost:5173", "/jobs", { locale: "it" })).toBe(
      "http://localhost:5173/jobs",
    )
  })
})

describe("promoHtml", () => {
  const options = {
    logo: "data:image/png;base64,",
    name: "Tom & Jerry",
    tagline: "First <line>\nSecond",
    background: "#fff",
  }

  it("escapes the name and breaks the tagline into lines", () => {
    const html = promoHtml("feature-graphic", options)
    expect(html).toContain("Tom &amp; Jerry")
    expect(html).toContain("First &lt;line&gt;<br>Second")
  })

  it("frames a screenshot at each edge of the header", () => {
    const html = promoHtml("header", { ...options, shots: ["a.png", "b.png"] })
    expect(html).toMatch(/src="a\.png"[^>]*left:/)
    expect(html).toMatch(/src="b\.png"[^>]*right:/)
  })

  it("leaves out what isn't given", () => {
    const html = promoHtml("search-results", options)
    expect(html).not.toContain('<img src="a.png')
    expect(html).not.toContain("opacity")
  })
})
