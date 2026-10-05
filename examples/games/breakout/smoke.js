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

// The ball plays sounds as it goes, so this asks whether the confirm happened rather
// than whether it was the last thing to happen.
const beforeConfirm = played.length
press("Enter")
check(state().game.state === "play", "Enter leaves the start screen")
check(
  played.slice(beforeConfirm).includes("confirm"),
  "Enter sounds the confirm",
)
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
check(state().game.paused === true, "space pauses")
check(state().paddle.position[0] === pausedAt, "a paused paddle does not move")
check(state().paused.value === "PAUSED", "PAUSED is shown while paused")

press("Space")
check(state().game.state === "play", "space resumes")
check(state().paused.value === "", "and PAUSED goes away")
// The original plays its pause sound both pausing and resuming.
check(played.at(-1) === "pause", "resuming sounds the pause again")

// The ball gets a game of its own, so that it is served fresh rather than wherever the
// checks above left it.
const ballEngine = new Engine(gameConfig)
const ballState = () => ballEngine.getState()
const ballStep = (frames = 1) => {
  for (let i = 0; i < frames; i++) ballEngine.update(1 / 60)
}
const ballNotify = ballEngine._store.notify.bind(ballEngine)
const ballSounds = []
const ballAudio = ballEngine._store.getType("Audio")
const playBallSound = ballAudio.soundPlay
ballAudio.soundPlay = function sound(entity, name) {
  ballSounds.push(name)
  return playBallSound.call(this, entity, name)
}

ballStep(4)
check(ballState().ball === undefined, "the title screen has no ball either")

const bricksBefore = Object.keys(ballState()).filter((id) =>
  id.startsWith("brick"),
)
check(bricksBefore.length === 0, "and no bricks either")

ballNotify("keyboardKeyDown", "Enter")
ballNotify("keyboardKeyUp", "Enter")
// One update is needed to process the key, and the ball is served inside it but not
// moved until the next, so this is the serve itself.
ballStep(1)

const servedBall = ballState().ball
const [tileWidth, tileHeight] = servedBall.image.tileSize
const from = `${servedBall.sx * tileWidth},${servedBall.sy * tileHeight}`

// The ball is cropped from the sheet at the pixel the original's quad table puts it,
// which is not the same as the skin's number: that table starts at one.
check(from === "96,48", `the ball is cropped from (96, 48) (${from})`)
check(
  servedBall.image.frameSize.join() === "8,8",
  `and is 8x8 (${servedBall.image.frameSize.join("x")})`,
)

// The level, laid out the way the original lays it out: rows and columns both at random,
// bricks 32 wide and touching, padded by 8 plus half a brick for each missing column.
const brickList = Object.values(ballState()).filter(
  ({ type }) => type === "Brick",
)
const columns = new Set(brickList.map(({ position }) => position[0])).size
const rows = new Set(brickList.map(({ position }) => position[1])).size

check(rows >= 1 && rows <= 5, `the level has between 1 and 5 rows (${rows})`)
check(
  columns >= 7 && columns <= 13,
  `and between 7 and 13 columns (${columns})`,
)
check(
  brickList.length === rows * columns,
  `holding one brick per cell (${brickList.length})`,
)
check(
  brickList.every(({ size }) => size[0] === 32 && size[1] === 16),
  "each 32x16",
)
// Touching, so the columns are one brick width apart.
const xs = [...new Set(brickList.map(({ position }) => position[0]))].sort(
  (a, b) => a - b,
)
check(
  xs.every((x, i) => i === 0 || x - xs[i - 1] === 32),
  `laid out touching (${xs.join(", ")})`,
)
// Padded by 8 plus half a brick for each of the columns it is short of.
check(
  xs[0] === 8 + (13 - columns) * 16,
  `and padded for the missing columns (${xs[0]})`,
)
// Hanging from the ceiling, which is where the original starts them.
const ys = [...new Set(brickList.map(({ position }) => position[1]))].sort(
  (a, b) => b - a,
)
check(
  ys[0] === 227 && ys[ys.length - 1] === 243 - rows * 16,
  `from just under the ceiling down (${ys.join(", ")})`,
)

