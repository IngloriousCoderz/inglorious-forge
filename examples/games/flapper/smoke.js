import "./smoke-setup.js"

import { Engine } from "@inglorious/engine/core/engine.js"

import gameConfig from "./src/game.ijs"

const Y = 1

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
const press = () => {
  engine._store.notify("keyboardKeyDown", "Enter")
  engine._store.notify("keyboardKeyUp", "Enter")
  step(2)
}

step(4)

check(state().game.state === "title", "the game waits on the title screen")
check(state().title.value === "Inglorious Flapper", "which says what it is")
check(state().countdown.value === "", "and nothing else is said yet")

press()
check(state().game.state === "countdown", "pressing begins the countdown")
check(state().countdown.value !== "", "which is counted down")

// Nothing is flown here, so the bird falls, misses a pipe and the game ends: the states
// are checked as they pass rather than waited for.
const states = [state().game.state]

for (let i = 0; i < 400; i++) {
  step()

  if (states.at(-1) !== state().game.state) states.push(state().game.state)
}

check(states[0] === "countdown", "the countdown runs")
check(states.includes("play"), "and it runs into the play")
check(states.includes("score"), "an unplayed bird reaches the end of the game")

check(state().gameOver.value === "Oof! You lost!", "which says so")
check(state().gameOverScore.value !== "", "and shows what it came to")

if (failures === 0) {
  console.log("\nall checks passed")
} else {
  console.log(`\n${failures} FAILURES`)
  process.exit(1)
}
