import "./smoke-setup.js"
import { Engine } from "@inglorious/engine/core/engine.js"
import gameConfig from "./src/game.ijs"

gameConfig.entities.game.devMode = false
const engine = new Engine(gameConfig)
const state = () => engine.getState()
const step = (n = 1) => {
  for (let i = 0; i < n; i++) engine.update(1 / 60)
}
// Sounds are watched at the point they are handled rather than at the point they are
// asked for, so this records what the game actually reached for. Recording the
// request instead would not catch a sound wired to the wrong state.
const played = []
const audioType = engine._store.getType("Audio")
const playSound = audioType.soundPlay
audioType.soundPlay = function sound(entity, name) {
  played.push(name)
  return playSound.call(this, entity, name)
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
check(
  state().background.image.imageSize.join() === "302,129",
  "the backdrop is drawn at its native size",
)
check(state().background.anchor.join() === "0,0", "anchored at the bottom left")
const scale = state().background.image.scale
check(scale[0] > 1 && scale[1] > 1, "the backdrop is stretched to fill")
// The original scales by one pixel less than the image on purpose, so this
// overshoots the screen slightly rather than landing exactly on it.
check(
  scale[0] === 432 / 301 && scale[1] === 243 / 128,
  "and is scaled by the original's one-pixel-short factor",
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
check(played.at(-1) === "confirm", "Enter sounds the confirm")
check(state().paddle !== undefined, "and the paddle arrives with it")
check(state().paddle.position[0] === 184, "the paddle starts centred")
// The original puts the paddle's centre at VIRTUAL_HEIGHT - 32, an altitude of 32.
check(state().paddle.position[1] === 32, "and floats a paddle's height clear")
// In the original the menu is drawn by the start state, so leaving it takes the menu
// away. Here the game adds and removes the entities instead, so they are gone from
// the store rather than sitting in it with nothing to say.
check(state().title === undefined, "the title leaves with the menu")
check(state().start === undefined, "and so does START")
check(state().highScores === undefined, "and HIGH SCORES")

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
check(state().paused === undefined, "and PAUSED goes away with the pause")
// The original plays its pause sound both pausing and resuming.
check(played.at(-1) === "pause", "resuming sounds the pause again")

console.log(
  `\n${failures === 0 ? "all checks passed" : `${failures} check(s) failed`}`,
)
if (failures) process.exitCode = 1
