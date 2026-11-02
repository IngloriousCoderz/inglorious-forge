import { html } from "@inglorious/web"
import { render } from "@inglorious/web/test"
import { describe, expect, it, vi } from "vitest"

import { LoadStatus } from "."

function renderStatus(props) {
  const container = document.createElement("div")
  render(LoadStatus.render(props), container)
  return container
}

describe("page status", () => {
  it("prefers the error to the loader and the empty message", () => {
    const container = renderStatus({
      isError: true,
      error: "Offline",
      isLoading: true,
      isEmpty: true,
      emptyText: "Nothing yet",
    })

    const status = container.querySelector(".iw-load-status")
    expect(status.getAttribute("role")).toBe("alert")
    expect(status.textContent).toBe("Offline")
  })

  it("shows a named progress while loading, or the given loader", () => {
    const loading = renderStatus({
      isLoading: true,
      loadingLabel: "Caricamento",
    })
    expect(
      loading.querySelector("[role=status] [aria-label=Caricamento]"),
    ).not.toBeNull()

    const custom = renderStatus({
      isLoading: true,
      loader: html`<img src="/loader.svg" alt="Loading" />`,
    })
    expect(custom.querySelector("[role=status] img")).not.toBeNull()
  })

  it("shows the empty message, and nothing once there is content", () => {
    expect(
      renderStatus({ isEmpty: true, emptyText: "Nothing yet" }).textContent,
    ).toContain("Nothing yet")
    expect(renderStatus({}).querySelector(".iw-load-status")).toBeNull()
  })

  it("renders the content only when there is no status", () => {
    const content = vi.fn(() => html`<main>Events</main>`)

    expect(
      renderStatus({ isLoading: true, content }).querySelector("main"),
    ).toBeNull()
    expect(content).not.toHaveBeenCalled()

    expect(renderStatus({ content }).querySelector("main").textContent).toBe(
      "Events",
    )
  })
})
