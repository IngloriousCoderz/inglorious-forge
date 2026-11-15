---
name: openui
description: "@inglorious/openui: generative UI - a model answers in OpenUI Lang, rendered with Inglorious UI as it streams, held in a store entity, with forms, charts and Query/Mutation tools."
---

# @inglorious/openui

For answers better used than read (chat replies, copilots, forms on demand, one-off dashboards), not designable screens. Peers: `@inglorious/web`, `@inglorious/ui`, optional `@inglorious/charts`. Deny `@openuidev/lang-core` postinstall telemetry with pnpm `allowBuilds: { "@openuidev/lang-core": false }`.

```javascript
import "@inglorious/ui/all.css";
import "@inglorious/ui/themes/inglorious.css";
import { createOpenUI, uiExamples, uiLibrary } from "@inglorious/openui";

const store = createStore({
  types: { OpenUI: createOpenUI({ library: uiLibrary, toolProvider, icons }) },
  entities: { answer: { type: "OpenUI" } },
});

const systemPrompt = uiLibrary.prompt({ preamble: "You build sales dashboards.", examples: uiExamples, tools: toolSpecs });
```

`icons`: name → Iconify icon map or a collection JSON. Render with `api.render("answer")`; one entity per chat answer.

## Streaming

`#answer:streamStart`, `#answer:chunk` (text), `#answer:streamEnd` (enables buttons, runs queries), `#answer:responseChange` (whole text). Call the model from an async function that notifies; never mutate after `await`. History: `buildMessage({ content, context: values })`, `parseMessage(saved)`.

Entity: `response`, `isStreaming`, `values` (variables, form fields by form name), `view` (screen-only, never sent), `fieldErrors`, `queries`/`mutations` (`{ status, data, error }`), `errors` (parser).

## Actions

`@Set`/`@Reset` → `valueChange`/`valuesReset`; `@Run` runs a query/mutation (later steps wait, stop on failure). Everything else is announced unscoped as `openuiAction` `{ id, type, params, humanFriendlyMessage, formName, formState }`:

```javascript
const withAssistant = (type) => ({
  openuiAction(chat, event, api) {
    if (event.type === "continue_conversation") api.notify(`#${chat.id}:messageSend`, event.humanFriendlyMessage);
    if (event.type === "open_url") window.open(event.params.url, "_blank", "noopener");
  },
});
```

With Inglorious UI's `Chat`, a message `{ entity: answerId }` renders an answer; wrap `messageSend` to `messageAdd`, `replyStart`, stream, then `replyEnd`/`replyFail`. Buttons without actions send their label; forms send only their own fields.

## OpenUI Lang

```text
$status = "paid"
orders = Query("list_orders", {status: $status}, {rows: []}, 30)
root = Stack([title, tbl])
title = CardHeader("Orders", "This month")
tbl = Table([Col("Customer", orders.rows.customer), Col("Total", orders.rows.total, "number")])
```

One statement per line, `root` first, positional args, unreachable statements dropped. `x.rows.field` plucks; `@Count`, `@Sum`, `@Avg`, `@Filter`, `@Sort`, `@Each`, `@Round`.

## uiLibrary

Names and argument order follow OpenUI's standard library:

- Layout: `Stack`, `Separator`, `Tabs`/`TabItem`, `Accordion`/`AccordionItem`, `Steps`/`StepsItem`, `Carousel`, `Modal(title, $open, children, size)`.
- Content: `Card` (`card|sunk|clear`), `CardHeader`, `InlineHeader`, `TextContent`, `MarkDownRenderer`, `Callout(..., $visible)` (auto-clears 3 s), `TextCallout`, `CodeBlock`, `Tag`, `TagBlock`, `Icon`, `Image`, `ImageBlock`, `ImageGallery`.
- Actions: `Button(label, action, variant, type, size)`, `Buttons`, `IconButton`, `FollowUpBlock`/`FollowUpItem`.
- Tables: `Table([Col(label, data, type)])`, `EditableTable(name, columns, rows)`, `EntityList`, `ListBlock`/`ListItem`.
- Cards: `SnippetCardBlock`, `OverviewCardBlock`, `ContextCardBlock`, `CompositeCardBlock`, `VisualCardBlock` with `Text`, `BoldText`, `IconText`, `ImageText`, `ImageTextLarge`, `MetricIndicatorInline`, `MetricIndicatorWithStrikethrough`.
- Forms: `Form(name, Buttons, [FormControl(label, input, hint)])`, `Input`, `TextArea`, `Select`/`SelectItem`, `RadioGroup`, `CheckBoxGroup`, `SwitchGroup`, `Slider` (value `[50]` or `[20, 80]`), `DatePicker` (`"2026-10-27"` or `{from, to}`), `Chips`, `OptionCards`, `Label`. Rules `{required, email, url, numeric, min, max, minLength, maxLength, pattern}` are checked by the primary button.
- Charts: `uiLibrary.extend({ components: { add: chartComponents } })` from `@inglorious/openui/charts`: `BarChart`, `LineChart`, `AreaChart`, `PieChart`, `HorizontalBarChart`, `SingleStackedBarChart`, `ScatterChart`, `RadarChart`, `RadialChart`. Import charts' `base.css` and `theme.css`.
- `chatLibrary` (+ `chatRules`, `chatExamples`): one `Card(children, sources)` per answer, `SectionBlock`, `[n]` citations.

## Tools

`toolProvider` is `{ name: (args) => Promise }` or an MCP client. Describe tools in `prompt({ tools: [{ name, description, inputSchema, outputSchema }] })`. Queries run at `streamEnd`, on argument change and on interval; stale replies dropped; defaults show meanwhile. Mutations run only from `@Run`.

## Own components

```javascript
import { defineComponent, uiLibrary } from "@inglorious/openui";
import { z } from "zod";

const Weather = defineComponent({
  name: "Weather",
  description: "Current weather for a city",
  props: z.object({ city: z.string(), celsius: z.number() }), // key order = argument order
  component: ({ props }) => html`<p>${props.city}: ${props.celsius}°C</p>`,
});

export const library = uiLibrary.extend({ components: { add: [Weather] } });
```

Render gets `props`, `renderNode`, `isStreaming`, `isLoading`, `triggerAction`, `stateField(name, binding)`, `viewState(key, fallback)`, `formName`, `label`, `hint`, `fieldError`, `validateForm`, `statementId`.

## Rules

- Each component gets its own `z.object(...)`.
- Render only reads; change through `stateField`, `viewState`, `triggerAction`.
- Screen-only state in `viewState`.
- Always pass `uiExamples`; low temperature for small models; spell out rules via `additionalRules`. ~8B handles queries, charts, tables; mutation forms need larger.
- Log or retry from `entity.errors`.
