# Components

The model can only use the components in the library you give `createOpenUI`. Each one has a name, a description and a props schema, which `library.prompt()` turns into the instructions the model follows, and a render function.

## uiLibrary

`uiLibrary` is Inglorious UI as an OpenUI library. The components take the names and, where they can, the argument order of OpenUI's standard library, so prompts and examples written for that one mostly carry over. The authoritative list is what `uiLibrary.prompt()` says.

| Group   | Components                                                                                                                                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout  | `Stack(children, direction, gap, align, justify, wrap)`, `Separator(orientation)`                                                                                                                                         |
| Content | `Card(children, direction, gap, align, justify, wrap, variant)`, `CardHeader(title, subtitle)`, `TextContent(text, size)`, `Callout(variant, title, description, visible)`, `Tag(text, size, variant)`, `Image(alt, src)` |
| Actions | `Button(label, action, variant, type, size)`, `Buttons(buttons, direction)`                                                                                                                                               |
| Tables  | `Table(columns)`, `Col(label, data, type)`                                                                                                                                                                                |
| Forms   | `Input(name, placeholder, type, value)`                                                                                                                                                                                   |

`Card` takes its layout arguments in the same order as `Stack`, with `variant` last, unlike OpenUI's: models tend to write the two alike.

Tables are written column by column, as in OpenUI: each `Col` holds every value of its column, and a value can be a component, such as a `Tag` for a status.

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

| Field                                      | What it is                                                                    |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| `props`                                    | The props, evaluated: expressions and `$variables` already resolved.          |
| `renderNode(value)`                        | Renders a prop that holds components, a list of them, or text.                |
| `isStreaming`                              | True while the answer arrives; disable what acts.                             |
| `triggerAction(message, formName, action)` | Runs an action prop. See [Values and actions](values-and-actions.md#buttons). |
| `stateField(name, value)`                  | A field's `{ value, setValue }`, bound to a `$variable` when `value` is one.  |
| `statementId`                              | The statement the component came from, such as `header`.                      |

A component with children declares them as an array, `children: z.array(z.any())`, or of specific components, `z.array(Button.ref)`, and renders them with `renderNode(props.children)`.

A prop a field can bind to a `$variable` is marked with `reactive`, as `Input`'s `value` is:

```javascript
import { reactive } from "@inglorious/openui"

props: z.object({ name: z.string(), value: reactive(z.string().optional()) })
```

and read with `stateField(props.name, props.value)`.
