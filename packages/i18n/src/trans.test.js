import { afterEach, describe, expect, it, vi } from "vitest"

import { createI18n } from "./index.js"

const resources = {
  en: {
    translation: {
      loggedInAs: "Logging in as <strong>{{email}}</strong>.",
      terms: "Read the <link>terms of <em>service</em></link>",
      lineBreak: "First<br/>Second",
      unknown: "A <script>tag</script> stays text",
      stray: "One </strong> and <strong>two",
      events_one: "<b>{{count}}</b> event",
      events_other: "<b>{{count}}</b> events",
      due: "Due <em>{{date, datetime}}</em>",
    },
  },
  it: {
    translation: {
      loggedInAs: "<strong>{{email}}</strong> sta accedendo.",
    },
  },
}

// Components return plain objects, so the tests can see what was built.
const tag = (name) => (children) => ({ tag: name, children })
const components = {
  strong: tag("strong"),
  em: tag("em"),
  link: tag("link"),
  br: tag("br"),
  b: tag("b"),
}

function setup() {
  vi.stubGlobal("navigator", { languages: ["en"] })
  return createI18n({ resources })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("trans", () => {
  it("renders tags through their components, with values as text", () => {
    const { trans } = setup()

    expect(
      trans("loggedInAs", { values: { email: "ada@x.it" }, components }),
    ).toEqual([
      "Logging in as ",
      { tag: "strong", children: ["ada@x.it"] },
      ".",
    ])
  })

  it("keeps a value that looks like markup as text", () => {
    const { trans } = setup()

    expect(
      trans("loggedInAs", {
        values: { email: "<em>x</em><img src=x onerror=alert(1)>" },
        components,
      }),
    ).toEqual([
      "Logging in as ",
      { tag: "strong", children: ["<em>x</em><img src=x onerror=alert(1)>"] },
      ".",
    ])
  })

  it("nests tags", () => {
    const { trans } = setup()

    expect(trans("terms", { components })).toEqual([
      "Read the ",
      {
        tag: "link",
        children: ["terms of ", { tag: "em", children: ["service"] }],
      },
    ])
  })

  it("renders self-closing tags with no children", () => {
    const { trans } = setup()

    expect(trans("lineBreak", { components })).toEqual([
      "First",
      { tag: "br", children: [] },
      "Second",
    ])
  })

  it("shows tags without a component as written", () => {
    const { trans } = setup()

    expect(trans("unknown", { components })).toEqual([
      "A ",
      "<script>",
      "tag",
      "</script>",
      " stays text",
    ])
  })

  it("shows stray and unclosed tags as written", () => {
    const { trans } = setup()

    expect(trans("stray", { components })).toEqual([
      "One ",
      "</strong>",
      " and ",
      "<strong>",
      "two",
    ])
  })

  it("picks the plural form and formats values", () => {
    const { trans } = setup()

    expect(trans("events", { values: { count: 3 }, components })).toEqual([
      { tag: "b", children: ["3"] },
      " events",
    ])
    expect(
      trans("due", {
        values: {
          date: new Date("2026-10-24T12:00:00Z"),
          formatParams: { date: { day: "numeric", month: "short" } },
        },
        components,
      }),
    ).toEqual(["Due ", { tag: "em", children: ["Oct 24"] }])
  })

  it("follows the active language, word order included", () => {
    const { I18n, trans } = setup()
    const entity = {}
    I18n.create(entity)
    I18n.localeChange(entity, "it")

    expect(
      trans("loggedInAs", { values: { email: "ada@x.it" }, components }),
    ).toEqual([{ tag: "strong", children: ["ada@x.it"] }, " sta accedendo."])
  })
})
