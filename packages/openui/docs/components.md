# Components

The model can only use the components in the library you give `createOpenUI`. Each one has a name, a description and a props schema, which `library.prompt()` turns into the instructions the model follows, and a render function.

## uiLibrary

`uiLibrary` is Inglorious UI as an OpenUI library. The components take the names and the arguments of OpenUI's standard library, in the same order, so prompts and examples written for that one carry over. The authoritative list is what `uiLibrary.prompt()` says.

| Group            | Components                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout           | `Stack(children, direction, gap, align, justify, wrap)`, `Separator(orientation, decorative)`, `Tabs(items)` of `TabItem(value, trigger, content)`, `Accordion(items)` of `AccordionItem(value, trigger, content)`, `Steps(items)` of `StepsItem(title, details)`, `Carousel(children, variant)`, `Modal(title, open, children, size)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Content          | `Card(children, variant, direction, gap, align, justify, wrap)`, `CardHeader(title, subtitle)`, `InlineHeader(heading, description)`, `TextContent(text, size)`, `MarkDownRenderer(textMarkdown, variant)`, `Callout(variant, title, description, visible)`, `TextCallout(variant, title, description)`, `CodeBlock(language, codeString)`, `Tag(text, icon, size, variant)`, `TagBlock(tags, size)`, `Icon(name, category)`, `Image(alt, src)`, `ImageBlock(src, alt)`, `ImageGallery(images)`                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Actions          | `Button(label, action, variant, type, size)`, `Buttons(buttons, direction)`, `IconButton(name, icon, action, variant, size, shape)`, `FollowUpBlock(items)` of `FollowUpItem(text)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Tables and lists | `Table(columns)`, `Col(label, data, type)`, `EntityList(rows, size, header, footer)`, `ListBlock(items, variant, size)` of `ListItem(title, subtitle, image, actionLabel, action)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Forms            | `Form(name, buttons, fields)`, `FormControl(label, input, hint)`, `Label(text)`, `Input(name, placeholder, type, rules, value)`, `TextArea(name, placeholder, rows, rules, value)`, `Select(name, items, placeholder, rules, value, size)` of `SelectItem(value, label)`, `RadioGroup(name, items, rules, value)` of `RadioItem(label, description, value)`, `CheckBoxGroup(name, items, rules, value)` of `CheckBoxItem(label, description, name, defaultChecked)`, `SwitchGroup(name, items, variant, value)` of `SwitchItem(label, description, name, defaultChecked)`, `Slider(name, variant, min, max, step, defaultValue, label, rules, value)`, `DatePicker(name, mode, rules, value)`, `Chips(name, type, items, rules, defaultValue)` of `ChipItem(value, label, icon, disabled)`, `OptionCards(name, type, items, rules, defaultValue)` of `OptionCard(value, title, subtitle, topContent, disabled)` |

A `Card`'s `variant` is `"card"` (raised, the default), `"sunk"` or `"clear"`, and it lays its children out with the same arguments as `Stack`. A `Slider`'s value is a list, as in OpenUI: `[50]`, or `[20, 80]` for a range with two thumbs; `"discrete"` marks every step.

A `Callout` bound to a `$variable`, as in `Callout("success", "Saved", "Done", $saved)`, clears it 3 seconds after it turns true, as OpenUI's does, so a button can show it with `@Set($saved, true)`; `TextCallout` is a note that stays. `FollowUpBlock` ends an answer with questions the user may ask next: pressing one sends it as the user's message.

Text is markdown, as in OpenUI: `TextContent` and the descriptions of `Callout` and `TextCallout` take inline markdown (`**bold**`, `*italics*`, `` `code` ``, links), and `MarkDownRenderer` takes whole documents, with paragraphs, lists, headings, tables and code, on a `"card"` or `"sunk"` surface if asked. Raw HTML in the text is shown as text, `javascript:` links are refused, and links open in a new tab.

`DatePicker` is the browser's date field: its value is a date such as `"2026-10-27"`, or `{ from, to }` with mode `"range"`. `Chips` keep a list of values (`"multiple"`, the default) or one (`"single"`); `OptionCards` keep one (the default) or a list, and draw each option as a card with an optional `Icon` or `Image` on top. A field's `defaultValue` counts when its form checks its rules.

Tables are written column by column, as in OpenUI: each `Col` holds every value of its column, and a value can be a component, such as a `Tag` for a status.

Which tab or section is open is kept apart from the values, in the entity's `view`, so it never goes to the model as something the user entered. Forms have a guide of their own: [Forms](forms.md).

## Icons

`Icon("circle-check")` names an icon, as OpenUI's does with [Lucide](https://lucide.dev)'s names. The app decides which icons there are, through `createOpenUI`: a map of names to [Iconify](https://iconify.design) icons, or a whole Iconify collection.

```javascript
import lucide from "@iconify-json/lucide/icons.json"

