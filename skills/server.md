# @inglorious/server - Complete Reference

## Installation

```bash
pnpm install
```

## Core Concept

Real-time, WebSocket-based server for multiplayer games using @inglorious/store as the authoritative state.

## Running

```bash
pnpm dev
pnpm start
```

### Load a Game Module

```bash
pnpm start ./path/to/your-game.js
```

If no path is provided, the server starts with an empty game config.

## How It Works

- Creates a store from the game config.
- Starts a fixed 60 Hz loop to process events and advance state.
- Broadcasts client events to all connected clients.
- Sends `stateInit` to new clients on connect.

## File Layout

- `src/index.js` — bootstraps HTTP + WebSocket server
- `src/game-loader.js` — loads game config module
- `src/game-loop.js` — server-side tick loop
- `src/ws-handler.js` — WebSocket wiring and broadcast

## Data Flow

1. Client connects → receives `stateInit`.
2. Client sends an event `{ type, payload }`.
3. Server dispatches it into the store.
4. Server broadcasts the same event to other clients.
5. Game loop ticks at 60 FPS and calls `store.update()`.

## Notes

- Requires Node 22+.
- Uses `ws` for WebSockets and `pino` for logging.
