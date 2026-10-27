import { createLibrary } from "@openuidev/lang-core"

import { Button, Buttons } from "./actions.js"
import {
  Callout,
  Card,
  CardHeader,
  Image,
  Tag,
  TextContent,
} from "./content.js"
import { Col, Table } from "./data.js"
import { Input } from "./forms.js"
import { Separator, Stack } from "./layout.js"

/**
 * Inglorious UI as an OpenUI library. The components take the names and the
 * argument order of OpenUI's standard ones, so an answer written for those
 * mostly renders here too; `uiLibrary.prompt()` describes exactly these.
 * Extend it with `uiLibrary.extend({ components: { add: [...] } })`.
 */
export const uiLibrary = createLibrary({
  root: "Stack",
  components: [
    Stack,
    Separator,
    Card,
    CardHeader,
    TextContent,
    Callout,
    Tag,
    Image,
    Button,
    Buttons,
    Table,
    Col,
    Input,
  ],
  componentGroups: [
    { name: "Layout", components: ["Stack", "Separator"] },
    {
      name: "Content",
      components: [
        "Card",
        "CardHeader",
        "TextContent",
        "Callout",
        "Tag",
        "Image",
      ],
      notes: [
        '- Group related figures in Cards, side by side in a Stack with direction "row" and wrap true.',
        '- A KPI: Card([TextContent("Revenue", "small"), TextContent("€12,400", "large-heavy")])',
      ],
    },
    { name: "Actions", components: ["Button", "Buttons"] },
    {
      name: "Tables",
      components: ["Table", "Col"],
      notes: [
        "- Table is column-oriented: each Col holds every value of its column, in row order.",
        '- Cells can be components: Col("Status", [Tag("Open", "sm", "success"), Tag("Closed")])',
      ],
    },
    { name: "Forms", components: ["Input"] },
  ],
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
search = Input("search", "Filter by name", "text", $query)
tbl = Table([Col("Name", ["Ada", "Alan"]), Col("Total", [1200, 860], "number"), Col("Status", [Tag("Paid", "sm", "success"), Tag("Due", "sm", "warning")])])`,
]
