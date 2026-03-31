import { createStore } from "@inglorious/web"

import { LiveLogo } from "../components/live-logo"
import { LogoForm } from "../components/logo-form"
import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore({
  types: { LiveLogo, LogoForm },
  entities,
  middlewares,
})
