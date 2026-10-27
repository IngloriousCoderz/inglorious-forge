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