const OpenUI = createOpenUI({ library: uiLibrary, icons: lucide })
```

A whole collection is the simplest and lets the model use any name, but it adds the collection to the app's bundle; a map of the few icons an app needs keeps it small. A name the app did not give draws nothing, so an answer never shows the wrong icon.

## Charts

The charts come from `@inglorious/charts`, so they are a separate import, added to the library when the app wants them:

```javascript
import "@inglorious/charts/base.css"
import "@inglorious/charts/theme.css"

import { uiLibrary } from "@inglorious/openui"
import { chartComponents } from "@inglorious/openui/charts"

const library = uiLibrary.extend({ components: { add: chartComponents } })
```

| Component                                                                                     | What it draws                                                                        |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `BarChart(labels, series, variant, xLabel, yLabel, height)`                                   | Bars per label, one colour per `Series(category, values)`; `"stacked"` piles them up |
| `LineChart(labels, series, variant, xLabel, yLabel, height)`                                  | Lines over the labels; `"natural"` smooths them, `"step"` steps them                 |
| `AreaChart(labels, series, variant, xLabel, yLabel, height)`                                  | Filled areas under the lines, with the same variants                                 |
| `PieChart(labels, values, variant, appearance)`                                               | Slices of a whole; `"donut"` leaves a hole, `"semiCircular"` draws a half            |
| `HorizontalBarChart(labels, series, variant, xLabel, yLabel)`                                 | Bars running sideways, for long category names or a ranking                          |
| `SingleStackedBarChart(labels, values)`                                                       | One bar split into the parts of a whole, named in a legend                           |
| `ScatterChart(datasets, xLabel, yLabel)` of `ScatterSeries(name, points)` of `Point(x, y, z)` | Points by two numbers; `z` sizes them                                                |
| `RadarChart(labels, series)`                                                                  | A web of measures around a circle, a shape per `Series`                              |
| `RadialChart(labels, values)`                                                                 | A ring per value, filled in proportion to the largest                                |

Like tables, charts take their data column by column: `BarChart(["Jan", "Feb"], [Series("Sales", [10, 20])])`, or `BarChart(data.months, [Series("Sales", data.sales)])` from a query. `xLabel` and `yLabel` title the axes.

## Examples for the model

`uiExamples` holds a couple of example answers. Pass them along with the prompt, especially to a small local model, which without them tends to drop the brackets around children and write answers that do not parse:

```javascript
const systemPrompt = uiLibrary.prompt({ examples: uiExamples })
```

## Your own components

`defineComponent` takes a [Zod](https://zod.dev) schema for the props and a render function that returns a template:

```javascript
import { html } from "@inglorious/web"
import { defineComponent, uiLibrary } from "@inglorious/openui"
import { z } from "zod"

const Weather = defineComponent({
  name: "Weather",
  description: "Current weather for a city",
  props: z.object({
    city: z.string(),
    celsius: z.number(),
  }),
  component: ({ props }) => html`<p>${props.city}: ${props.celsius}°C</p>`,
})

export const library = uiLibrary.extend({ components: { add: [Weather] } })
```

The order of the schema's keys is the order of the arguments: `Weather("Rome", 24)`. The description is what the model reads, so say when to use the component.

Build a library from scratch with `createLibrary({ components, root })` instead, where `root` names the component an answer starts from.

The render function receives:

| Field                                      | What it is                                                                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `props`                                    | The props, evaluated: expressions and `$variables` already resolved.                                                                       |
| `renderNode(value, scope)`                 | Renders a prop that holds components, a list of them, or text. `scope` reaches the components inside, as a Form's name reaches its fields. |
| `isStreaming`                              | True while the answer arrives; disable what acts.                                                                                          |
| `triggerAction(message, formName, action)` | Runs an action prop. See [Values and actions](values-and-actions.md#buttons).                                                              |
| `stateField(name, value)`                  | A field's `{ value, setValue }`, bound to a `$variable` when `value` is one.                                                               |
| `statementId`                              | The statement the component came from, such as `header`.                                                                                   |
| `isLoading`                                | True while any of the answer's queries fetches.                                                                                            |
| `iconFor(name)`                            | The icon the app gave for `name`, or null.                                                                                                 |
| `viewState(key, fallback)`                 | `{ value, setValue }` for state only the screen needs, such as the open tab.                                                               |
| `formName`, `label`, `hint`                | The Form the component is in, and the label and hint a FormControl gives it.                                                               |
| `fieldError(name)`                         | What failed the last time the field's form was checked.                                                                                    |
| `validateForm()`                           | In a Form: checks its fields and says whether all passed.                                                                                  |

A component with children declares them as an array, `children: z.array(z.any())`, or of specific components, `z.array(Button.ref)`, and renders them with `renderNode(props.children)`.

A prop a field can bind to a `$variable` is marked with `reactive`, as `Input`'s `value` is:

```javascript
import { reactive } from "@inglorious/openui"

props: z.object({ name: z.string(), value: reactive(z.string().optional()) })
```

and read with `stateField(props.name, props.value)`.
