import lucide from "@iconify-json/lucide/icons.json"
import { createOpenUI } from "@inglorious/openui"
import { createStore } from "@inglorious/store"

import { Chat } from "./chat.js"
import { library } from "./library.js"
import { toolProvider } from "./tools.js"

export const store = createStore({
  types: {
    Chat,
    OpenUI: createOpenUI({ library, toolProvider, icons: lucide }),
  },
  entities: { chat: { type: "Chat" } },
})
