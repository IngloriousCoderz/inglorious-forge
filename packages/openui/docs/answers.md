# Answers

Each answer from the model is one entity of the type `createOpenUI` returns. It holds:

| Field         | What it is                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `response`    | The answer in OpenUI Lang, or as much of it as has arrived.                                                                           |
| `isStreaming` | True from `streamStart` to `streamEnd`.                                                                                               |
| `values`      | What the answer's `$variables` and fields hold, where they differ from its defaults. See [Values and actions](values-and-actions.md). |
| `errors`      | The answer's validation errors, once it is whole.                                                                                     |

A chat keeps one entity per message: add one with `api.notify("add", { id, type: "OpenUI" })` when the model starts answering, and render each in turn.

## Streaming

Three events, scoped to the entity:

```javascript
store.notify("#answer:streamStart") // a new answer: the last one's values go
store.notify("#answer:chunk", text) // as many times as the model sends text
store.notify("#answer:streamEnd") // the answer is whole
```

The answer renders after every chunk. OpenUI Lang is written top-down and a parent may name a child that has not arrived yet, so the page fills in as the statements do. Until `streamEnd`, buttons and fields are disabled: acting on half an answer could act on the wrong thing.

The text to send is the model's output as it is. With a provider that streams server-sent events, send each event's text delta as a chunk.

## Whole answers

An answer that is already complete, such as one restored from history, goes in at once:

```javascript
store.notify("#answer:responseChange", savedText)
```

or straight in the entity:

```javascript
entities: { answer: { type: "OpenUI", response: savedText, values: savedValues } }
```

Saving `values` with the text brings back what the user had typed and chosen. OpenUI's `buildMessage` and `parseMessage`, re-exported here, keep the two in one string:

```javascript
const saved = buildMessage({ content: answer.response, context: answer.values })

const { content, context } = parseMessage(saved)
const restored = { type: "OpenUI", response: content, values: context ?? {} }
```

## Errors

The parser renders what it can. A component with a missing required prop, or one the library does not have, is left out, and the problem is recorded in `entity.errors` once the answer is whole, each with a `code` such as `missing-required` or `unknown-component`. That is the place to log them, or to ask the model to try again.

A component that throws while rendering is left out too, and the rest of the answer still shows. The error goes to the console.

Next: [Values and actions](values-and-actions.md)
