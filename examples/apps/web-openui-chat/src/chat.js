import { systemPrompt } from "./library.js"
import { streamChat } from "./model.js"

/**
 * What the app adds to Inglorious UI's chat: an answer from the model for
 * every message sent. Each answer is an OpenUI entity of its own, which the
 * model's reply streams into, and which the chat shows as the assistant's
 * message.
 */
export const withAssistant = (type) => ({
  messageSend(entity, text, api) {
    // The conversation so far, as the model reads it.
    const history = toModelMessages(entity.messages, api)
    const sent = entity.messages.length
    type.messageSend(entity, text, api)
    // Nothing to send, or a reply still coming: the chat sent nothing.
    if (entity.messages.length === sent) return

    const { content } = entity.messages[sent]
    const answerId = `answer${entity.messageCount}`
    type.messageAdd(entity, { entity: answerId })
    type.replyStart(entity)

    api.notify("add", { id: answerId, type: "OpenUI" })
    streamAnswer({
      chatId: entity.id,
      answerId,
      messages: [...history, { role: "user", content }],
      api,
    })
  },

  /** What an answer's buttons ask of the conversation. */
  openuiAction(entity, event, api) {
    if (event.type === "open_url") {
      window.open(event.params.url, "_blank", "noopener")
      return
    }
    if (event.type !== "continue_conversation") return

    // What the user filled in goes along, so the model can act on it.
    const values = Object.entries(event.formState ?? {}).filter(
      ([, value]) => value !== "" && value != null,
    )
    const context = values.length
      ? `\n\n(Values on screen: ${JSON.stringify(Object.fromEntries(values))})`
      : ""
    api.notify(
      `#${entity.id}:messageSend`,
      event.humanFriendlyMessage + context,
    )
  },
})

/** The messages as the model reads them: answers as the text they were. */
function toModelMessages(messages, api) {
  return messages.map((message) => ({
    role: message.role,
    content: message.entity
      ? (api.getEntity(message.entity)?.response ?? "")
      : message.content,
  }))
}

async function streamAnswer({ chatId, answerId, messages, api }) {
  api.notify(`#${answerId}:streamStart`)
  try {
    for await (const text of streamChat({ system: systemPrompt, messages })) {
      api.notify(`#${answerId}:chunk`, text)
    }
    api.notify(`#${chatId}:replyEnd`)
  } catch (error) {
    api.notify(`#${chatId}:replyFail`, error.message)
  } finally {
    api.notify(`#${answerId}:streamEnd`)
  }
}
