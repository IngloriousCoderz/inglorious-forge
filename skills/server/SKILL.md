---
name: server
description: @inglorious/server, a WebSocket multiplayer server with an authoritative store, and the client multiplayer middleware.
---

# @inglorious/server

Node 26+. `pnpm start ./path/to/game.js` loads a game config (empty if omitted) into an authoritative store, ticking `store.update()` at 60 FPS.

Flow: client connects and gets `stateInit`; client events are dispatched on the server and broadcast to the other clients.

## Client middleware

```javascript
import { multiplayerMiddleware } from "@inglorious/store/client/multiplayer-middleware";

const store = createStore({
  types,
  entities,
  middlewares: [multiplayerMiddleware({ serverUrl: "ws://localhost:3000", blacklist: ["playerInput"] })],
});
```

| Option | Default | |
| --- | --- | --- |
| `serverUrl` | `ws://<hostname>:3000` | |
| `reconnectionDelay` | `1000` | ms |
| `blacklist` | `[]` | never sent |
| `whitelist` | `[]` | if non-empty, only these sent |
| `filter` | `null` | `(event) => boolean` |

- Filters combine with AND. Blacklist high-frequency local events.
- The socket opens on the first event that passes; earlier events queue.
- Server events carry `fromServer` and are not sent back. `stateInit` is merged into local state.
- Reconnects after `reconnectionDelay` on close or error.
- Payloads must be serializable.