// The serve, straight from PlayState:init.
const served = ballState().ball
check(
  served.position[0] === 212,
  `served from the middle (${served.position[0]})`,
)
check(
  served.position[1] === 42,
  `and 42 above the floor (${served.position[1]})`,
)
check(Math.abs(served.velocity[0]) <= 200, "served sideways within 200")
check(
  served.velocity[1] >= 50 && served.velocity[1] <= 60,
  `and upwards between 50 and 60 (${served.velocity[1]})`,
)

// It climbs until it meets the ceiling, which is the one wall that is not at an
// altitude of zero in this world.
let climbed = 0
while (ballState().ball.velocity[1] > 0 && climbed < 400) {
  ballStep(1)
  climbed++
}
check(
  ballState().ball.position[1] === 243,
  `it stops flush with the ceiling (${ballState().ball.position[1]})`,
)
check(ballState().ball.velocity[1] < 0, "and comes back down")
check(ballSounds.includes("wallHit"), "having sounded the wall hit")

// A wall flips only the axis that ran into it, so the sideways speed survives it.
ballStep(600)
const inFlight = ballState().ball
check(
  inFlight.position[0] >= 0 && inFlight.position[0] <= 424,
  `it stays between the walls (${inFlight.position[0]})`,
)
check(Math.abs(inFlight.velocity[0]) <= 200, "and keeps its sideways speed")

// A halted world stops it, which is the whole point of not asking.
ballNotify("keyboardKeyDown", "Space")
ballNotify("keyboardKeyUp", "Space")
ballStep(2)
check(ballState().game.paused === true, "it can be paused")
const running = ballState().ball.position[1]
ballStep(60)
check(
  ballState().ball.position[1] === running,
  "and does not move while paused",
)
ballNotify("keyboardKeyDown", "Space")
ballNotify("keyboardKeyUp", "Space")
ballStep(2)

// Coming down onto the paddle flips the vertical axis and nothing else. Rather than
// wait for a serve to wander onto it, the ball is put straight above the paddle and
// sent down, which is the one case the original's rule covers here.
ballState().ball.position[0] = ballState().paddle.position[0]
ballState().ball.position[1] = 33
ballState().ball.velocity = [0, -50, 0]

// The ball is left sitting in the paddle rather than pushed out of it, because the
// original does not separate them either, so it flips on every frame it is inside. What
// matters is that it flipped at all.
const beforeHit = ballSounds.length
const sidewaysBefore = ballState().ball.velocity[0]
const signs = new Set()
for (let i = 0; i < 6; i++) {
  ballStep(1)
  signs.add(Math.sign(ballState().ball.velocity[1]))
}

check(signs.has(1), "the paddle sends it back up")
check(
  ballState().ball.velocity[0] === sidewaysBefore,
  "and flips nothing but the vertical axis",
)
check(
  ballSounds.slice(beforeHit).includes("paddleHit"),
  "having sounded the paddle hit",
)

console.log(
  `\n${failures === 0 ? "all checks passed" : `${failures} check(s) failed`}`,
)
if (failures) process.exitCode = 1

// Driving the ball into a brick knocks it out without bouncing, which is what the
// original does at this stage: the brick goes and the ball carries on.
const target = Object.entries(ballState()).find(
  ([, { type }]) => type === "Brick",
)
const [targetId] = target
const beforeBricks = Object.values(ballState()).filter(
  ({ type }) => type === "Brick",
).length

ballState().ball.position = [...target[1].position]
ballState().ball.velocity = [0, -40, 0]

const beforeBrickHit = ballSounds.length
ballStep(2)

check(
  ballState()[targetId] === undefined,
  "the ball knocks the brick out of the level",
)
check(
  Object.values(ballState()).filter(({ type }) => type === "Brick").length ===
    beforeBricks - 1,
  "and the level is one brick shorter",
)
check(
  ballSounds.slice(beforeBrickHit).includes("brickHit"),
  "having sounded the brick hit",
)
check(
  ballState().ball.velocity[1] < 0,
  `and carried straight on (${ballState().ball.velocity[1]})`,
)

console.log(
  `\n${failures === 0 ? "all checks passed" : `${failures} check(s) failed`}`,
)
if (failures) process.exitCode = 1
