import { createLibrary } from "@openuidev/lang-core"

import { Button, Buttons } from "./actions.js"
import {
  Callout,
  Card,
  CardHeader,
  Icon,
  Image,
  Tag,
  TextContent,
} from "./content.js"
import { Col, Table } from "./data.js"
import {
  CheckBoxGroup,
  CheckBoxItem,
  Form,
  FormControl,
  Input,
  RadioGroup,
  RadioItem,
  Select,
  SelectItem,
  Slider,
  SwitchGroup,
  SwitchItem,
  TextArea,
} from "./forms.js"
import {
  Accordion,
  AccordionItem,
  Modal,
  Separator,
  Stack,
  Steps,
  StepsItem,
  TabItem,
  Tabs,
} from "./layout.js"

/**
 * Inglorious UI as an OpenUI library. The components take the names and the
 * argument order of OpenUI's standard ones, so an answer written for those
 * mostly renders here too; `uiLibrary.prompt()` describes exactly these.
 * Extend it with `uiLibrary.extend({ components: { add: [...] } })`, such as
 * with `chartComponents` from `@inglorious/openui/charts`.
 */
export const uiLibrary = createLibrary({
  root: "Stack",
  components: [
    Stack,
    Separator,
    Tabs,
    TabItem,
    Accordion,
    AccordionItem,
    Steps,
    StepsItem,
    Modal,
    Card,
    CardHeader,
    TextContent,
    Callout,
    Tag,
    Icon,
    Image,
    Button,
    Buttons,
    Table,
    Col,
    Form,
    FormControl,
    Input,
    TextArea,
    Select,
    SelectItem,
    RadioGroup,
    RadioItem,
    CheckBoxGroup,
    CheckBoxItem,
    SwitchGroup,
    SwitchItem,
    Slider,
  ],
  componentGroups: [
    {
      name: "Layout",
      components: [
        "Stack",
        "Separator",
        "Tabs",
        "TabItem",
        "Accordion",
        "AccordionItem",
        "Steps",
        "StepsItem",
        "Modal",
      ],
      notes: [
        "- Tabs for alternative views of one subject; Accordion for sections the user opens one by one.",
        '- Show a Modal by setting its $variable: Button("Edit", @Set($editing, true)) with Modal("Edit", $editing, [content]).',
      ],
    },
    {
      name: "Content",
      components: [
        "Card",
        "CardHeader",
        "TextContent",
        "Callout",
        "Tag",
        "Icon",
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
        '- Cells can be components: Col("Status", [Tag("Open", null, "sm", "success"), Tag("Closed")])',
      ],
    },
    {
      name: "Forms",
      components: [
        "Form",
        "FormControl",
        "Input",
        "TextArea",
        "Select",
        "SelectItem",
        "RadioGroup",
        "RadioItem",
        "CheckBoxGroup",
        "CheckBoxItem",
        "SwitchGroup",
        "SwitchItem",
        "Slider",
      ],
      notes: [
        "- A form: Form(name, Buttons([...]), [FormControl(label, field), ...]). Its primary button checks every field's rules first, then sends the values.",
        '- Rules: Input("email", "you@example.com", "email", {required: true, email: true})',
        '- A filter outside a form binds its value: Input("search", "Search", "text", null, $query)',
      ],
    },
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
search = Input("search", "Filter by name", "text", null, $query)
tbl = Table([Col("Name", ["Ada", "Alan"]), Col("Total", [1200, 860], "number"), Col("Status", [Tag("Paid", null, "sm", "success"), Tag("Due", null, "sm", "warning")])])`,
]
