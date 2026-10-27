import { afterEach, describe, expect, it, vi } from "vitest"

import { choose, flush, setup, tick, type } from "../test-helpers.js"

const SIGN_UP = `root = Stack([signUp])
signUp = Form("signup", Buttons([Button("Sign up", @ToAssistant("Signed up"))]), [email, plan, topics])
email = FormControl("Email", Input("email", "you@example.com", "email", {required: true, email: true}))
plan = FormControl("Plan", Select("plan", [SelectItem("free", "Free"), SelectItem("pro", "Pro")]))
topics = FormControl("Topics", CheckBoxGroup("topics", [CheckBoxItem("News", "", "news"), CheckBoxItem("Offers", "", "offers")]))
`

describe("Form components", () => {
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

  it("sends a form's fields bound to $variables with its state", async () => {
    const onAction = vi.fn()
    const { container } = await setup({
      onAction,
      response: `$category = ""
$amount = ""
root = Form("expense", Buttons([Button("Add", @ToAssistant("Added"))]), [category, amount])
category = FormControl("Category", Select("category", [SelectItem("Food", "Food")], "Pick one", null, $category))
amount = FormControl("Amount", Input("amount", "0", "number", null, $amount))
`,
    })

    choose(container.querySelector("select"), "Food")
    await flush()
    type(container.querySelector("input[name=amount]"), "12")
    await flush()
    container.querySelector(".iw-button").click()
    await flush()

    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({
        formName: "expense",
        formState: { expense: { category: "Food", amount: "12" } },
      }),
    )
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

  it("says in the error colour why a group of options fails", async () => {
    const { container } = await setup({
      response: `root = Form("order", Buttons([Button("Order", @ToAssistant("Order"))]), [size])
size = FormControl("Size", Chips("size", "single", [ChipItem("s", "Small")], {required: true}))
`,
    })

    container.querySelector(".iw-button").click()
    await flush()

    const message = [...container.querySelectorAll(".iw-typography")].find(
      (element) => element.textContent.includes("required"),
    )
    expect(message.getAttribute("style")).toContain("var(--iw-color-error)")
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
