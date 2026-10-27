import type { Api, TemplateResult } from "@inglorious/web"

/** One message of a chat: its text, or an entity that renders it. */
export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  /** What the message says, as text. */
  content?: string
  /** The id of an entity to render as the message, such as a generated answer. */
  entity?: string
  [key: string]: unknown
}

/** What a chat keeps and shows. */
export interface ChatProps {
  id?: string
  type?: string
  messages?: ChatMessage[]
  /** What the user is typing. */
  draft?: string
  /** A reply is on its way: the chat shows it, and does not send meanwhile. */
  isBusy?: boolean
  /** Why the last reply failed. */
  error?: string | null
  /** Messages to start with, offered while the chat is empty. */
  suggestions?: string[]
  /** Names the chat for assistive tech. Defaults to "Chat". */
  label?: string
  /** The message box's placeholder and name. Defaults to "Message". */
  placeholder?: string
  /** Defaults to "Send". */
  sendLabel?: string
  /** Who the user's messages are by, for assistive tech. Defaults to "You". */
  userLabel?: string
  /** Who replies. Defaults to "Assistant". */
  assistantLabel?: string
  onDraftChange?: (draft: string) => void
  /** Sends `text`, such as a suggestion picked, or else the draft. */
  onSend?: (text?: string) => void
  /** Draws a message's `entity`. */
  renderEntity?: (entityId: string) => unknown
  [key: string]: unknown
}

/** A chat entity: its props, and a count that keeps message ids unique. */
export interface ChatEntity extends ChatProps {
  id?: string
  type: string
  messages: ChatMessage[]
  messageCount?: number
}

export type ChatType = {
  create(entity: ChatEntity): void
  draftChange(entity: ChatEntity, draft: string): void
  /** Adds the user's message, `text` or the draft; apps answer by handling it too. */
  messageSend(entity: ChatEntity, text?: string): void
  /** Adds a message, the assistant's by default. */
  messageAdd(entity: ChatEntity, message: Partial<ChatMessage>): void
  replyStart(entity: ChatEntity): void
  replyEnd(entity: ChatEntity): void
  replyFail(entity: ChatEntity, error: string): void
  messagesClear(entity: ChatEntity): void
  render(entity: ChatEntity, api: Api): TemplateResult
  renderChat(props: ChatProps): TemplateResult
  renderMessage(props: ChatProps, message: ChatMessage): TemplateResult
  renderContent(props: ChatProps, message: ChatMessage): unknown
  renderTyping(props: ChatProps): TemplateResult
  renderSuggestions(props: ChatProps): TemplateResult
  renderComposer(props: ChatProps): TemplateResult
}

export declare const Chat: ChatType
