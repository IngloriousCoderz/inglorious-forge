---
title: Router Component
description: Client-side routing with dynamic routes, guards, and lazy loading
---

# Router

Client-side routing integrated directly into your store. Routes are entities with navigation state.

## Setup

```javascript
import { createStore } from "@inglorious/web"
import { router, setRoutes } from "@inglorious/web/router"

const types = {
  router,
  homePage: { render: () => html`<h1>Home</h1>` },
  aboutPage: { render: () => html`<h1>About</h1>` },
  notFoundPage: { render: () => html`<h1>404</h1>` },
}

const entities = {
  router: { type: "router" },
  homePage: { type: "homePage" },
  aboutPage: { type: "aboutPage" },
  notFoundPage: { type: "notFoundPage" },
}

const store = createStore({ types, entities })

// Register routes
setRoutes({
  "/": "homePage",
  "/about": "aboutPage",
  "*": "notFoundPage",
})
```

## Rendering Routes

```javascript
const renderApp = (api) => {
  const { route } = api.getEntity("router")

  return html`
    <nav><a href="/">Home</a> | <a href="/about">About</a></nav>
    <main>${route ? api.render(route) : ""}</main>
  `
}

mount(store, renderApp, document.getElementById("root"))
```

## Dynamic Routes

```javascript
setRoutes({
  "/": "homePage",
  "/user/:id": "userPage",
  "/post/:id/edit": "editPostPage",
  "*": "notFoundPage",
})

// Access route params
const userPage = {
  render(entity, api) {
    const { params } = api.getEntity("router")
    return html`<h1>User ${params.id}</h1>`
  },
}
```

## Programmatic Navigation

```javascript
// Navigate to a route
api.notify("navigate", "/about")

// With options
api.notify("navigate", {
  to: "/user/123",
  replace: true, // Replace instead of push
  force: true, // Force even if path is the same
})

// Navigate back
api.notify("navigate", -1)
```

## Route Guards

Use type composition for authentication and authorization:

```javascript
const requireAuth = (type) => ({
  routeChange(entity, payload, api) {
    const user = api.getEntity("user")

    if (!user.isLoggedIn) {
      api.notify("navigate", "/login")
      return
    }

    type.routeChange?.(entity, payload, api)
  },
})

const requireAdmin = (type) => ({
  routeChange(entity, payload, api) {
    const user = api.getEntity("user")

    if (user.role !== "admin") {
      api.notify("navigate", "/unauthorized")
      return
    }

    type.routeChange?.(entity, payload, api)
  },
})

// Protect routes
const types = {
  adminPage: [adminPageBase, requireAuth, requireAdmin],
  profilePage: [profilePageBase, requireAuth],
}
```

## Lazy Loading Routes

```javascript
setRoutes({
  "/": "homePage",
  "/admin": () => import("./pages/admin.js"), // Lazy load
  "*": "notFoundPage",
})
```

**[Full Router Documentation](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/packages/web#client-side-router)**
