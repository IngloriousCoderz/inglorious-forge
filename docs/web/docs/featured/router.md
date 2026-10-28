---
title: Router Component
description: Client-side routing with dynamic routes, guards, and lazy loading
---

# Router

Client-side routing integrated directly into your store. Routes are entities with navigation state.

## Setup

```javascript
import { createStore } from "@inglorious/store"
import { Router, setRoutes } from "@inglorious/web/router"

const types = {
  Router,
  HomePage: { render: () => html`<h1>Home</h1>` },
  AboutPage: { render: () => html`<h1>About</h1>` },
  NotFoundPage: { render: () => html`<h1>404</h1>` },
}

const entities = {
  router: { type: "Router" },
  homePage: { type: "HomePage" },
  aboutPage: { type: "AboutPage" },
  notFoundPage: { type: "NotFoundPage" },
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

## Links

The router handles clicks on plain `<a href>` links to the same origin, so they navigate without reloading the page. It leaves a link to the browser when it has `target="_blank"`, `rel="external"`, `data-external` or `download`, or points to another protocol such as `mailto:`.

A link with `data-is-focus-kept` navigates with `state: { isFocusKept: true }`, which tells [accessible navigation](#accessible-navigation) to leave focus where it is.

## Accessible Navigation

A full page load tells screen readers that a new page has opened, and starts keyboard navigation from the top of it. A client-side navigation does neither on its own: the content changes silently, and focus stays on a link that may no longer exist. In an app with the `Router` type, `mount` restores both, with nothing to set up. After each navigation to a new path, once the new page has rendered:

- **The page is announced** through a visually hidden `aria-live` region: the document title, or the first `<h1>` when there is none, or the path.
- **Focus moves to the top of the document**, so the next Tab starts from the beginning of the new page. An element with `autofocus` on the new page gets the focus instead.

Changes to the query string alone are not navigations to a new page, so they are neither announced nor move focus.

Links that change part of the page rather than the whole of it, such as tabs or filters with their own URL, can keep focus where it is. The page is still announced:

```javascript
html`<a href="/products?view=grid" data-is-focus-kept>Grid</a>`

// Or from code
api.notify("navigate", {
  to: "/products?view=grid",
  state: { isFocusKept: true },
})
```

The state belongs to that history entry, so focus is also kept when the visitor comes back to it with the back and forward buttons.

If the page title is set later than the first render, for example from data fetched after navigating, pass `getPageName` to `mount`. It returns the name to announce, or `null` to be asked again after the next render. [SSX](../advanced/ssx.md) does this with the titles in page metadata:

```javascript
mount(store, renderApp, root, {
  getPageName: () => store.getEntity("post").title ?? null,
})
```

An app that handles all of this itself can turn it off with `hasAccessibleNavigation: false`.

## Dynamic Routes

```javascript
setRoutes({
  "/": "homePage",
  "/user/:id": "userPage",
  "/post/:id/edit": "editPostPage",
  "*": "notFoundPage",
})

// Access route params
const UserPage = {
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
  state: { isFocusKept: true }, // Stored in the history entry
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
  AdminPage: [AdminPageBase, requireAuth, requireAdmin],
  ProfilePage: [ProfilePageBase, requireAuth],
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
