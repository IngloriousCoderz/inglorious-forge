import { ActionSheet } from "@inglorious/ui/action-sheet"
import { Button } from "@inglorious/ui/button"
import { Dialog } from "@inglorious/ui/dialog"
import { Fab } from "@inglorious/ui/fab"
import { IconButton } from "@inglorious/ui/icon-button"
import { List } from "@inglorious/ui/list"
import { PullToRefresh } from "@inglorious/ui/pull-to-refresh"
import { Textarea } from "@inglorious/ui/textarea"
import { html } from "@inglorious/web"
import { haptics } from "@inglorious/web/native/haptics"

import { replies } from "../store/replies.js"

const REFRESH_MS = 1200
const DRAFT_ROWS = 4
const ONE_MESSAGE = 1
const KEEP_ALL = 0

export const Inbox = {
  refresh(entity, _, api) {
    entity.isRefreshing = true
    setTimeout(() => api.notify("#inbox:refreshed"), REFRESH_MS)
  },

  refreshed(entity) {
    const reply = replies[entity.nextId % replies.length]
    entity.messages.unshift({
      id: entity.nextId,
      ...reply,
      body: "Arrived with a pull to refresh.",
      isUnread: true,
    })
    entity.nextId += 1
    entity.isRefreshing = false
  },

  menuOpen(entity, id) {
    entity.menuFor = id
  },

  menuClose(entity) {
    entity.menuFor = null
  },

  toggleUnread(entity, id) {
    const message = entity.messages.find((message) => message.id === id)
    message.isUnread = !message.isUnread
  },

  remove(entity, id, api) {
    const index = entity.messages.findIndex((message) => message.id === id)
    const [message] = entity.messages.splice(index, ONE_MESSAGE)
    entity.deleted = { message, index }
    api.notify("#notice:show", { message: "Message deleted", canUndo: true })
  },

  undo(entity) {
    if (!entity.deleted) return
    const { message, index } = entity.deleted
    entity.messages.splice(index, KEEP_ALL, message)
    entity.deleted = null
  },

  read(entity, id) {
    const message = entity.messages.find((message) => message.id === id)
    if (message) message.isUnread = false
  },

  composeOpen(entity) {
    entity.isComposing = true
  },

  composeClose(entity) {
    entity.isComposing = false
  },

  draftChange(entity, draft) {
    entity.draft = draft
  },

  send(entity, _, api) {
    const draft = entity.draft.trim()
    if (!draft) return
    const [subject] = draft.split("\n")
    entity.messages.unshift({
      id: entity.nextId,
      from: "You",
      subject,
      body: draft,
      isUnread: false,
    })
    entity.nextId += 1
    entity.draft = ""
    entity.isComposing = false
    api.notify("#notice:show", { message: "Message sent" })
  },

  render(entity, api) {
    const menuMessage = entity.messages.find(
      (message) => message.id === entity.menuFor,
    )

    return html`
      ${PullToRefresh.render({
        isRefreshing: entity.isRefreshing,
        onRefresh: () => api.notify("#inbox:refresh"),
        children: List.render({
          isDivided: true,
          items: entity.messages.map((message) => ({
            id: message.id,
            primary: html`<span class=${message.isUnread ? "unread" : ""}
              >${message.from} · ${message.subject}</span
            >`,
            secondary: message.body,
            action: IconButton.render({
              variant: "ghost",
              icon: "⋯",
              ariaLabel: `Actions for ${message.subject}`,
              onClick: () => api.notify("#inbox:menuOpen", message.id),
            }),
            onClick: () =>
              api.notify("#router:navigate", `/messages/${message.id}`),
          })),
        }),
      })}

      <div class="fab">
        ${Fab.render({
          color: "primary",
          ariaLabel: "Write a message",
          onClick: () => api.notify("#inbox:composeOpen"),
          children: "✎",
        })}
      </div>

      ${ActionSheet.render({
        isOpen: Boolean(menuMessage),
        title: menuMessage?.subject,
        message: menuMessage && `From ${menuMessage.from}`,
        actions: menuMessage
          ? [
              {
                label: menuMessage.isUnread ? "Mark as read" : "Mark as unread",
                onClick: () =>
                  api.notify("#inbox:toggleUnread", menuMessage.id),
              },
              {
                label: "Delete",
                color: "error",
                onClick: () => {
                  haptics.notification("warning")
                  api.notify("#inbox:remove", menuMessage.id)
                },
              },
            ]
          : [],
        onClose: () => api.notify("#inbox:menuClose"),
      })}
      ${Dialog.render({
        isOpen: entity.isComposing,
        variant: "sheet",
        title: "New message",
        onClose: () => api.notify("#inbox:composeClose"),
        children: Textarea.render({
          label: "Message",
          rows: DRAFT_ROWS,
          isFullWidth: true,
          isAutoSize: true,
          value: entity.draft,
          placeholder: "The sheet stays above the keyboard",
          onChange: (value) => api.notify("#inbox:draftChange", value),
        }),
        actions: html`
          ${Button.render({
            variant: "outline",
            onClick: () =>
              api.notify("#notice:show", { message: "Draft saved" }),
            children: "Save draft",
          })}
          ${Button.render({
            color: "primary",
            isDisabled: !entity.draft.trim(),
            onClick: () => {
              haptics.notification("success")
              api.notify("#inbox:send")
            },
            children: "Send",
          })}
        `,
      })}
    `
  },
}
