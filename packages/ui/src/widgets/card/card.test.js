import { html } from "@inglorious/web"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { card } from "."

describe("card", () => {
  describe("render", () => {
    it("renders title and subtitle", () => {
      const entity = { id: "card", title: "Title", subtitle: "Subtitle" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(card.render(entity, api), container)

      expect(container.querySelector(".iw-card-title").textContent).toBe(
        "Title",
      )
      expect(container.querySelector(".iw-card-subtitle").textContent).toBe(
        "Subtitle",
      )
    })

    it("applies modifier classes", () => {
      const entity = {
        id: "card",
        hoverable: true,
        clickable: true,
        fullWidth: true,
      }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(card.render(entity, api), container)

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
      const entity = { id: "card", type: "customCard", footerText: "Footer" }
      const api = createMockApi({ [entity.id]: entity })
      api.getType = () => customCard
      const container = document.createElement("div")

      render(customCard.render(entity, api), container)

      expect(
        container.querySelector(".iw-card-footer").textContent.trim(),
      ).toBe("Footer")
    })

    it("omits header when no header content is provided", () => {
      const entity = { id: "card" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(card.render(entity, api), container)

      expect(container.querySelector(".iw-card-header")).toBe(null)
    })
  })

  describe("click event", () => {
    it("dispatches click event", () => {
      const entity = { id: "card", title: "Click me" }
      const api = createMockApi({ [entity.id]: entity })
      const container = document.createElement("div")

      render(card.render(entity, api), container)

      container.querySelector(".iw-card").click()

      expect(api.getEvents()).toEqual([{ type: "#card:click" }])
    })
  })
})
