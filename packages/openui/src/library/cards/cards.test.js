import { afterEach, describe, expect, it, vi } from "vitest"

import { flush, setup } from "../test-helpers.js"

describe("Card blocks", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.replaceChildren()
  })

  const icons = { euro: { body: "<path/>", width: 24, height: 24 } }

  it("lays KPI cards out in a grid, a badge over each figure", async () => {
    const { container } = await setup({
      icons,
      response: `root = OverviewCardBlock([a, b])
a = OverviewCardItem("rev", IconText(Icon("euro"), "success", "m", "Revenue"), MetricIndicatorInline("€12,400", "this month", {direction: "up", value: 8}))
b = OverviewCardItem("ord", Text("text", "Orders"), MetricIndicatorInline("318", null, {direction: "down", value: 3}))
`,
    })

    expect(container.querySelector(".iw-grid")).not.toBeNull()
    expect(container.querySelectorAll(".iw-card")).toHaveLength(2)
    expect(container.querySelector(".iw-card svg")).not.toBeNull()
    expect(container.textContent).toContain("▲ 8%")
    expect(container.textContent).toContain("▼ 3%")
  })

  it("draws snippets, context cards, composite cards and photo cards", async () => {
    const { container } = await setup({
      icons,
      response: `root = Stack([facts, notes, offers, photos])
facts = SnippetCardBlock([SnippetCardItem("a", IconText(Icon("euro"), "neutral", "s", "Fee"), BoldText("number", "€5")), SnippetCardItem("b", ImageText("a.jpg", "", "Ada"), Text("text", "Owner"))])
notes = ContextCardBlock([ContextCardItem("n1", "Rent", "Up **4%**", "gray"), ContextCardItem("n2", Tag("Food", null, "sm", "success"), "Down")])
offers = CompositeCardBlock([CompositeCardItem("p1", ImageTextLarge("p.jpg", "", "Plan"), [Text("text", "All features")], {price: MetricIndicatorWithStrikethrough("€79", "a year", "€99"), button: Button("Buy")}), CompositeCardItem("p2", Text("text", "Free"), [])])
photos = VisualCardBlock([VisualCardItem(BoldText("text", "Rome"), "r", "rome.jpg", Tag("Italy"), "The Colosseum"), VisualCardItem(BoldText("text", "Oslo"), "o", "oslo.jpg")], "carousel")
`,
    })

    expect(container.querySelector(".iw-card-sunk strong").textContent).toBe(
      "4%",
    )
    expect(container.querySelector("s").textContent).toBe("€99")
    expect(container.textContent).toContain("Buy")
    expect(
      container.querySelector('[role="img"][aria-label="The Colosseum"]'),
    ).not.toBeNull()
    expect(container.querySelectorAll(".iw-carousel-item")).toHaveLength(2)
  })

  it("makes every card run the block's action, saying which card it was", async () => {
    const onAction = vi.fn()
    const { container } = await setup({
      onAction,
      response: `root = ContextCardBlock([ContextCardItem("n1", "Rent"), ContextCardItem("n2", "Food")], "grid", true, @ToAssistant("Tell me more"))
`,
    })

    const [, food] = container.querySelectorAll('[role="button"]')
    food.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }))
    await flush()

    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({
        humanFriendlyMessage: "Tell me more",
        params: {
          context:
            'Selected item: {"itemIndex":1,"itemId":"n2","itemTitle":"Food"}',
        },
      }),
    )
  })

  it("colours a metric's sign", async () => {
    const { container } = await setup({
      response: `root = Stack([Text("number", "€40", "+12%", "metric"), Text("number", "€30", "-5%", "metric")])
`,
    })

    const [up, down] = [...container.querySelectorAll(".iw-typography")]
      .filter((element) => /^[+-]\d/.test(element.textContent.trim()))
      .map((element) => element.getAttribute("style"))
    expect(up).toContain("--iw-color-success")
    expect(down).toContain("--iw-color-error")
  })
})
