import { createLibrary } from "@openuidev/lang-core"

import { actionsGroup } from "./actions/index.js"
import { cardsGroup } from "./cards/index.js"
import { contentGroup } from "./content/index.js"
import { dataGroup } from "./data/index.js"
import { formsGroup } from "./forms/index.js"
import { layoutGroup } from "./layout/index.js"

/** The library's groups, in the order its prompt describes them. */
const groups = [
  layoutGroup,
  contentGroup,
  actionsGroup,
  dataGroup,
  formsGroup,
  cardsGroup,
]

/**
 * Inglorious UI as an OpenUI library. The components take the names and the
 * argument order of OpenUI's standard ones, so an answer written for those
 * mostly renders here too; `uiLibrary.prompt()` describes exactly these.
 * Extend it with `uiLibrary.extend({ components: { add: [...] } })`, such as
 * with `chartComponents` from `@inglorious/openui/charts`.
 */
export const uiLibrary = createLibrary({
  root: "Stack",
  components: groups.flatMap(({ components }) => components),
  componentGroups: groups.map(({ name, components, notes }) => ({
    name,
    components: components.map((component) => component.name),
    notes,
  })),
})

/**
 * Example answers to pass as `uiLibrary.prompt({ examples: uiExamples })`.
 * Small models depend on them: without examples they tend to drop the list
 * brackets around children, and the answer fails to parse.
 */
export const uiExamples = [
  `root = Stack([title, figures, actions])
title = CardHeader("Sales", "October")
figures = Stack([revenue, orders], "row", "m", "stretch", "start", true)
revenue = Card([TextContent("Revenue", "small"), TextContent("€12,400", "large-heavy")])
orders = Card([TextContent("Orders", "small"), TextContent("318", "large-heavy")])
actions = Buttons([Button("Explain the drop in orders", @ToAssistant("Why did orders drop?"))])`,
  `$query = ""
root = Stack([title, search, tbl])
title = CardHeader("Customers")
search = Input("search", "Filter by name", "text", null, $query)
tbl = Table([Col("Name", ["Ada", "Alan"]), Col("Total", [1200, 860], "number"), Col("Status", [Tag("Paid", null, "sm", "success"), Tag("Due", null, "sm", "warning")])])`,
]
