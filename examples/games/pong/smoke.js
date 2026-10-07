import "./smoke-setup.js"

import { Engine } from "@inglorious/engine/core/engine.js"

import gameConfig from "./src/game.ijs"

const X = 0
const Z = 2

let failures = 0

function check(condition, description) {
  if (condition) {
    console.log(`PASS ${description}`)
  } else {
    failures += 1
    console.log(`FAIL ${description}`)
  }
}

gameConfig.entities.game.devMode = false

const engine = new Engine(gameConfig)
const state = () => engine.getState()
const step = (frames = 1) => {
  for (let i = 0; i < frames; i++) engine.update(1 / 60)
}
const action = () => {
  engine._store.notify("keyboardKeyDown", "Space")
  engine._store.notify("keyboardKeyUp", "Space")
  step(2)
}

step(4)

check(state().game.state === "start", "the game waits to be started")
check(state().game.servingPlayer === "player1", "with player one to serve")
check(
  state().score.player1 === 0 && state().score.player2 === 0,
  "and no score",
)

action()
check(state().game.state === "serve", "space begins the serve")
check(
  state().message.value.includes("Player 1's serve"),
  "which says who is serving",
)

action()
check(state().game.state === "play", "space again puts it in play")
check(state().message.value === "", "and the message goes away")
check(state().game.paused === undefined, "nothing is paused")

// The ball travels, and goes towards whoever is not serving.
const servedFrom = state().ball.position[Z]
step(10)
check(state().ball.position[Z] !== servedFrom, "the ball moves")

// A wall reverses its heading. Nothing clamps the position: a ball is reflected while it
// is still inside, so being put back would never be needed.
state().game.state = "play"
const heading = state().ball.orientation
state().ball.position[Z] = -1
step(1)
check(state().ball.orientation !== heading, "a ball past a wall is turned back")
state().ball.position[Z] = 0

// A point, to the player who was not serving.
state().game.state = "play"
state().ball.position[X] = state().game.size[X] + 1
step(1)
check(
  state().score.player1 === 1,
  "a ball off the far side scores to player one",
)
check(state().game.state === "serve", "and the game serves again")
check(state().game.servingPlayer === "player2", "with the other player serving")

// Play to the end.
state().game.state = "play"
state().score.player1 = state().score.maxScore - 1
state().ball.position[X] = state().game.size[X] + 1
step(1)
check(
  state().game.state === "gameOver",
  "the game is over once the score is reached",
)

action()
check(state().game.state === "serve", "and space serves again")
check(state().score.player1 === 0, "with the score put back")

if (failures === 0) {
  console.log("\nall checks passed")
} else {
  console.log(`\n${failures} FAILURES`)
  process.exit(1)
}
