import lucide from "@iconify-json/lucide/icons.json"
import { createOpenUI } from "@inglorious/openui"
import { createStore } from "@inglorious/store"
import { Chat } from "@inglorious/ui/chat"

import { withAssistant } from "./chat.js"
import { library } from "./library.js"
import { toolProvider } from "./tools.js"

export const store = createStore({
  types: {
    Chat: [Chat, withAssistant],
    OpenUI: createOpenUI({ library, toolProvider, icons: lucide }),
  },
  entities: {
    chat: {
      type: "Chat",
      label: "Budget assistant",
      placeholder: "Ask about your expenses",
      suggestions: [
        "Where did my money go this month?",
        "Show my food expenses",
        "I want to add an expense",
        "Compare three laptops for programming",
      ],
    },
  },
})
