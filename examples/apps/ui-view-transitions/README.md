# ui-view-transitions

A demo app showcasing `withTransitions` and the `view-transitions.css`
stylesheet from `@inglorious/ui`.

It renders a small set of pages through the `Router` from `@inglorious/web` and
lets you watch each navigation slide in the direction it travelled:

- **Forward** — a link or a push raises the history index, so the page arrives
  from the right and the page you left slides out to the left.
- **Back** — a traversal lowers the index, so the page arrives from the left.
- **Replace** — replacing the current entry keeps the index, so there is no
  direction to slide towards and the page cross-fades instead.
- **Reduced motion** — every animation sits behind
  `prefers-reduced-motion: no-preference`, so switching the preference on makes
  the same navigations instant.

## How it is wired

The store is wrapped once, where it is mounted:

```js
import { withTransitions } from "@inglorious/ui/view-transitions"
import "@inglorious/ui/view-transitions.css"

mount(withTransitions(store), app.render, document.getElementById("root"))
```

The wrapper replaces the store's `subscribe` so that the render which follows a
navigation runs inside a view transition, tagged with the direction. Nothing
else in the app knows transitions exist: the views navigate with ordinary
`<a href>` links and `api.notify("#router:navigate", …)`.

Direction is not guessed. The `Router` stamps an index into every history entry
as it navigates, and `withTransitions` compares that index across renders — a
raise is a push, a drop is a traversal, no change is a replacement.

To animate only some navigations, pass `routes`. A list of route names animates
every navigation into or out of one of them; the others change page instantly:

```js
// Slide into and out of detail pages; switch between top-level pages instantly.
withTransitions(store, { routes: ["eventDetail", "userDetail"] })
```

For anything a list can't express, pass a function instead. It receives the
direction read from the history and both sides of the navigation, each with its
`path`, `index` and the `route` the Router resolved, and returns whether to
animate:

```js
// Slide only when going deeper or coming back up, never sideways.
withTransitions(store, {
  routes: ({ from, to }) =>
    from.path.startsWith(to.path) || to.path.startsWith(from.path),
})
```

Quick start:

```bash
# from repository root
cd examples/apps/ui-view-transitions
pnpm install
pnpm dev
```

## Browser support

`document.startViewTransition` is Baseline across Chrome, Safari and Firefox. The
demo degrades rather than breaks: without the API the pages simply swap, and on
the older engines that have the API but not transition types, the browser falls
back to its own cross-fade.
