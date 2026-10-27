/**
 * @typedef {import('../../../types/data-display/chat').ChatProps} ChatProps
 * @typedef {import('../../../types/data-display/chat').ChatMessage} ChatMessage
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { ref } from "@inglorious/web/directives/ref"
import { repeat } from "@inglorious/web/directives/repeat"
import { when } from "@inglorious/web/directives/when"

import { Button } from "../../controls/button/index.js"
import { Textarea } from "../../controls/textarea/index.js"
import { Alert } from "../../feedback/alert/index.js"

/** How close to the bottom, in pixels, still counts as reading the latest. */
const PINNED_DISTANCE = 40
const TYPING_DOTS = 3

export const Chat = {
  /**
   * Main entrypoint for the chat template. It delegates to `renderChat` so overrides can still reuse it.
   * A chat shows a conversation, the assistant's replies as they come, and a box to write the next message.
   * @param {ChatProps} props The chat props.
   * @returns {TemplateResult} The rendered chat.
   */
  render(props) {
    return this.renderChat(props)
  },

  /**
   * Renders the conversation, any error, the suggestions while it is empty, and the composer.
   * @param {ChatProps} props The chat props.
   * @returns {TemplateResult} The rendered chat.
   */
  renderChat(props) {
    const {
      messages = [],
      isBusy = false,
      error,
      suggestions = [],
      label = "Chat",
    } = props

    return html`<section class="iw-chat" aria-label=${label}>
      <div
        class="iw-chat-messages"
        role="log"
        aria-live="polite"
        @scroll=${keepPinned}
        ${ref(followLatest)}
      >
        ${repeat(
          messages,
          (message) => message.id,
          (message) => this.renderMessage?.(props, message),
        )}
        ${when(isBusy, () => this.renderTyping?.(props))}
      </div>
      ${when(error, () => Alert.render({ severity: "error", description: error }))}
      ${when(!messages.length && suggestions.length, () =>
        this.renderSuggestions?.(props),
      )}
      ${this.renderComposer?.(props)}
    </section>`
  },

  /**
   * Renders one message: the user's in a bubble, the assistant's across the chat.
   * Override to show who wrote it, or when.
   * @param {ChatProps} props The chat props.
   * @param {ChatMessage} message The message.
   * @returns {TemplateResult} The rendered message.
   */
  renderMessage(props, message) {
    const isUser = message.role === "user"
    const author = isUser
      ? (props.userLabel ?? "You")
      : (props.assistantLabel ?? "Assistant")

    return html`<article
      class="iw-chat-message iw-chat-message-${isUser ? "user" : "assistant"}"
      aria-label=${author}
    >
      <div class="iw-chat-message-content">
        ${this.renderContent?.(props, message)}
      </div>
    </article>`
  },

  /**
   * Renders what a message says: its `content`, or what `renderEntity` draws for its `entity`.
   * @param {ChatProps} props The chat props.
   * @param {ChatMessage} message The message.
   * @returns {unknown} The message's content.
   */
  renderContent(props, message) {
    return when(
      message.entity && props.renderEntity,
      () => props.renderEntity(message.entity),
      () => html`<span class="iw-chat-text">${message.content}</span>`,
    )
  },

  /**
   * Renders the sign that a reply is on its way.
   * @param {ChatProps} props The chat props.
   * @returns {TemplateResult} The rendered indicator.
   */
  renderTyping(props) {
    const author = props.assistantLabel ?? "Assistant"
    return html`<div
      class="iw-chat-typing"
      role="status"
      aria-label=${`${author} is replying`}
    >
      ${Array.from(
        { length: TYPING_DOTS },
        () => html`<span class="iw-chat-typing-dot"></span>`,
      )}
    </div>`
  },

  /**
   * Renders the messages the user may start with, while the chat is empty.
   * @param {ChatProps} props The chat props.
   * @returns {TemplateResult} The rendered suggestions.
   */
  renderSuggestions(props) {
    return html`<div class="iw-chat-suggestions">
      ${props.suggestions.map((suggestion) =>
        Button.render({
          variant: "outline",
          size: "sm",
          children: suggestion,
          isDisabled: props.isBusy,
          onClick: () => props.onSend?.(suggestion),
        }),
      )}
    </div>`
  },

  /**
   * Renders the box to write a message in, which grows with it, and the button that sends it.
   * Enter sends; Shift+Enter starts a new line.
   * @param {ChatProps} props The chat props.
   * @returns {TemplateResult} The rendered composer.
   */
  renderComposer(props) {
    const { draft = "", isBusy = false } = props
    const send = () => props.onSend?.()

    return html`<form
      class="iw-chat-composer"
      @submit=${(event) => {
        event.preventDefault()
        send()
      }}
    >
      ${Textarea.render({
        name: "message",
        ariaLabel: props.placeholder ?? "Message",
        placeholder: props.placeholder ?? "Message",
        value: draft,
        rows: 1,
        isAutoSize: true,
        isFullWidth: true,
        onChange: (value) => props.onDraftChange?.(value),
        onKeyDown: (event) => {
          // Enter sends, unless it closes a character being composed.
          if (event.key !== "Enter" || event.shiftKey || event.isComposing) {
            return
          }
          event.preventDefault()
          send()
        },
      })}
      ${Button.render({
        buttonType: "submit",
        color: "primary",
        children: props.sendLabel ?? "Send",
        isDisabled: isBusy || !draft.trim(),
      })}
    </form>`
  },
}

/**
 * Notes whether the user is reading the latest messages, at the bottom, or
 * has scrolled up to read earlier ones.
 * @param {Event} event
 */
function keepPinned(event) {
  const log = event.currentTarget
  const distance = log.scrollHeight - log.scrollTop - log.clientHeight
  log.dataset.isPinned = String(distance < PINNED_DISTANCE)
}

/**
 * After each render, scrolls to the latest message, unless the user has
 * scrolled up to read.
 * @param {Element | undefined} log
 */
function followLatest(log) {
  if (!log) return
  queueMicrotask(() => {
    if (log.dataset.isPinned !== "false") log.scrollTop = log.scrollHeight
  })
}
