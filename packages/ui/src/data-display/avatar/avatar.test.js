import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Avatar } from "."

describe("avatar", () => {
  it("renders initials", () => {
    const props = { id: "av", initials: "AB", color: "primary" }
    const container = document.createElement("div")

    render(Avatar.render(props), container)

    expect(container.querySelector(".iw-avatar").textContent.trim()).toBe("AB")
    expect(
      container
        .querySelector(".iw-avatar")
        .classList.contains("iw-avatar-color-primary"),
    ).toBe(true)
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

    render(Avatar.render(props), container)

    const root = container.querySelector(".iw-avatar")
    const img = container.querySelector(".iw-avatar-img")
    expect(root.classList.contains("iw-avatar-lg")).toBe(true)
    expect(root.classList.contains("iw-avatar-square")).toBe(true)
    expect(img.getAttribute("alt")).toBe("Profile")
    root.click()
    expect(isClicked).toBe(true)
  })

  it("applies custom background and text colors", () => {
    const props = {
      id: "av",
      initials: "CD",
      backgroundColor: "rgb(15, 23, 42)",
      textColor: "rgb(248, 250, 252)",
    }
    const container = document.createElement("div")

    render(Avatar.render(props), container)

    const root = container.querySelector(".iw-avatar")
    expect(root.style.background).toBe("rgb(15, 23, 42)")
    expect(root.style.color).toBe("rgb(248, 250, 252)")
  })

  it("derives a deterministic color for auto", () => {
    const props = { id: "av", initials: "Auto", color: "auto" }
    const container = document.createElement("div")

    render(Avatar.render(props), container)

    const root = container.querySelector(".iw-avatar")
    expect(root.getAttribute("style")).toContain("background:hsl(")
  })
})
