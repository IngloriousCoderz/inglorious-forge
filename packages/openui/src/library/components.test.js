import { createStore } from "@inglorious/store"
import { mount } from "@inglorious/web"
import { afterEach, describe, expect, it, vi } from "vitest"

import { createOpenUI } from "../index.js"
import { chartComponents } from "./charts.js"
import { uiLibrary } from "./index.js"

const SIGN_UP = `root = Stack([signUp])
signUp = Form("signup", Buttons([Button("Sign up", @ToAssistant("Signed up"))]), [email, plan, topics])
email = FormControl("Email", Input("email", "you@example.com", "email", {required: true, email: true}))
plan = FormControl("Plan", Select("plan", [SelectItem("free", "Free"), SelectItem("pro", "Pro")]))
topics = FormControl("Topics", CheckBoxGroup("topics", [CheckBoxItem("News", "", "news"), CheckBoxItem("Offers", "", "offers")]))
`

describe("uiLibrary components", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.replaceChildren()
  })

  describe("Form", () => {
    it("labels its fields", async () => {
      const { container } = await setup({ response: SIGN_UP })

      expect(container.textContent).toContain("Email")
      expect(container.querySelectorAll("select option")).toHaveLength(3)
      expect(container.querySelectorAll("input[type=checkbox]")).toHaveLength(2)
    })

    it("keeps its fields' values under its name", async () => {
      const { store, container } = await setup({ response: SIGN_UP })

      type(container.querySelector("input[name=email]"), "ada@example.com")
      choose(container.querySelector("select"), "pro")
      await flush()
      tick(container.querySelectorAll("input[type=checkbox]")[1])
      await flush()

      expect(store.getState().answer.values).toEqual({
        signup: {
          email: "ada@example.com",
          plan: "pro",
          topics: { offers: true },
        },
      })
    })

    it("stops a primary button while a rule fails, and says why", async () => {
      const onAction = vi.fn()
      const { store, container } = await setup({
        response: SIGN_UP,
        onAction,
      })

      container.querySelector(".iw-button").click()
      await flush()

      expect(onAction).not.toHaveBeenCalled()
      expect(store.getState().answer.fieldErrors.signup).toEqual({
        email: "This field is required",
      })
      expect(container.textContent).toContain("This field is required")
    })

    it("clears a field's error as it changes", async () => {
      const { store, container } = await setup({ response: SIGN_UP })
      container.querySelector(".iw-button").click()
      await flush()

      type(container.querySelector("input[name=email]"), "a")
      await flush()

      expect(store.getState().answer.fieldErrors.signup).toEqual({})
    })

    it("sends only its own fields once they pass", async () => {
      const onAction = vi.fn()
      const { container } = await setup({ response: SIGN_UP, onAction })

      type(container.querySelector("input[name=email]"), "ada@example.com")
      await flush()
      container.querySelector(".iw-button").click()
      await flush()

      expect(onAction).toHaveBeenCalledWith(
        expect.objectContaining({
          formName: "signup",
          formState: { signup: { email: "ada@example.com" } },
        }),
      )
    })
  })

  it("clears the message of a field bound to a $variable as it changes", async () => {
    const { store, container } = await setup({
      response: `$email = ""
root = Stack([Form("news", Buttons([Button("Go", @ToAssistant("Go"))]), [FormControl("Email", Input("email", "", "email", {required: true}, $email))])])
`,
    })
    container.querySelector(".iw-button").click()
    await flush()
    expect(store.getState().answer.fieldErrors.news).toEqual({
      email: "This field is required",
    })

    type(container.querySelector("input"), "a")
    await flush()

    expect(store.getState().answer.values.$email).toBe("a")
    expect(store.getState().answer.fieldErrors.news).toEqual({})
  })

  it("switches Tabs without telling the model", async () => {
    const { store, container } = await setup({
      response: `root = Stack([Tabs([TabItem("a", "First", [TextContent("Alpha")]), TabItem("b", "Second", [TextContent("Beta")])])])
`,
    })
    expect(container.querySelector(".iw-tab-panel").textContent).toContain(
      "Alpha",
    )

    container.querySelectorAll(".iw-tab")[1].click()
    await flush()

    expect(container.querySelector(".iw-tab-panel").textContent).toContain(
      "Beta",
    )
    expect(store.getState().answer.values).toEqual({})
  })

  it("opens Accordion sections", async () => {
    const { container } = await setup({
      response: `root = Stack([Accordion([AccordionItem("q1", "Why?", [TextContent("Because")])])])
`,
    })
    const details = container.querySelector("details")
    expect(details.open).toBe(false)

    details.dispatchEvent(
      Object.assign(new Event("toggle"), { newState: "open" }),
    )
    await flush()

    expect(container.querySelector("details").open).toBe(true)
  })

  it("lists Steps", async () => {
    const { container } = await setup({
      response: `root = Stack([Steps([StepsItem("Sign up", "With your email"), StepsItem("Confirm")])])
`,
    })

    expect(container.textContent).toContain("Sign up")
    expect(container.textContent).toContain("With your email")
    expect(container.textContent).toContain("Confirm")
  })

  it("opens a Modal from its $variable, and closes it back", async () => {
    const { store, container } = await setup({
      response: `$editing = false
root = Stack([Button("Edit", @Set($editing, true)), Modal("Edit name", $editing, [TextContent("Inside")])])
`,
    })
    expect(container.querySelector("dialog").open).toBe(false)

    container.querySelector(".iw-button").click()
    await flush()
    expect(store.getState().answer.values.$editing).toBe(true)
    expect(container.querySelector("dialog").open).toBe(true)

    container.querySelector(".iw-dialog-close").click()
    await flush()
    expect(store.getState().answer.values.$editing).toBe(false)
  })

  it("binds a Slider to a $variable", async () => {
    const { store, container } = await setup({
      response: `$budget = [50]
root = Stack([Slider("budget", "continuous", 0, 100, 10, null, "Budget", null, $budget), TextContent("Budget: " + @First($budget))])
`,
    })
    expect(container.textContent).toContain("Budget: 50")

    const slider = container.querySelector("input[type=range]")
    slider.value = "70"
    slider.dispatchEvent(new Event("input", { bubbles: true }))
    await flush()

    expect(store.getState().answer.values.$budget).toEqual([70])
  })

  it("draws charts from chartComponents", async () => {
    const library = uiLibrary.extend({ components: { add: chartComponents } })
    const { container } = await setup({
      library,
      response: `root = Stack([bars, pie])
bars = BarChart(["Jan", "Feb"], [Series("Sales", [10, 20]), Series("Costs", [5, 8])])
pie = PieChart(["Rent", "Food"], [900, 400], "donut")
`,
    })

    expect(container.querySelectorAll("svg")).not.toHaveLength(0)
    expect(container.innerHTML).toContain("Sales")
    expect(container.innerHTML).toContain("Rent")
  })
})

