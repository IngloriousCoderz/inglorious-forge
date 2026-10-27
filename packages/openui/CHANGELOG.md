# @inglorious/openui

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
