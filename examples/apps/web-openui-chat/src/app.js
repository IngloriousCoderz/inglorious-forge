import { Alert } from "@inglorious/ui/alert"
import { Button } from "@inglorious/ui/button"
import { Container } from "@inglorious/ui/container"
import { Flex } from "@inglorious/ui/flex"
import { Input } from "@inglorious/ui/input"
import { Paper } from "@inglorious/ui/paper"
import { Progress } from "@inglorious/ui/progress"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"

const SUGGESTIONS = [
  "My monthly budget: rent 900, food 400, transport 120",
  "Compare three laptops for programming",
  "A sign-up form for a newsletter",
]

export const app = {
  render(api) {
    const chat = api.getEntity("chat")

    return Container.render({
      maxWidth: "md",
      padding: "md",
      children: Flex.render({
        direction: "column",
        gap: "lg",
        children: [
          Typography.render({ variant: "h1", children: "OpenUI chat" }),
          ...chat.messages.map((message) => renderMessage(message, api)),
          chat.error
            ? Alert.render({
                severity: "error",
                title: "The model did not answer",
                description: chat.error,
              })
            : "",
          chat.messages.length ? "" : renderSuggestions(api),
          renderComposer(chat, api),
        ],
      }),
    })
  },
}

function renderMessage(message, api) {
  if (message.role === "user") {
    return html`<div class="chat-user">
      ${Paper.render({ padding: "sm", radius: "lg", children: message.content })}
    </div>`
  }

  const answer = api.getEntity(message.answerId)
  // Before the first statement arrives there is nothing to show yet.
  if (answer?.isStreaming && !answer.response.trim()) {
    return Progress.render({ ariaLabel: "Thinking" })
  }
  return html`<div class="chat-answer">${api.render(message.answerId)}</div>`
}

function renderSuggestions(api) {
  return Flex.render({
    direction: "row",
    gap: "sm",
    wrap: "wrap",
    children: SUGGESTIONS.map((suggestion) =>
      Button.render({
        variant: "outline",
        size: "sm",
        children: suggestion,
        onClick: () => api.notify("#chat:messageSend", suggestion),
      }),
    ),
  })
}

function renderComposer(chat, api) {
  return html`<form
    class="chat-composer"
    @submit=${(event) => {
      event.preventDefault()
      api.notify("#chat:messageSend", chat.draft)
    }}
  >
    ${Input.render({
      name: "message",
      "aria-label": "Message",
      placeholder: "Ask for something to see",
      value: chat.draft,
      isFullWidth: true,
      isDisabled: chat.isBusy,
      onChange: (value) => api.notify("#chat:draftChange", value),
    })}
    ${Button.render({
      buttonType: "submit",
      color: "primary",
      children: "Send",
      isDisabled: chat.isBusy || !chat.draft.trim(),
    })}
  </form>`
}
