# @inglorious/openui

## 0.5.4

### Patch Changes

- Updated dependencies
  - @inglorious/ui@9.6.0

## 0.5.3

### Patch Changes

- Updated dependencies
  - @inglorious/web@6.9.1
  - @inglorious/charts@12.2.2
  - @inglorious/ui@9.5.1

## 0.5.2

### Patch Changes

- Updated dependencies
  - @inglorious/ui@9.5.0

## 0.5.1

### Patch Changes

- An action from a form sends the values of its fields bound to `$variables` too, under the fields' names, so the assistant sees what was filled in. `EditableTable`'s `url` columns show links and edit with a URL field.
- Updated dependencies
- Updated dependencies
  - @inglorious/charts@12.2.1
  - @inglorious/ui@9.4.0

## 0.5.0

### Minor Changes

- The rest of OpenUI's standard library, and its chat library:

  - `EditableTable`, drawn by Inglorious UI's `DataGrid`: a field in every cell by its column's type, a count of the cells changed, and Reset and Save Changes. Saving sends the rows to the assistant as a form named after the table, as OpenUI's does.
  - The card blocks, `SnippetCardBlock`, `OverviewCardBlock`, `ContextCardBlock`, `CompositeCardBlock` and `VisualCardBlock`, and the parts of their items, `Text`, `BoldText`, `IconText`, `ImageText`, `ImageTextLarge` and the `MetricIndicator`s. They lay their items out in a grid or a carousel; a block's action is shared by every card, and says which one was picked.
  - `chatLibrary`, with `chatRules` and `chatExamples` for its prompt: each answer is one `Card`, with `SectionBlock`s of `SectionItem`s and sources, cited in its text as `[1]`.

  An action sent to the assistant carries the values as they are when it runs, including what the same click wrote. Captions, such as subtitles and the error messages of groups of options, now show in their colours.

### Patch Changes

- Updated dependencies
  - @inglorious/ui@9.3.0

## 0.4.0

### Minor Changes

- The rest of OpenUI's charts, from `@inglorious/openui/charts`: `HorizontalBarChart`, `SingleStackedBarChart`, `ScatterChart` of `ScatterSeries` of `Point`s, `RadarChart` and `RadialChart`.

### Patch Changes

- Updated dependencies
  - @inglorious/charts@12.2.0
  - @inglorious/ui@9.2.0

## 0.3.0

### Minor Changes

- More of OpenUI's standard library, with its names and argument order:

  - Layout and content: `Carousel`, `InlineHeader`, `TextCallout`, `CodeBlock`, `TagBlock`, `ImageBlock` and `ImageGallery`, whose images open larger in a dialog.
  - Actions: `IconButton`, and `FollowUpBlock` of `FollowUpItem`s, questions that end an answer and are sent as the user's message when pressed.
  - Lists: `EntityList` of label and value rows, and `ListBlock` of `ListItem`s, numbered or with images, an action behind a button.
  - Forms: `Label`, `DatePicker` (the browser's date field, a date or a `{ from, to }` range), `Chips` of `ChipItem`s and `OptionCards` of `OptionCard`s, keeping one value or a list.

  A `Callout` bound to a `$variable` clears it 3 seconds after it turns true, as OpenUI's does. A field's `defaultValue` counts when its form checks its rules.

  Text is markdown, as in OpenUI: `TextContent` and the descriptions of `Callout` and `TextCallout` render inline markdown, and the new `MarkDownRenderer` renders whole documents, on a surface if asked. It is parsed with markdown-it, a new dependency, with raw HTML turned off: tags in the text show as text, `javascript:` links are refused, and links open in a new tab.

### Patch Changes

- Updated dependencies
  - @inglorious/ui@9.2.0

## 0.2.1

### Patch Changes

- Templates render conditionally with `when()` from `@inglorious/web/directives/when` rather than ternaries and `&&`. Behaviour is unchanged, except that a condition that is a falsy number no longer renders a stray `0`.
- Updated dependencies
- Updated dependencies
  - @inglorious/charts@12.1.0
  - @inglorious/ui@9.1.1

## 0.2.0

### Minor Changes

- `uiLibrary` covers OpenUI's standard components with their own names and arguments, in the same order, so prompts and examples written for OpenUI carry over:

  - Layout: `Tabs`, `Accordion`, `Steps`, `Modal` (with `size`), and `Separator` with `decorative`.
  - Content: `Card(children, variant, ...)` with `"card"`, `"sunk"` and `"clear"` surfaces, a `"neutral"` `Callout` whose `visible` binds to a `$variable`, `Tag(text, icon, size, variant)`, and `Icon(name, category)`, drawn from the icons given to `createOpenUI({ icons })`: a map of Iconify icons, or a whole collection such as Lucide's.
  - Forms: `Form`, `FormControl`, `TextArea`, `Select` (with `size`), `RadioGroup`, `CheckBoxGroup` and `SwitchGroup` (with `variant`) whose items show their `description`, and `Slider(name, variant, min, max, step, defaultValue, label, rules, value)`, whose list value holds one number or a range's two, with marks when `"discrete"`. A form keeps its fields' values under its name, and its primary button checks their `rules` before sending them, showing what fails.
  - Charts, from `@inglorious/openui/charts`: add `chartComponents` to the library, with `@inglorious/charts` installed. `BarChart` stacks with `"stacked"`, `LineChart` and the new `AreaChart` curve with `"natural"` or `"step"`, `xLabel` and `yLabel` title the axes, and `PieChart` draws a half circle with `"semiCircular"`.

  `Input` takes `rules` before `value`, as OpenUI's does: a filter binds with `Input("search", "Search", "text", null, $query)`. Which tab or section is open is kept in the entity's `view`, never sent to the model.

- `Query` and `Mutation` run the app's tools. Give `createOpenUI` a `toolProvider`, async functions by tool name or an MCP client, and describe the tools to the model with `uiLibrary.prompt({ tools })`. A query runs once the answer is whole, again when its arguments change and on its refresh interval, showing its defaults until data arrives; `@Run` fetches a query again or runs a mutation, and the steps after a mutation wait for it and stop if it fails. Results live in the entity's `queries` and `mutations`, and components see `isLoading` while a query fetches.

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @inglorious/charts@12.0.0
  - @inglorious/ui@9.1.0

## 0.1.0

### Minor Changes

- New package: generative UI for Inglorious Web. A model answers in OpenUI Lang and the answer renders with Inglorious UI components as it streams in. `createOpenUI({ library })` returns the type for an answer entity, streamed with `streamStart`, `chunk` and `streamEnd`; its `$variables` and fields live in the entity, and what the answer asks of the app is announced as `openuiAction`. `uiLibrary` offers Stack, Separator, Card, CardHeader, TextContent, Callout, Tag, Image, Button, Buttons, Table, Col and Input, under the names OpenUI's standard library uses, and `uiExamples` holds example answers to pass with its prompt, which small local models need. `Query` and `Mutation` are not supported yet.
