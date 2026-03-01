import { html } from "@inglorious/web"
import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { card } from "."

describe("card", () => {
  describe("render", () => {
    it("renders title and subtitle", () => {
      const props = { id: "card", title: "Title", subtitle: "Subtitle" }
      const container = document.createElement("div")

      render(card.render(props), container)

      expect(container.querySelector(".iw-card-title").textContent).toBe(
        "Title",
      )
      expect(container.querySelector(".iw-card-subtitle").textContent).toBe(
        "Subtitle",
      )
    })

    it("applies modifier classes", () => {
      const props = {
        id: "card",
        hoverable: true,
        clickable: true,
        fullWidth: true,
      }
      const container = document.createElement("div")

      render(card.render(props), container)

      const cardElement = container.querySelector(".iw-card")
      expect(cardElement.classList.contains("iw-card-hoverable")).toBe(true)
      expect(cardElement.classList.contains("iw-card-clickable")).toBe(true)
      expect(cardElement.classList.contains("iw-card-full-width")).toBe(true)
    })

    it("renders footer when type overrides renderFooter", () => {
      const customCard = {
        ...card,
        renderFooter: () => html`<div class="iw-card-footer">Footer</div>`,
      }
      const props = { id: "card", type: "customCard", footerText: "Footer" }
      const container = document.createElement("div")

      render(customCard.render(props), container)

      expect(
        container.querySelector(".iw-card-footer").textContent.trim(),
      ).toBe("Footer")
    })

    it("omits header when no header content is provided", () => {
      const props = { id: "card" }
      const container = document.createElement("div")

      render(card.render(props), container)

      expect(container.querySelector(".iw-card-header")).toBe(null)
    })
  })

  describe("click event", () => {
    it("dispatches click event", () => {
      let isClicked = null
      const props = {
        id: "card",
        title: "Click me",
        onClick: () => (isClicked = true),
      }
      const container = document.createElement("div")

      render(card.render(props), container)

      container.querySelector(".iw-card").click()

      expect(isClicked).toBe(true)
    })
  })
})
