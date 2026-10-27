/**
 * @typedef {import('../../../types/data-display/chat').ChatEntity} ChatEntity
 * @typedef {import('../../../types/data-display/chat').ChatMessage} ChatMessage
 */

/**
 * Fills in a chat's defaults. A chat keeps its messages and the draft being
 * typed; who answers, and how, is the app's to decide by handling
 * `messageSend`.
 * @param {ChatEntity} entity
 */
export function create(entity) {
  entity.messages ??= []
  entity.draft ??= ""
  entity.isBusy ??= false
  entity.error ??= null
  entity.suggestions ??= []
  entity.messageCount ??= entity.messages.length
}

/**
 * Keeps what the user is typing.
 * @param {ChatEntity} entity
 * @param {string} draft
 */
export function draftChange(entity, draft) {
  entity.draft = draft
}

/**
 * Adds the user's message: the text given, such as a suggestion picked, or
 * else the draft, which it clears. Nothing is sent while a reply is coming,
 * nor an empty message. Apps answer by handling this event after the chat.
 * @param {ChatEntity} entity
 * @param {string} [text]
 */
export function messageSend(entity, text) {
  const content = (text ?? entity.draft).trim()
  if (!content || entity.isBusy) return

  addMessage(entity, { role: "user", content })
  entity.draft = ""
  entity.error = null
}

/**
 * Adds a message, such as the assistant's reply: its text as `content`, or
 * the id of an entity that renders it as `entity`.
 * @param {ChatEntity} entity
 * @param {Partial<ChatMessage>} message
 */
export function messageAdd(entity, message) {
  addMessage(entity, { role: "assistant", ...message })
}

/**
 * A reply is on its way: the chat says so, and waits for it to send again.
 * @param {ChatEntity} entity
 */
export function replyStart(entity) {
  entity.isBusy = true
  entity.error = null
}

/**
 * The reply is whole.
 * @param {ChatEntity} entity
 */
export function replyEnd(entity) {
  entity.isBusy = false
}

/**
 * The reply failed: the chat shows why, and can send again.
 * @param {ChatEntity} entity
 * @param {string} error
 */
export function replyFail(entity, error) {
  entity.isBusy = false
  entity.error = error
}

/**
 * Starts the conversation over.
 * @param {ChatEntity} entity
 */
export function messagesClear(entity) {
  entity.messages = []
  entity.error = null
}

function addMessage(entity, message) {
  entity.messageCount = (entity.messageCount ?? entity.messages.length) + 1
  entity.messages.push({ id: `m${entity.messageCount}`, ...message })
}
