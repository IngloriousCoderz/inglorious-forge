---
name: engine-best-practices
description: Testing Inglorious Engine games and renderers. Load when writing or fixing tests, or deciding what a game should do.
---

# Engine Best Practices: Testing

## Games

```javascript
import { createGame } from "@inglorious/engine/test";
import gameConfig from "../src/game.ijs";

let game;
beforeEach(() => {
  game = createGame(gameConfig);
});

test("begins the serve on a third press", () => {
  // given
  game.step(4);
  game.press("Enter");
  game.press("Enter");
  // when
  game.press("Enter");
  // then
  check(game.entity("game").state === "play", "a third press serves");
});
```

Game API: `entity(id)`, `state()`, `pooled(type?)`, `check(condition, description)`, `playedSounds`, `notify(event, ...args)`, `step(frames)`, `advance(seconds)`, `press(code)`, `hold(code, frames)`. Extra moves: `createGame(config, { dropTheBall() { ... return this.step(1) } })`.

- One game per test, made in `beforeEach`. Given/when/then.
- `advance(seconds)`, never `step(seconds * 60)`.
- Never touch `engine._store`.
- Assert the rule over all cases, not a sample.
- `expect(cond, "msg")` alone asserts nothing.
- Break a test on purpose to see it fail before trusting it.
- `createGame` turns off dev-mode freezing.

## Renderers

```javascript
import { callsTo, createContext } from "@inglorious/renderer-2d/test/canvas.js"

const { calls, ctx } = createContext()
renderCircle({ radius: 10 }, ctx)
const [, x, y, radius] = callsTo(calls, "arc")[0]
```

- Slot 0 of a recorded call is its name.
- `at()` maps a point through the transform stack.
- `calls.box` is only the last rect/image drawn.
- Test the recorder itself too.
- Defaults on destructured elements need a default on the container (`const [w = 100] = size = []`).
- Search `docs/` before calling a renderer unused.
- Zero offsets can be `-0`: use `toBeCloseTo`.
- Test arithmetic (where things land), not call sequences.
