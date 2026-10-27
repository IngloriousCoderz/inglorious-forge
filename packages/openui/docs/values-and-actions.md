# Values and actions

An answer can hold state of its own: what a filter is set to, whether a message shows. In OpenUI Lang that is a `$variable`, declared with its default:

```text
$query = ""
$saved = false
```

Here it lives in the entity's `values`, which keeps only what differs from the defaults. Every change to it is an event on the entity, so the store stays the one source of truth and the answer renders from it like anything else.

## Fields

A field bound to a `$variable` shows it and writes back to it as the user types:

```text
search = Input("search", "Filter by customer", "text", null, $query)
matches = TextContent("Showing " + $query)
```

Typing into it is `#answer:valueChange` with `{ name: "$query", value }`. A field bound to nothing keeps its value under its own name, `search` here.

## Buttons

A button's action is one step, or several in `Action([...])`:

```text
save = Button("Save report", Action([@Set($saved, true), @ToAssistant("Saved the report")]))
```

| Step                    | What happens                                                                   |
| ----------------------- | ------------------------------------------------------------------------------ |
| `@Set($var, value)`     | `valueChange` on the entity. Later steps of the same action see the new value. |
| `@Reset($var, ...)`     | `valuesReset`: back to the defaults.                                           |
| `@ToAssistant(message)` | Announced as `openuiAction`, for the app to send back to the model.            |
| `@OpenUrl(url)`         | Announced as `openuiAction`.                                                   |
| A custom action         | Announced as `openuiAction`, under its own name.                               |
| `@Run(query)`           | Fetches a query again, or runs a mutation. See [Data from tools](tools.md).    |

A button with no action sends its label back to the assistant.

## Handling openuiAction

What is meant for the app is announced unscoped, for the type that talks to the model, such as the chat [in a chat](answers.md#in-a-chat):

```javascript
const withAssistant = (type) => ({
  openuiAction(chat, event, api) {
    if (event.type === "open_url") {
      window.open(event.params.url, "_blank", "noopener")
      return
    }
    if (event.type === "continue_conversation") {
      const filled = JSON.stringify(event.formState)
      api.notify(
        `#${chat.id}:messageSend`,
        `${event.humanFriendlyMessage}\n\n(Values on screen: ${filled})`,
      )
    }
  },
})
```

The event carries `id` (the answer it came from), `type`, `params`, `humanFriendlyMessage`, and `formState`, every value the answer holds at that moment, so the model knows what the user had filled in.

Next: [Forms](forms.md)
