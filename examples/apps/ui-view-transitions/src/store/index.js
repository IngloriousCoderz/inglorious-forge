import { createStore } from "@inglorious/store"
import { Router, setRoutes } from "@inglorious/web/router"

import { ArticleDetail } from "../views/article-detail.js"
import { ArticleList } from "../views/article-list.js"
import { Home } from "../views/home.js"
import { NotFound } from "../views/not-found.js"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"
import { routes } from "./routes.js"

setRoutes(routes)

export const store = createStore({
  types: {
    Router,
    Home,
    ArticleList,
    ArticleDetail,
    NotFound,
  },
  entities,
  middlewares,
  autoCreateEntities: true,
})
