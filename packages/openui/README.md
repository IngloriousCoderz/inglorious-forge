# @inglorious/openui

Generative UI for `@inglorious/web`: a model answers in [OpenUI Lang](https://openui.com/docs/openui-lang) instead of plain text, and the answer renders with Inglorious UI components as it streams in.

[OpenUI](https://github.com/thesysdev/openui)'s framework-agnostic core does the language (parsing, streaming, prompts, expressions). This package is the binding to the Inglorious store, the way `@openuidev/react-lang` is the binding to React: each answer is a store entity, so streaming it in, a button press and a value typed into a field are all ordinary events.

## What it's for

Anywhere a model's answer is easier to use as an interface than to read as text. The model chooses the layout per request, and the app decides which components it may use.

- **Chat with rich answers.** An assistant replies with a comparison table, a set of figures or a short form instead of paragraphs, and its buttons ask the obvious follow-ups.
- **Copilots inside an app.** A side panel answers "how did sales go last month?" with cards and a table drawn with the app's own components, in the app's own style.
- **Forms on demand.** The model asks for exactly the details a request needs, such as a booking or a support ticket, and gets back what the user filled in.
- **Agent results.** What an agent found or did, laid out as a summary with actions to confirm, retry or dig deeper.
- **Personal dashboards.** A view put together for one question, without anyone having designed it in advance.

It is not for screens you can design ahead of time: those are better built by hand. Generative UI earns its place where requests are too varied for fixed screens and plain text would be too hard to scan.

## Features

- **Streams.** The answer renders while it arrives; buttons wait for it to finish.
- **Inglorious UI included.** `uiLibrary` offers layout, tabs, accordions, steps, modals, cards, text, callouts, tags, images, buttons, tables and form fields with validation, with the names and arguments of OpenUI's standard library; charts, stacked or curved, come with `@inglorious/charts`, and icons from any Iconify collection.
- **Live data.** `Query` and `Mutation` call the app's own tools, as functions or through an MCP client, and results land in the entity.
- **Store-driven.** `$variables`, fields and `@Set`/`@Reset` live in the entity, and what the answer asks of the app arrives as an `openuiAction` event.
- **Safe by construction.** The model can only use the components you register; it cannot run code or invent markup.

## Install

```bash
pnpm add @inglorious/openui
```

It expects `@inglorious/web` and `@inglorious/ui` in the app.

## Getting started

Create the type from a library, and register it with an entity per answer:

```javascript
import "@inglorious/ui/all.css"

import { createStore } from "@inglorious/store"
import { mount } from "@inglorious/web"
import { createOpenUI, uiExamples, uiLibrary } from "@inglorious/openui"

const store = createStore({
  types: { OpenUI: createOpenUI({ library: uiLibrary }) },
  entities: { answer: { type: "OpenUI" } },
})

mount(store, (api) => api.render("answer"), document.getElementById("root"))
```

Tell the model how to answer, with the library's own prompt:

```javascript
const systemPrompt = uiLibrary.prompt({
  preamble: "You build sales dashboards.",
  examples: uiExamples,
})
```

Then feed it the model's answer as it streams:

```javascript
store.notify("#answer:streamStart")
for await (const text of streamFromYourModel(systemPrompt, question)) {
  store.notify("#answer:chunk", text)
}
store.notify("#answer:streamEnd")
```

An answer such as this one renders as a titled page with two figures side by side:

```text
root = Stack([title, figures])
title = CardHeader("Sales", "October")
figures = Stack([revenue, orders], "row")
revenue = Card([TextContent("Revenue", "small"), TextContent("€12,400", "large-heavy")])
orders = Card([TextContent("Orders", "small"), TextContent("318", "large-heavy")])
```

[`web-openui-chat`](../../examples/apps/web-openui-chat) is a working chat that streams answers from a local model through Ollama.

## Documentation

1. [Answers](docs/answers.md): the entity, streaming, and answers restored from history.
2. [Values and actions](docs/values-and-actions.md): `$variables`, fields, and what buttons do.
3. [Forms](docs/forms.md): fields, their rules, and what a form sends.
4. [Data from tools](docs/tools.md): `Query` and `Mutation`, run with the app's tools.
5. [Components](docs/components.md): the components in `uiLibrary`, charts, and adding your own.

## License

MIT
