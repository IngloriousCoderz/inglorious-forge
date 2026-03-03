import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { avatar } from "."

describe("avatar", () => {
  it("renders initials", () => {
    const props = { id: "av", initials: "AB" }
    const container = document.createElement("div")

    render(avatar.render(props), container)

    expect(container.querySelector(".iw-avatar").textContent.trim()).toBe("AB")
  })

  it("renders image with alt and applies size/shape classes", () => {
    let isClicked = false
    const props = {
      id: "av",
      src: "/avatar.png",
      alt: "Profile",
      size: "lg",
      shape: "square",
      onClick: () => (isClicked = true),
    }
    const container = document.createElement("div")

    render(avatar.render(props), container)

    const root = container.querySelector(".iw-avatar")
    const img = container.querySelector(".iw-avatar-img")
    expect(root.classList.contains("iw-avatar-lg")).toBe(true)
    expect(root.classList.contains("iw-avatar-square")).toBe(true)
    expect(img.getAttribute("alt")).toBe("Profile")
    root.click()
    expect(isClicked).toBe(true)
  })
})
