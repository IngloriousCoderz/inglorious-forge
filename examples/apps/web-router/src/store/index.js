import "./routes"

import { createStore } from "@inglorious/web"
import { router } from "@inglorious/web/router"

import { adminPage } from "../views/admin"
import { home } from "../views/home"
import { loginPage } from "../views/login"
import { notFound } from "../views/not-found"
import { postList } from "../views/post-list"
import { requiresAuth } from "../views/requires-auth"
import { userDetail } from "../views/user-detail"
import { userList } from "../views/user-list"
import { entities } from "./entities"
import { middlewares } from "./middlewares"

export const store = createStore({
  types: {
    router,
    home,
    userList,
    userDetail,
    postList,
    adminPage: [adminPage, requiresAuth],
    loginPage,
    notFound,
  },
  entities,
  middlewares,
  autoCreateEntities: true,
})