describe("OpenUI's full specs", () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it("draws Card's surfaces, and lays its children out", async () => {
    const { container } = await setup({
      response: `root = Stack([Card([TextContent("A")], "sunk", "row"), Card([TextContent("B")], "clear")])
`,
    })

    expect(
      container.querySelector(".iw-card-sunk .iw-flex-direction-row"),
    ).not.toBeNull()
    expect(container.querySelector(".iw-card-clear")).not.toBeNull()
  })

  it("shows a neutral Callout while its $variable is true", async () => {
    const { container } = await setup({
      response: `$shown = true
root = Stack([Callout("neutral", "Note", "Just so you know", $shown), Button("Hide", @Set($shown, false))])
`,
    })
    expect(container.querySelector(".iw-alert-neutral")).not.toBeNull()

    container.querySelector(".iw-button").click()
    await flush()

    expect(container.querySelector(".iw-alert")).toBeNull()
  })

  it("clears a Callout's $variable after three seconds, as OpenUI does", async () => {
    const { store, container } = await setup({
      response: `$saved = false
root = Stack([Callout("success", "Saved", "All done", $saved), Button("Save", @Set($saved, true))])
`,
    })
    vi.useFakeTimers()
    try {
      container.querySelector(".iw-button").click()
      await vi.advanceTimersByTimeAsync(0)
      expect(container.querySelector(".iw-alert-success")).not.toBeNull()

      await vi.advanceTimersByTimeAsync(2999)
      expect(store.getState().answer.values.$saved).toBe(true)

      await vi.advanceTimersByTimeAsync(1)
      expect(store.getState().answer.values.$saved).toBe(false)
      expect(container.querySelector(".iw-alert")).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it("leaves a Callout with no $variable on screen", async () => {
    const { container } = await setup({
      response: `root = Stack([Callout("info", "Note", "Stays")])
`,
    })
    vi.useFakeTimers()
    try {
      await vi.advanceTimersByTimeAsync(5000)
      expect(container.querySelector(".iw-alert-info")).not.toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it("draws a Tag's Icon from the app's icons", async () => {
    const check = { body: '<path d="M0 0h1"/>', width: 24, height: 24 }
    const { container } = await setup({
      icons: { "circle-check": check },
      response: `root = Stack([Tag("Paid", Icon("circle-check"), "sm", "success"), Icon("unknown")])
`,
    })

    expect(container.querySelectorAll(".iw-chip-icon svg")).toHaveLength(1)
    expect(container.querySelectorAll("svg")).toHaveLength(1)
  })

  it("finds icons in an Iconify collection, aliases included", async () => {
    const lucide = {
      prefix: "lucide",
      width: 24,
      height: 24,
      icons: { rocket: { body: '<path d="M1 1h1"/>' } },
      aliases: { launch: { parent: "rocket" } },
    }
    const { container } = await setup({
      icons: lucide,
      response: 'root = Stack([Icon("rocket"), Icon("launch")])\n',
    })

    expect(container.querySelectorAll("svg")).toHaveLength(2)
  })

  it("takes OpenUI's Separator, Modal and Select options", async () => {
    const { container } = await setup({
      response: `root = Stack([Separator("horizontal", true), Modal("Big", true, [TextContent("x")], "lg"), Select("s", [SelectItem("a", "A")], "Pick", null, null, "small")])
`,
    })

    expect(container.querySelector("hr").getAttribute("role")).toBe("none")
    expect(container.querySelector("dialog.iw-dialog-lg")).not.toBeNull()
    expect(container.querySelector(".iw-select-sm")).not.toBeNull()
  })

  it("shows item descriptions and a SwitchGroup's surface", async () => {
    const { container } = await setup({
      response: `root = Stack([RadioGroup("plan", [RadioItem("Pro", "For teams", "pro")]), SwitchGroup("prefs", [SwitchItem("Dark", "Easier at night", "dark")], "card")])
`,
    })

    expect(container.querySelector(".iw-radio-description").textContent).toBe(
      "For teams",
    )
    expect(
      container.querySelector(".iw-card .iw-switch-description").textContent,
    ).toBe("Easier at night")
  })

  it("draws a range Slider with marks from OpenUI's list values", async () => {
    const { store, container } = await setup({
      response: `$price = [20, 60]
root = Stack([Slider("price", "discrete", 0, 100, 20, null, "Price", null, $price)])
`,
    })

    const [low, high] = container.querySelectorAll("input[type=range]")
    expect([low.value, high.value]).toEqual(["20", "60"])
    expect(container.querySelectorAll(".iw-slider-marks span")).toHaveLength(6)

    high.value = "80"
    high.dispatchEvent(new Event("input", { bubbles: true }))
    await flush()

    expect(store.getState().answer.values.$price).toEqual([20, 80])
  })

  it("draws the chart variants", async () => {
    const library = uiLibrary.extend({ components: { add: chartComponents } })
    const { container } = await setup({
      library,
      response: `root = Stack([bars, lines, area, pie])
bars = BarChart(["Jan", "Feb"], [Series("Online", [10, 20]), Series("Shop", [30, 20])], "stacked", "Month", "Sales")
lines = LineChart(["Jan", "Feb", "Mar"], [Series("Visits", [10, 30, 15])], "natural")
area = AreaChart(["Jan", "Feb"], [Series("Signups", [5, 9])])
pie = PieChart(["A", "B"], [1, 1], "pie", "semiCircular")
`,
    })

    expect(container.querySelectorAll("svg.iw-chart")).toHaveLength(4)
    expect(container.querySelectorAll(".iw-chart-axis-label")).toHaveLength(2)
    expect(container.querySelector(".iw-chart-area")).not.toBeNull()
  })
})

describe("More of OpenUI's standard library", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.replaceChildren()
  })

  it("lays slides out in a Carousel, each on a card", async () => {
    const { container } = await setup({
      response: `root = Carousel([[TextContent("One")], [TextContent("Two")]], "sunk")
`,
    })

    expect(container.querySelectorAll(".iw-carousel-item")).toHaveLength(2)
    expect(container.querySelectorAll(".iw-card-sunk")).toHaveLength(2)
  })

  it("draws text blocks: TextCallout, InlineHeader, CodeBlock, TagBlock, Label", async () => {
    const { container } = await setup({
      response: `root = Stack([note, head, code, tags, label])
note = TextCallout("danger", "Careful", "This cannot be undone")
head = InlineHeader("Totals", "This month")
code = CodeBlock("js", "const a = 1 < 2")
tags = TagBlock(["Vegan", "Spicy"], "md")
label = Label("Diet")
`,
    })

    expect(container.querySelector(".iw-alert-error").textContent).toContain(
      "Careful",
    )
    expect(container.textContent).toContain("This month")
    expect(container.querySelector("pre code.language-js").textContent).toBe(
      "const a = 1 < 2",
    )
    expect(container.querySelectorAll(".iw-chip")).toHaveLength(2)
    expect(container.textContent).toContain("Diet")
  })

  it("opens a gallery image in a dialog, with its details", async () => {
    const { store, container } = await setup({
      response: `root = Stack([ImageBlock("cover.jpg", "Cover"), gallery])
gallery = ImageGallery([{src: "a.jpg", alt: "Lake", details: "At dawn"}, {src: "b.jpg", alt: "Hill"}])
`,
    })
    expect(container.querySelector('img[alt="Cover"]')).not.toBeNull()

    container.querySelector('button[aria-label="Open Lake"]').click()
    await flush()

    expect(store.getState().answer.view["gallery:preview"]).toBe(0)
    const dialog = container.querySelector("dialog")
    expect(dialog.open).toBe(true)
    expect(dialog.textContent).toContain("At dawn")
  })

  it("lists label and value pairs, with a header and footer only at default size", async () => {
    const rows = `[{left: "Coffee", right: "3.50", rightVariant: "number"}]`
    const ends = `{left: "Item", right: "Price"}, {left: "Total", right: "3.50"}`
    const { container } = await setup({
      response: `root = Stack([EntityList(${rows}, "default", ${ends}), EntityList(${rows}, "small")])
`,
    })

    const text = container.textContent
    expect(text.match(/Coffee/g)).toHaveLength(2)
    expect(text.match(/Total/g)).toHaveLength(1)
  })

  it("lists ListItems, with a button for the ones that act", async () => {
    const onAction = vi.fn()
    const { container } = await setup({
      onAction,
      response: `root = ListBlock([ListItem("Rome", "Italy", null, "Visit", @ToAssistant("Plan Rome")), ListItem("Paris")])
`,
    })

    expect(container.querySelector("ol")).not.toBeNull()
    const buttons = container.querySelectorAll(".iw-button")
    expect(buttons).toHaveLength(1)
    buttons[0].click()
    await flush()

    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({ humanFriendlyMessage: "Plan Rome" }),
    )
  })

  it("labels an IconButton and sends follow-ups as the user's message", async () => {
    const onAction = vi.fn()
    const { container } = await setup({
      onAction,
      icons: { trash: { body: "<path/>", width: 24, height: 24 } },
      response: `root = Stack([IconButton("Delete", Icon("trash"), null, null, null, "circle"), FollowUpBlock([FollowUpItem("Show last month")])])
`,
    })

    const iconButton = container.querySelector('[aria-label="Delete"]')
    expect(iconButton.querySelector("svg")).not.toBeNull()

    const followUp = [...container.querySelectorAll(".iw-button")].find(
      (button) => button.textContent.includes("Show last month"),
    )
    followUp.click()
    await flush()

    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "continue_conversation",
        humanFriendlyMessage: "Show last month",
      }),
    )
  })

  it("keeps a date, or a range of two", async () => {
    const { store, container } = await setup({
      response: `root = Stack([DatePicker("day"), DatePicker("trip", "range")])
`,
    })
    const [day, from, to] = container.querySelectorAll("input[type=date]")

    type(day, "2026-10-27")
    await flush()
    type(from, "2026-11-01")
    await flush()
    type(to, "2026-11-08")
    await flush()

    expect(store.getState().answer.values).toEqual({
      day: "2026-10-27",
      trip: { from: "2026-11-01", to: "2026-11-08" },
    })
  })

  it("picks Chips: several by default, one when single", async () => {
    const { store, container } = await setup({
      response: `root = Stack([diet, size])
diet = Chips("diet", "multiple", [ChipItem("vegan", "Vegan"), ChipItem("spicy", "Spicy")])
size = Chips("size", "single", [ChipItem("s", "Small"), ChipItem("l", "Large")], null, "s")
`,
    })
    const chips = () => container.querySelectorAll("button.iw-chip")

    chips()[0].click()
    await flush()
    chips()[1].click()
    await flush()
    chips()[3].click()
    await flush()

    expect(store.getState().answer.values).toEqual({
      diet: ["vegan", "spicy"],
      size: "l",
    })
    expect(chips()[2].getAttribute("aria-pressed")).toBe("false")
    expect(chips()[3].getAttribute("aria-pressed")).toBe("true")
  })

  it("counts a field's defaultValue when checking its rules", async () => {
    const onAction = vi.fn()
    const { container } = await setup({
      onAction,
      response: `root = Form("order", Buttons([Button("Order", @ToAssistant("Order"))]), [size])
size = FormControl("Size", Chips("size", "single", [ChipItem("s", "Small")], {required: true}, "s"))
`,
    })

    container.querySelector(".iw-button").click()
    await flush()

    expect(onAction).toHaveBeenCalled()
  })

  it("picks OptionCards as radio cards, or checkbox cards when multiple", async () => {
    const { store, container } = await setup({
      response: `root = Stack([room, extras])
room = OptionCards("room", "single", [OptionCard("single", "Single", "One bed"), OptionCard("double", "Double")])
extras = OptionCards("extras", "multiple", [OptionCard("breakfast", "Breakfast"), OptionCard("parking", "Parking")])
`,
    })

    expect(container.querySelector(".iw-radio-group-card")).not.toBeNull()
    expect(container.querySelectorAll(".iw-checkbox-card")).toHaveLength(2)

    container.querySelectorAll("input[type=radio]")[1].click()
    await flush()
    container.querySelectorAll("input[type=checkbox]")[1].click()
    await flush()

    expect(store.getState().answer.values).toEqual({
      room: "double",
      extras: ["parking"],
    })
  })
})

