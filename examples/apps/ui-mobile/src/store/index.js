import { createStore } from "@inglorious/store"
import { Router, setRoutes } from "@inglorious/web/router"

import { HapticsPage } from "../views/haptics-page.js"
import { Inbox } from "../views/inbox.js"
import { Message } from "../views/message.js"
import { NotFound } from "../views/not-found.js"
import { Notice } from "../views/notice.js"
import { Settings } from "../views/settings.js"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"
import { routes } from "./routes.js"

setRoutes(routes)

export const store = createStore({
  types: { Router, Inbox, Message, HapticsPage, Settings, Notice, NotFound },
  entities,
  middlewares,
})
