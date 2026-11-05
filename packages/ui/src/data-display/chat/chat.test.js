import { createStore } from "@inglorious/store"
import { html, mount } from "@inglorious/web"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Chat } from "."

describe("Chat / handlers", () => {
  let entity

  beforeEach(() => {
    entity = { id: "chat", type: "Chat" }
    Chat.create(entity)
  })

  it("sends the draft as the user's message, and clears it", () => {
    Chat.draftChange(entity, "  Hello  ")
    Chat.messageSend(entity)

    expect(entity.messages).toEqual([
      { id: "m1", role: "user", content: "Hello" },
    ])
    expect(entity.draft).toBe("")
  })

  it("sends a text given instead, such as a suggestion", () => {
    Chat.messageSend(entity, "Show my expenses")

    expect(entity.messages[0].content).toBe("Show my expenses")
  })

  it("sends nothing empty, nor while a reply is coming", () => {
    Chat.messageSend(entity, "   ")
    Chat.replyStart(entity)
    Chat.messageSend(entity, "Hello")

    expect(entity.messages).toEqual([])
  })

  it("adds the assistant's messages, each with its own id", () => {
    Chat.messageSend(entity, "Hi")
    Chat.messageAdd(entity, { entity: "answer1" })
    Chat.messagesClear(entity)
    Chat.messageAdd(entity, { content: "Again" })

    expect(entity.messages).toEqual([
      { id: "m3", role: "assistant", content: "Again" },
    ])
  })

  it("is busy while a reply comes, and keeps why one failed", () => {
    Chat.replyStart(entity)
    expect(entity.isBusy).toBe(true)

    Chat.replyFail(entity, "The model is offline")
    expect(entity.isBusy).toBe(false)
    expect(entity.error).toBe("The model is offline")

    Chat.replyStart(entity)
    expect(entity.error).toBeNull()
    Chat.replyEnd(entity)
    expect(entity.isBusy).toBe(false)
  })
})

describe("Chat / template", () => {
  let store, container

  async function setup(chat = {}) {
    store = createStore({
      types: {
        Chat,
        Answer: {
          render: (entity) => html`<p class="answer">${entity.text}</p>`,
        },
      },
      entities: {
        chat: { type: "Chat", ...chat },
        answer1: { type: "Answer", text: "Rent is most of it." },
      },
    })
    container = document.createElement("div")
    document.body.append(container)
    await mount(store, (api) => api.render("chat"), container)
  }

  const textarea = () => container.querySelector("textarea")
  const press = (key, options = {}) =>
    textarea().dispatchEvent(
      new KeyboardEvent("keydown", { key, bubbles: true, ...options }),
    )
  const typeDraft = (text) => {
    textarea().value = text
    textarea().dispatchEvent(new Event("input", { bubbles: true }))
  }

  afterEach(() => container.remove())

  it("shows the conversation as a log, the user's messages as bubbles", async () => {
    await setup({
      messages: [
        { id: "m1", role: "user", content: "Where did my money go?" },
        { id: "m2", role: "assistant", entity: "answer1" },
      ],
    })

    expect(container.querySelector('[role="log"]')).not.toBeNull()
    expect(
      container.querySelector(".iw-chat-message-user").textContent,
    ).toContain("Where did my money go?")
    expect(
      container.querySelector(".iw-chat-message-assistant .answer").textContent,
    ).toBe("Rent is most of it.")
  })

  it("sends on Enter, and starts a new line on Shift+Enter", async () => {
    await setup()
    typeDraft("Hello")

    press("Enter", { shiftKey: true })
    expect(store.getState().chat.messages).toEqual([])

    press("Enter")
    expect(store.getState().chat.messages).toEqual([
      { id: "m1", role: "user", content: "Hello" },
    ])
    expect(textarea().value).toBe("")
  })

  it("offers suggestions while empty, sending the one picked", async () => {
    await setup({ suggestions: ["Show my food expenses"] })

    container.querySelector(".iw-chat-suggestions button").click()

    expect(store.getState().chat.messages[0].content).toBe(
      "Show my food expenses",
    )
    expect(container.querySelector(".iw-chat-suggestions")).toBeNull()
  })

  it("says a reply is coming, and does not send meanwhile", async () => {
    await setup({ isBusy: true, draft: "Next" })

    expect(
      container.querySelector('[role="status"]').getAttribute("aria-label"),
    ).toBe("Assistant is replying")
    expect(container.querySelector('button[type="submit"]').disabled).toBe(true)
  })

  describe("scrolling", () => {
    /* jsdom lays nothing out, so the log gets the sizes a browser would give it. */
    function layOut({ scrollHeight, clientHeight = 200, scrollTop = 0 }) {
      const log = container.querySelector('[role="log"]')
      Object.defineProperty(log, "scrollHeight", {
        configurable: true,
        value: scrollHeight,
      })
      Object.defineProperty(log, "clientHeight", {
        configurable: true,
        value: clientHeight,
      })
      Object.defineProperty(log, "scrollTop", {
        configurable: true,
        writable: true,
        value: scrollTop,
      })
      return log
    }

    it("follows each new message, not only the first render", async () => {
      await setup({ messages: [{ id: "m1", role: "user", content: "Hi" }] })
      const log = layOut({ scrollHeight: 500 })

      store.notify("#chat:messageAdd", { content: "Hello! How can I help?" })

      await vi.waitFor(() => expect(log.scrollTop).toBe(500))
    })

    it("stays where the user scrolled up to read", async () => {
      await setup({ messages: [{ id: "m1", role: "user", content: "Hi" }] })
      const log = layOut({ scrollHeight: 500, scrollTop: 100 })
      log.dispatchEvent(new Event("scroll"))

      store.notify("#chat:messageAdd", { content: "Hello! How can I help?" })
      await new Promise((resolve) => setTimeout(resolve))

      expect(log.scrollTop).toBe(100)
    })
  })

  it("shows why a reply failed", async () => {
    await setup({ error: "The model is offline" })

    expect(container.querySelector(".iw-alert-error").textContent).toContain(
      "The model is offline",
    )
  })
})
