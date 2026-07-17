import { html } from "@inglorious/web"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Carousel } from "."

const items = ["one", "two", "three"]

function setup(overrides = {}) {
  const entity = {
    id: "c",
    type: "Carousel",
    items,
    page: 0,
    ...overrides,
  }
  const api = createMockApi({ [entity.id]: entity })
  api.getType = () => Carousel
  const container = document.createElement("div")

  render(Carousel.render(entity, api), container)

  return { entity, api, container }
}

describe("carousel", () => {
  it("renders one item per entry", () => {
    const { container } = setup()

    const rendered = container.querySelectorAll(".iw-carousel-item")
    expect(rendered.length).toBe(3)
    expect(rendered[0].textContent.trim()).toBe("one")
    expect(rendered[0].getAttribute("aria-label")).toBe("1 of 3")
  })

  it("labels the viewport as a carousel", () => {
    const { container } = setup({ label: "Photos" })

    const viewport = container.querySelector(".iw-carousel-viewport")
    expect(viewport.getAttribute("aria-roledescription")).toBe("carousel")
    expect(viewport.getAttribute("aria-label")).toBe("Photos")
    expect(viewport.getAttribute("tabindex")).toBe("0")
  })

  it("marks the current indicator", () => {
    const { container } = setup({ page: 1 })

    const dots = container.querySelectorAll(".iw-carousel-indicator")
    expect(dots.length).toBe(3)
    expect(dots[1].classList.contains("iw-carousel-indicator-current")).toBe(
      true,
    )
    expect(dots[1].getAttribute("aria-current")).toBe("page")
  })

  it("disables the arrows at either end", () => {
    const first = setup({ page: 0 })
    expect(
      first.container.querySelector(".iw-carousel-arrow-previous").disabled,
    ).toBe(true)
    expect(
      first.container.querySelector(".iw-carousel-arrow-next").disabled,
    ).toBe(false)

    const last = setup({ page: 2 })
    expect(
      last.container.querySelector(".iw-carousel-arrow-previous").disabled,
    ).toBe(false)
    expect(
      last.container.querySelector(".iw-carousel-arrow-next").disabled,
    ).toBe(true)
  })

  it("hides arrows and indicators when asked", () => {
    const { container } = setup({ hasArrows: false, hasIndicators: false })

    expect(container.querySelector(".iw-carousel-arrow")).toBeNull()
    expect(container.querySelector(".iw-carousel-indicators")).toBeNull()
  })

  it("goes vertical on the y axis", () => {
    const { container } = setup({ axis: "y" })

    expect(
      container
        .querySelector(".iw-carousel")
        .classList.contains("iw-carousel-vertical"),
    ).toBe(true)
  })

  it("applies gap and alignment classes", () => {
    const { container } = setup({ gap: "lg", align: "center" })

    const root = container.querySelector(".iw-carousel")
    expect(root.classList.contains("iw-carousel-gap-lg")).toBe(true)
    expect(root.classList.contains("iw-carousel-align-center")).toBe(true)
  })

  it("reports the settled page from a scroll", () => {
    const { container, api } = setup()

    const viewport = container.querySelector(".iw-carousel-viewport")
    // jsdom has no layout, so fake the offsets the listener reads.
    viewport.querySelectorAll(".iw-carousel-item").forEach((item, index) => {
      Object.defineProperty(item, "offsetLeft", { value: index * 100 })
    })
    viewport.scrollLeft = 200
    viewport.dispatchEvent(new Event("scroll"))

    expect(api.getEvents()).toEqual([{ type: "#c:pageChange", payload: 2 }])
  })

  it("lets consumers override the arrow and indicator sub-renders", () => {
    const entity = { id: "c", type: "Carousel", items, page: 0 }
    const api = createMockApi({ [entity.id]: entity })
    const CustomCarousel = {
      ...Carousel,
      renderArrow: (props, direction) =>
        html`<button class="my-arrow">${direction}</button>`,
    }
    const container = document.createElement("div")

    render(CustomCarousel.render(entity, api), container)

    expect(container.querySelectorAll(".my-arrow").length).toBe(2)
    expect(container.querySelector(".iw-carousel-arrow")).toBeNull()
  })

  it("create initializes page and defaults", () => {
    const entity = { id: "c" }

    Carousel.create(entity)

    expect(entity.page).toBe(0)
    expect(entity.axis).toBe("x")
    expect(entity.items).toEqual([])
    expect(entity.hasArrows).toBe(true)
    expect(entity.hasIndicators).toBe(true)
  })

  it("pageChange clamps to the available items", () => {
    const entity = { id: "c", items, page: 0 }

    Carousel.pageChange(entity, 99)
    expect(entity.page).toBe(2)

    Carousel.pageChange(entity, -5)
    expect(entity.page).toBe(0)

    Carousel.pageChange(entity, 1)
    expect(entity.page).toBe(1)
  })

  it("pageChange ignores values that are not numbers", () => {
    const entity = { id: "c", items, page: 1 }

    Carousel.pageChange(entity, "nope")

    expect(entity.page).toBe(1)
  })
})
