import { createStore } from "@inglorious/web"
import { Router, setRoutes } from "@inglorious/web/router"

import { AdminPage } from "../views/admin"
import { Home } from "../views/home"
import { LoginPage } from "../views/login"
import { NotFound } from "../views/not-found"
import { PostList } from "../views/post-list"
import { requiresAuth } from "../views/requires-auth"
import { UserDetail } from "../views/user-detail"
import { UserList } from "../views/user-list"
import { entities } from "./entities"
import { middlewares } from "./middlewares"
import { routes } from "./routes"

setRoutes(routes)

export const store = createStore({
  types: {
    Router,
    Home,
    UserList,
    UserDetail,
    PostList,
    AdminPage: [AdminPage, requiresAuth],
    LoginPage,
    NotFound,
  },
  entities,
  middlewares,
  autoCreateEntities: true,
})