describe("Markdown", () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it("renders inline markdown in TextContent and Callout descriptions", async () => {
    const { container } = await setup({
      response: `root = Stack([TextContent("Spent **€900** on *rent*"), Callout("info", "Tip", "Run \`npm test\` first")])
`,
    })

    expect(container.querySelector("strong").textContent).toBe("€900")
    expect(container.querySelector("em").textContent).toBe("rent")
    expect(container.querySelector(".iw-alert code").textContent).toBe(
      "npm test",
    )
    // Inline: no paragraph inside the text's own paragraph.
    expect(container.querySelector("p p")).toBeNull()
  })

  it("renders block markdown in MarkDownRenderer, on a surface when asked", async () => {
    const { container } = await setup({
      response: `root = MarkDownRenderer("## Plan\n\n- Book flights\n- Pack", "sunk")
`,
    })

    expect(container.querySelector(".iw-card-sunk h2").textContent).toBe("Plan")
    expect(container.querySelectorAll("li")).toHaveLength(2)
  })

  it("escapes HTML and refuses script links", async () => {
    const { container } = await setup({
      response: `root = MarkDownRenderer("<img src=x onerror=alert(1)> [click](javascript:alert(1)) [ok](https://example.com)")
`,
    })

    expect(container.querySelector("img")).toBeNull()
    expect(container.textContent).toContain("<img src=x")
    const links = [...container.querySelectorAll("a")]
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "https://example.com",
    ])
    expect(links[0].getAttribute("target")).toBe("_blank")
    expect(links[0].getAttribute("rel")).toBe("noopener noreferrer")
  })
})

async function setup({ response, onAction, library = uiLibrary, icons }) {
  const types = { OpenUI: createOpenUI({ library, icons }) }
  if (onAction) types.Chat = { openuiAction: (_, event) => onAction(event) }

  const store = createStore({
    types,
    entities: {
      answer: { type: "OpenUI", response },
      ...(onAction && { chat: { type: "Chat" } }),
    },
  })
  const container = document.createElement("div")
  document.body.append(container)
  mount(store, (api) => api.render("answer"), container)
  await flush()
  return { store, container }
}

function type(input, text) {
  input.value = text
  input.dispatchEvent(new Event("input", { bubbles: true }))
}

function choose(select, value) {
  select.value = value
  select.dispatchEvent(new Event("change", { bubbles: true }))
}

function tick(checkbox) {
  checkbox.click()
}

/** Lets the store apply queued events and the view re-render. */
async function flush() {
  for (let i = 0; i < 2; i++) {
    await new Promise((resolve) => setTimeout(resolve))
  }
}
