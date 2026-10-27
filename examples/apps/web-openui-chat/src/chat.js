import { uiExamples, uiLibrary } from "@inglorious/openui"

import { streamChat } from "./model.js"

const SYSTEM_PROMPT = uiLibrary.prompt({
  preamble:
    "You are a helpful assistant. Answer every request with a small interface: figures in cards, lists as tables, and buttons for the obvious follow-ups.",
  examples: uiExamples,
})

/**
 * The conversation. User messages keep their text; each answer is an OpenUI
 * entity of its own, which the model's reply streams into.
 */
export const Chat = {
  create(entity) {
    entity.messages = []
    entity.draft = ""
    entity.isBusy = false
    entity.error = null
  },

  draftChange(entity, draft) {
    entity.draft = draft
  },

  messageSend(entity, text, api) {
    const content = text.trim()
    if (!content || entity.isBusy) return

    const answerId = `answer${entity.messages.length}`
    const history = toModelMessages(entity.messages, api)
    entity.messages.push({ role: "user", content })
    entity.messages.push({ role: "assistant", answerId })
    entity.draft = ""
    entity.isBusy = true
    entity.error = null

    api.notify("add", { id: answerId, type: "OpenUI" })
    streamAnswer({
      answerId,
      messages: [...history, { role: "user", content }],
      api,
    })
  },

  answerEnd(entity) {
    entity.isBusy = false
  },

  answerFail(entity, message) {
    entity.isBusy = false
    entity.error = message
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
    api.notify("#chat:messageSend", event.humanFriendlyMessage + context)
  },
}

/** The conversation so far, as the model reads it: answers as the text they were. */
function toModelMessages(messages, api) {
  return messages.map((message) =>
    message.role === "user"
      ? message
      : {
          role: "assistant",
          content: api.getEntity(message.answerId)?.response ?? "",
        },
  )
}

async function streamAnswer({ answerId, messages, api }) {
  api.notify(`#${answerId}:streamStart`)
  try {
    for await (const text of streamChat({ system: SYSTEM_PROMPT, messages })) {
      api.notify(`#${answerId}:chunk`, text)
    }
    api.notify("#chat:answerEnd")
  } catch (error) {
    api.notify("#chat:answerFail", error.message)
  } finally {
    api.notify(`#${answerId}:streamEnd`)
  }
}
