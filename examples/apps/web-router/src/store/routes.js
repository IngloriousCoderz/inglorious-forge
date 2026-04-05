export const routes = {
  "/": "home",
  "/users": "userList",
  "/users/:userId": "userDetail",
  "/users/:userId/posts": "postList",
  "/posts": "postList",
  "/lazy-type": () => import("../views/lazy-type"),
  "/lazy-entity": () => import("../views/lazy-entity"),
  "/lazy-data": () => import("../views/lazy-data"),
  "/admin": "adminPage",
  "/login": "loginPage",
  "*": "notFound",
}
