import { createLibrary } from "@openuidev/lang-core"

import {
  Button,
  Buttons,
  FollowUpBlock,
  FollowUpItem,
  IconButton,
} from "./actions.js"
import {
  Callout,
  Card,
  CardHeader,
  CodeBlock,
  Icon,
  Image,
  ImageBlock,
  ImageGallery,
  InlineHeader,
  MarkDownRenderer,
  Tag,
  TagBlock,
  TextCallout,
  TextContent,
} from "./content.js"
import { Col, EntityList, ListBlock, ListItem, Table } from "./data.js"
import {
  CheckBoxGroup,
  CheckBoxItem,
  ChipItem,
  Chips,
  DatePicker,
  Form,
  FormControl,
  Input,
  Label,
  OptionCard,
  OptionCards,
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
  Carousel,
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
    Carousel,
    Modal,
    Card,
    CardHeader,
    InlineHeader,
    TextContent,
    MarkDownRenderer,
    Callout,
    TextCallout,
    CodeBlock,
    Tag,
    TagBlock,
    Icon,
    Image,
    ImageBlock,
    ImageGallery,
    Button,
    Buttons,
    IconButton,
    FollowUpBlock,
    FollowUpItem,
    Table,
    Col,
    EntityList,
    ListBlock,
    ListItem,
    Form,
    FormControl,
    Label,
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
    DatePicker,
    Chips,
    ChipItem,
    OptionCards,
    OptionCard,
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
        "Carousel",
        "Modal",
      ],
      notes: [
        "- Tabs for alternative views of one subject; Accordion for sections the user opens one by one.",
        "- Carousel for a row of like items to browse, such as products: each slide is a list of components.",
        '- Show a Modal by setting its $variable: Button("Edit", @Set($editing, true)) with Modal("Edit", $editing, [content]).',
      ],
    },
    {
      name: "Content",
      components: [
        "Card",
        "CardHeader",
        "InlineHeader",
        "TextContent",
        "MarkDownRenderer",
        "Callout",
        "TextCallout",
        "CodeBlock",
        "Tag",
        "TagBlock",
        "Icon",
        "Image",
        "ImageBlock",
        "ImageGallery",
      ],
      notes: [
        '- Group related figures in Cards, side by side in a Stack with direction "row" and wrap true.',
        '- A KPI: Card([TextContent("Revenue", "small"), TextContent("€12,400", "large-heavy")])',
        "- Callout is for news the user caused, such as a saved form, and hides itself when bound to a $variable; TextCallout is a note that stays.",
      ],
    },
    {
      name: "Actions",
      components: [
        "Button",
        "Buttons",
        "IconButton",
        "FollowUpBlock",
        "FollowUpItem",
      ],
      notes: [
        '- End an answer with what the user may ask next: FollowUpBlock([FollowUpItem("Show last month")])',
      ],
    },
    {
      name: "Tables and lists",
      components: ["Table", "Col", "EntityList", "ListBlock", "ListItem"],
      notes: [
        "- Table is column-oriented: each Col holds every value of its column, in row order.",
        '- Cells can be components: Col("Status", [Tag("Open", null, "sm", "success"), Tag("Closed")])',
        "- EntityList for a few label and value pairs, such as a receipt; ListBlock for a ranked or illustrated list.",
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
        "DatePicker",
        "Chips",
        "ChipItem",
        "OptionCards",
        "OptionCard",
        "Label",
      ],
      notes: [
        "- A form: Form(name, Buttons([...]), [FormControl(label, field), ...]). Its primary button checks every field's rules first, then sends the values.",
        '- Rules: Input("email", "you@example.com", "email", {required: true, email: true})',
        "- Chips for short tags to pick, OptionCards for choices worth a picture or a line of detail.",
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
