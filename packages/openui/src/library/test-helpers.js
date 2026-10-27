import { createStore } from "@inglorious/store"
import { mount } from "@inglorious/web"

import { createOpenUI } from "../index.js"
import { uiLibrary } from "./index.js"

/** Event loop turns to wait: one for the events, one for the render. */
const RENDER_PASSES = 2

export async function setup({
  response,
  onAction,
  library = uiLibrary,
  icons,
}) {
  const types = { OpenUI: createOpenUI({ library, icons }) }
  if (onAction) types.Chat = { openuiAction: (_, event) => onAction(event) }

  const store = createStore({
    types,
    entities: {
      answer: { type: "OpenUI", response },
      ...(onAction && { chat: { type: "Chat" } }),
    },
  })
  const container = document.createElement("div")
  document.body.append(container)
  mount(store, (api) => api.render("answer"), container)
  await flush()
  return { store, container }
}

export function type(input, text) {
  input.value = text
  input.dispatchEvent(new Event("input", { bubbles: true }))
}

export function choose(select, value) {
  select.value = value
  select.dispatchEvent(new Event("change", { bubbles: true }))
}

export function tick(checkbox) {
  checkbox.click()
}

/** Lets the store apply queued events and the view re-render. */
export async function flush() {
  for (let i = 0; i < RENDER_PASSES; i++) {
    await new Promise((resolve) => setTimeout(resolve))
  }
}

export function buttonNamed(container, name) {
  return [...container.querySelectorAll("button")].find(
    (button) => button.textContent.trim() === name,
  )
}
