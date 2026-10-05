import "./smoke-setup.js"
import { Engine } from "@inglorious/engine/core/engine.js"
import gameConfig from "./src/game.ijs"

gameConfig.entities.game.devMode = false
const engine = new Engine(gameConfig)
const state = () => engine.getState()
const step = (n = 1) => {
  for (let i = 0; i < n; i++) engine.update(1 / 60)
}
const press = (code) => {
  engine._store.notify("keyboardKeyDown", code)
  engine._store.notify("keyboardKeyUp", code)
  step(2)
}
let failures = 0
const check = (ok, l) => {
  if (!ok) failures++
  console.log(`${ok ? "PASS" : "FAIL"} ${l}`)
}

step(4)
check(state().game.menuItem === "start", "the menu starts on START")
check(state().title.value === "BREAKOUT", "the title reads BREAKOUT")
check(state().title.size === 32, "the title is the large font")
check(state().start.value === "START", "the first item reads START")
check(state().start.size === 16, "menu items use the medium font")
check(
  state().start.color === "rgb(103, 255, 255)",
  "START is picked out to begin with",
)
check(state().highScores.color === "white", "HIGH SCORES is not")
press("ArrowDown")
step(4)
check(state().game.menuItem === "high-scores", "down moves to HIGH SCORES")
check(state().highScores.color === "rgb(103, 255, 255)", "the pick-out follows")
check(state().start.color === "white", "and leaves the other one")
// The paddle belongs to a game in progress, so the title screen must not show one
// sitting on the floor behind the menu.
check(state().paddle === undefined, "the title screen has no paddle yet")
press("ArrowUp")
check(state().game.menuItem === "start", "up moves back to START")
press("ArrowUp")
check(state().game.menuItem === "high-scores", "the menu wraps upwards")
press("ArrowDown")
check(state().game.menuItem === "start", "and downwards")
// The file is 302x129 but its last row and column are transparent, so the artwork
// is 301x128 and has to be both sized and scaled as such or the dead edge is
// stretched across the screen.
check(
  state().background.image.imageSize.join() === "301,128",
  "the backdrop is drawn at its artwork size",
)
check(state().background.anchor.join() === "0,0", "anchored at the bottom left")
const scale = state().background.image.scale
check(scale[0] > 1 && scale[1] > 1, "the backdrop is stretched to fill")
// Stretched from 301x128 onto 432x243, it has to cover the screen exactly or a
// strip of the clear colour shows along an edge.
check(
  Math.abs(301 * scale[0] - 432) < 1e-6 &&
    Math.abs(128 * scale[1] - 243) < 1e-6,
  "and covers the screen with no gap",
)

// The altitudes are the original's y-down positions turned the right way up.
check(
  state().title.position[1] > state().start.position[1],
  "the title sits above the menu",
)
check(
  state().start.position[1] > state().highScores.position[1],
  "START sits above HIGH SCORES",
)

// renderText is left-aligned and sans-serif by default, so both have to be set.
check(state().title.textAlign === "center", "text is centred horizontally")
check(state().title.font === "'Breakout'", "text uses the loaded font")
check(state().title.position[0] === 216, "text is centred on the screen")
console.log(
  `\n${failures === 0 ? "all checks passed" : `${failures} check(s) failed`}`,
)
if (failures) process.exitCode = 1

press("Enter")
check(state().game.state === "play", "Enter leaves the start screen")
check(state().paddle !== undefined, "and the paddle arrives with it")
check(state().paddle.position[0] === 184, "the paddle starts centred")
check(state().paddle.position[1] === 16, "and floats above the floor")

const hold = (code, frames = 30) => {
  engine._store.notify("keyboardKeyDown", code)
  step(frames)
  engine._store.notify("keyboardKeyUp", code)
  step(2)
}

const before = state().paddle.position[0]
hold("ArrowRight")
const movedRight = state().paddle.position[0]
check(
  movedRight > before,
  `the right arrow moves the paddle (${before} to ${movedRight})`,
)

hold("ArrowLeft", 60)
const movedLeft = state().paddle.position[0]
check(
  movedLeft < movedRight,
  `the left arrow moves it back (${movedRight} to ${movedLeft})`,
)

engine._store.notify("keyboardKeyDown", "ArrowRight")
const held = state().paddle.position[0]
step(30)
check(
  state().paddle.position[0] > held,
  "it keeps moving while the key is held",
)
engine._store.notify("keyboardKeyUp", "ArrowRight")

engine._store.notify("keyboardKeyDown", "ArrowRight")
step(400)
engine._store.notify("keyboardKeyUp", "ArrowRight")
step(2)
check(state().paddle.position[0] === 368, "the paddle stops at the right edge")

engine._store.notify("keyboardKeyDown", "ArrowLeft")
step(400)
engine._store.notify("keyboardKeyUp", "ArrowLeft")
step(2)
check(state().paddle.position[0] === 0, "and at the left edge")

engine._store.notify("keyboardKeyDown", "ArrowRight")
step(10)
press("Space")
engine._store.notify("keyboardKeyUp", "ArrowRight")
const pausedAt = state().paddle.position[0]
step(30)
check(state().game.state === "paused", "space pauses")
check(state().paddle.position[0] === pausedAt, "a paused paddle does not move")
check(state().paused.value === "PAUSED", "PAUSED is shown while paused")

press("Space")
check(state().game.state === "play", "space resumes")
check(state().paused.value === "", "and PAUSED goes away")

console.log(
  `\n${failures === 0 ? "all checks passed" : `${failures} check(s) failed`}`,
)
if (failures) process.exitCode = 1
