import { createOpenUI, uiLibrary } from "@inglorious/openui"
import { createStore } from "@inglorious/store"

import { Chat } from "./chat.js"

export const store = createStore({
  types: { Chat, OpenUI: createOpenUI({ library: uiLibrary }) },
  entities: { chat: { type: "Chat" } },
})
