import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { List } from "."

describe("list", () => {
  it("renders list items", () => {
    const props = {
      id: "list",
      padding: "sm",
      items: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
    }
    const container = document.createElement("div")

    render(List.render(props), container)

    expect(container.querySelectorAll(".iw-list-item")).toHaveLength(2)
    expect(
      container
        .querySelector(".iw-list")
        .classList.contains("iw-list-padding-sm"),
    ).toBe(true)
  })

  it("renders ordered list when isOrdered is true", () => {
    const props = {
      id: "list",
      isOrdered: true,
      items: ["A", "B"],
    }
    const container = document.createElement("div")

    render(List.render(props), container)

    expect(container.querySelector("ol")).not.toBeNull()
  })

  it("applies dense and divided classes", () => {
    const props = {
      id: "list",
      isDense: true,
      isDivided: true,
      items: ["A", "B"],
    }
    const container = document.createElement("div")

    render(List.render(props), container)

    const root = container.querySelector(".iw-list")
    expect(root.classList.contains("iw-list-dense")).toBe(true)
    expect(root.classList.contains("iw-list-divided")).toBe(true)
  })

  it("dispatches item click with payload", () => {
    let clicked = null
    const props = {
      id: "list",
      items: [{ id: "a", label: "A" }],
      onItemClick: (item, path) => (clicked = { item, path }),
    }
    const container = document.createElement("div")

    render(List.render(props), container)

    container.querySelector(".iw-list-item").click()
    expect(clicked).toEqual({
      item: { id: "a", label: "A" },
      path: [0],
    })
  })

  it("renders icon and secondary text", () => {
    const props = {
      id: "list",
      items: [
        {
          id: "a",
          icon: "★",
          primary: "Starred",
          secondary: "Pinned",
        },
      ],
    }
    const container = document.createElement("div")

    render(List.render(props), container)

    expect(container.querySelector(".iw-icon").textContent).toBe("★")
    expect(
      container.querySelector(".iw-list-item-secondary").textContent.trim(),
    ).toBe("Pinned")
  })

  it("applies inset alignment for items without icons", () => {
    const props = {
      id: "list",
      isInset: true,
      items: [
        { id: "a", icon: "★", primary: "With icon" },
        { id: "b", primary: "Without icon" },
      ],
    }
    const container = document.createElement("div")

    render(List.render(props), container)

    const items = container.querySelectorAll(".iw-list-item")
    expect(items[0].classList.contains("iw-list-item-inset")).toBe(false)
    expect(items[1].classList.contains("iw-list-item-inset")).toBe(true)
  })

  it("applies selected and disabled styles", () => {
    const props = {
      id: "list",
      items: [
        { id: "a", primary: "Selected", isSelected: true },
        { id: "b", primary: "Disabled", isDisabled: true },
      ],
    }
    const container = document.createElement("div")

    render(List.render(props), container)

    const items = container.querySelectorAll(".iw-list-item")
    expect(items[0].classList.contains("iw-list-item-selected")).toBe(true)
    expect(items[1].classList.contains("iw-list-item-disabled")).toBe(true)
  })

  it("renders nested lists from children array", () => {
    const props = {
      id: "list",
      items: [
        {
          id: "a",
          primary: "Parent",
          isExpanded: true,
          children: [{ id: "a-1", primary: "Child" }],
        },
      ],
    }
    const container = document.createElement("div")

    render(List.render(props), container)

    expect(container.querySelector(".iw-list-nested")).not.toBeNull()
  })

  it("dispatches click for nested item once with path", () => {
    let clicked = []
    const props = {
      id: "list",
      onItemClick: (item, path) => clicked.push({ item, path }),
      items: [
        {
          id: "a",
          primary: "Parent",
          isExpanded: true,
          children: [{ id: "a-1", primary: "Child" }],
        },
      ],
    }
    const container = document.createElement("div")

    render(List.render(props), container)

    const nested = container.querySelector(".iw-list-nested .iw-list-item")
    nested.click()

    expect(clicked).toHaveLength(1)
    expect(clicked[0].path).toEqual([0, 0])
  })

  it("toggles expandable items when the row is clicked", () => {
    let toggled = null
    const props = {
      id: "list",
      onItemToggle: (item, path) => (toggled = { item, path }),
      items: [
        {
          id: "a",
          primary: "Parent",
          isExpanded: false,
          children: [{ id: "a-1", primary: "Child" }],
        },
      ],
    }
    const container = document.createElement("div")

    render(List.render(props), container)

    container.querySelector(".iw-list-item").click()

    expect(toggled).toEqual({
      item: props.items[0],
      path: [0],
    })
  })

  it("does not render nested list when collapsed", () => {
    const props = {
      id: "list",
      items: [
        {
          id: "a",
          primary: "Parent",
          isExpanded: false,
          children: [{ id: "a-1", primary: "Child" }],
        },
      ],
    }
    const container = document.createElement("div")

    render(List.render(props), container)

    expect(container.querySelector(".iw-list-nested")).toBeNull()
  })

  it("renders action content and dispatches toggle", () => {
    let toggled = null
    const props = {
      id: "list",
      onItemToggle: (item, path) => (toggled = { item, path }),
      items: [
        {
          id: "a",
          primary: "Parent",
          action: "On",
          isExpanded: true,
          children: [{ id: "a-1", primary: "Child" }],
        },
      ],
    }
    const container = document.createElement("div")

    render(List.render(props), container)

    expect(
      container.querySelector(".iw-list-item-action").textContent.trim(),
    ).toBe("On")
    expect(container.querySelector(".iw-list-item-trailing")).not.toBeNull()
    container.querySelector(".iw-list-item-toggle").click()
    expect(toggled).toEqual({
      item: props.items[0],
      path: [0],
    })
  })
})
