# my-game

A game made with the [Inglorious Engine](https://inglorious-engine.vercel.app/), scaffolded by [@inglorious/create-game](https://www.npmjs.com/package/@inglorious/create-game). There is no build step: `index.html` loads the engine from a CDN through an import map.

It starts as a small, complete game: collect coins before the time runs out. Every coin is worth as many points as your level, and every 5 points takes you up a level. Move with the arrow keys, WASD, a gamepad or a finger; press Space, the gamepad's A button or tap to play again.

## Getting started

Browsers only load modules over HTTP, so serve the folder rather than opening `index.html` as a file:

```sh
npx serve
```

Then edit `src/game.js` and reload the page.

## How it works

- `src/game.js` is the whole game: `types` say how each kind of thing behaves, `entities` are the things in the game.
- A type is a set of event handlers. `update` runs every frame with the seconds since the last one; any other name answers an event sent with `api.notify(name, payload)`, like `coinCollect`.
- Types compose: the player is its own handlers plus `modernControls()` (moves with the input) and `clamped()` (stays on screen).
- `createControlEntities` maps keys, gamepad buttons and taps to the event names the types listen for.

For tests, TypeScript, vector math or a mobile app, scaffold a project with a build step: `pnpm create @inglorious/game`.

## Learn more

- [Engine documentation](https://inglorious-engine.vercel.app/)
- [Example games](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/examples/games)
