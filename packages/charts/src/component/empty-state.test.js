/**
 * @vitest-environment jsdom
 */
import { render } from "lit-html"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderEmptyState } from "./empty-state.js"

describe("renderEmptyState", () => {
  let entity
  let props
  let api

  beforeEach(() => {
    entity = {
      id: "test-chart",
      type: "line",
      data: [],
      width: 800,
      height: 400,
    }

    props = {
      message: "No data available",
    }

    api = {
      notify: vi.fn(),
    }
  })

  describe("basic rendering", () => {
    it("should render empty state message", () => {
      props.width = 800
      props.height = 400

      const result = renderEmptyState(entity, props, api)
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()

      const text = container.querySelector("text")
      expect(text).toBeTruthy()
      expect(text.textContent).toContain("No data available")
    })

    it("should use default message when not provided", () => {
      props.width = 800
      props.height = 400
      delete props.message

      const result = renderEmptyState(entity, props, api)
      const container = document.createElement("div")
      render(result, container)

      const svg = container.querySelector("svg")
      expect(svg).toBeTruthy()

      const text = container.querySelector("text")
      expect(text).toBeTruthy()
      expect(text.textContent).toBeTruthy()
    })
  })

  describe("with custom message", () => {
    it("should render custom message", () => {
      props.width = 800
      props.height = 400
      props.message = "Custom empty message"

      const result = renderEmptyState(entity, props, api)
      const container = document.createElement("div")
      render(result, container)

      const text = container.querySelector("text")
      expect(text.textContent).toContain("Custom empty message")
    })
  })
})
