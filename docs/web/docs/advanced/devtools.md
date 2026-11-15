---
title: Redux DevTools
description: Every event and every state in the Redux DevTools extension
---

# Redux DevTools

Inglorious Store speaks the Redux DevTools protocol: every event appears in the extension's timeline with the state it led to, and the state can be inspected, exported and jumped back to.

## Setup

Install the extension for [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmjabgkhjhnbefga30thljilipkdlnad), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/) or [Edge](https://microsoftedge.microsoft.com/addons/detail/redux-devtools/nnkgneoiohoecpdi40ohlemmapaheknm), and add the middleware in development:

```javascript
import { createStore } from "@inglorious/store"
import { createDevtools } from "@inglorious/store/client/devtools"

const middlewares = import.meta.env.DEV ? [createDevtools().middleware] : []

const store = createStore({ types, entities, middlewares })
```

## What you see

Each event, with its type and payload, and the whole state after it. Clicking an earlier event puts the app back in that state; `Reset` puts the initial entities back, `Commit` makes the current state the new start, and an exported history can be imported elsewhere to replay a session. Events can also be dispatched from the extension, as `{ type, payload }`.

## Options

```javascript
createDevtools({
  name: "My App", // the instance's name, by default the document title
  blacklist: ["update", "mouseMove"], // events never shown
  whitelist: ["#user:signIn"], // the only events shown, when given
  filter: (event) => event.payload?.userId === currentUserId, // a last say
})
```

The three filters combine. A store in `updateMode: "manual"`, such as a game's, sends nothing per event; [Inglorious Engine](https://inglorious.dev/engine/) sends one action per frame instead.
