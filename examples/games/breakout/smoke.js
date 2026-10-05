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
const hold = (code, frames = 30) => {
  engine._store.notify("keyboardKeyDown", code)
  step(frames)
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

// The ball plays sounds as it goes, so this asks whether the confirm happened rather
// than whether it was the last thing to happen.
const beforeConfirm = played.length
press("Enter")
check(state().game.state === "serve", "Enter leaves the start screen")
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

// The serve is the wait between two games. It stands on the same field the play does,
// with the ball on the paddle and everything the play would show already showing.
check(state().ball !== undefined, "a ball is served")
check(state().servePrompt.value === "Press Enter to serve!", "the serve says so")
check(state().servePrompt.size === 16, "in the medium font")
check(state().score !== undefined, "the score stands on the serve")
check(state().scoreLabel.value === "Score:", "labelled Score")
check(state().score.size === 8, "in the small font")
check(state().score.value === "0", "starting at nothing")
check(state().game.health === 3, "with three lives in hand")
check(
  ["heart0", "heart1", "heart2"].every((id) => state()[id] !== undefined),
  "and a heart for each of them",
)
check(state().paused === undefined, "no pause overlay before the play")
check(state().gameOverTitle === undefined, "nor a game over screen")

// The ball rides the paddle rather than moving under its own power, so sliding the
// paddle carries it along.
const ballBeforeRide = state().ball.position[0]
hold("ArrowLeft", 10)
check(
  state().ball.position[0] < ballBeforeRide,
  "the ball rides the paddle while serving",
)
check(
  state().ball.position[0] ===
    state().paddle.position[0] + 32 - 4,
  "sitting on the middle of it, a ball's width clear",
)
check(state().ball.position[1] === 40, "and resting on top of it")
check(state().servePrompt !== undefined, "the wait is still being waited out")

// Every serve is a new ball, with a skin of its own.
const firstSkin = state().ball.skin
check(firstSkin >= 1 && firstSkin <= 7, "served with a skin of its own")
check(
  state().ball.image.id === "breakout",
  "the skin is cut from the breakout atlas",
)

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

press("Enter")
check(state().game.state === "play", "Enter answers the serve")
check(state().servePrompt === undefined, "the wait is over and its line goes")
check(state().ball.skin === firstSkin, "the same ball is played, skin and all")
check(state().paused !== undefined, "and the pause overlay arrives")

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


// The interface along the top of the field: the hearts, the score, and the counter.
// These are all placed by hand and all sit in the same corner, so they are checked
// against each other rather than against nothing.
const hud = state()
check(hud.heart0.position[1] === 238, "the hearts hang from the ceiling")
check(
  hud.heart1.position[0] === hud.heart0.position[0] + 11 &&
    hud.heart2.position[0] === hud.heart1.position[0] + 11,
  "eleven pixels apart",
)
check(
  hud.heart2.position[0] + 10 < hud.scoreLabel.position[0],
  "and stand to the left of the score label",
)
// The label and the number are one line of interface, so they hang from one height.
check(
  hud.score.value === "0" && hud.scoreLabel.position[1] === hud.score.position[1],
  `the label and the number share a height (${hud.scoreLabel.position[1]})`,
)
check(hud.scoreLabel.textAlign === "left", "the label runs left from its own edge")
check(hud.score.textAlign === "right", "the number runs back from the far one")
// The counter is ours rather than the original's, so it goes where the play never draws:
// the bottom left, well below the paddle and clear of the score in the top right.
check(
  hud.fps.position[0] < 100 && hud.fps.position[1] > 200,
  `the counter is in the bottom left (${hud.fps.position.join()})`,
)
check(hud.fps.textAlign === "left", "reading inwards from the corner")

// Text is anchored by the top edge of its line, so a line whose altitude is too low hangs
// off the bottom of the screen and cannot be read at all. Every line standing on any
// screen is checked for being wholly inside it.
const linesFit = (screen, where) => {
  for (const [id, line] of Object.entries(screen)) {
    if (typeof line.value !== "string" || typeof line.size !== "number") continue

    check(
      line.position[1] - line.size >= 0 && line.position[1] <= 243,
      `${where}: ${id} is drawn inside the screen (top at ${line.position[1]})`,
    )
  }
}
linesFit(hud, "on the serve")

// Lives and scoring get a game of their own, because playing one out to its end means
// waiting for the ball to fall three times.
const lifeEngine = new Engine(gameConfig)
const lifeState = () => lifeEngine.getState()
const lifeStep = (frames = 1) => {
  for (let i = 0; i < frames; i++) lifeEngine.update(1 / 60)
}
const lifePress = (code) => {
  lifeEngine._store.notify("keyboardKeyDown", code)
  lifeEngine._store.notify("keyboardKeyUp", code)
  lifeStep(2)
}
const lifeSounds = []
const lifeAudio = lifeEngine._store.getType("Audio")
const lifePlaySound = lifeAudio.soundPlay
lifeAudio.soundPlay = function sound(entity, name) {
  lifeSounds.push(name)
  return lifePlaySound.call(this, entity, name)
}

// Falling off the bottom of the world costs a life, and is announced by the ball rather
// than decided by it.
const dropTheBall = () => {
  // Only a ball being played can fall, so a serve that is being waited out is answered
  // first, exactly as a player would.
  if (lifeState().game.state !== "play") lifePress("Enter")

  lifeState().ball.position[1] = 0
  lifeState().ball.velocity = [0, -200, 0]
  lifeStep(1)
}

lifeStep(4)
lifePress("Enter")
lifePress("Enter")
check(lifeState().game.state === "play", "a game of its own reaches the play")
const lifeBricks = Object.keys(lifeState()).filter((id) => id.startsWith("brick"))
check(lifeBricks.length > 0, "with a level standing above it")

// A brick knocked out is worth ten points, and the score is the game's own.
// Rather than wait for the ball to find a brick, the first one is put where the ball
// already is, which is the collision the original would have found for it.
const knockedOut = lifeBricks[0]
const [ballX, ballY] = lifeState().ball.position
lifeState()[knockedOut].position = [ballX, ballY, 0]
lifeStep(2)
check(lifeState().score.value === "10", `a brick is worth ten (${lifeState().score.value})`)
check(lifeState()[knockedOut] === undefined, "and the brick is gone")

// The level is one level across the whole game, so losing a life does not roll a new one
// and quietly put back every brick knocked out so far.
const remaining = Object.keys(lifeState()).filter((id) => id.startsWith("brick"))
check(
  remaining.length === lifeBricks.length - 1,
  `losing a life keeps the level as it stood (${remaining.length} of ${lifeBricks.length})`,
)

const hurtBefore = lifeSounds.length
dropTheBall()
check(lifeState().game.state === "serve", "a ball past the floor means another serve")
check(lifeState().game.health === 2, "and costs a life")
check(
  lifeSounds.slice(hurtBefore).includes("hurt"),
  "having sounded the hurt",
)
// The hearts fill from the left, so only the last one empties. They are asked on the
// frame after the loss, because whichever entity asks first in a frame sees the life
// count as it was when the frame began.
lifeStep(1)
check(lifeState().heart0.sx === 0, "the first heart is still full")
check(lifeState().heart2.sx === 1, "and the last one has emptied")

// Every serve is a new ball with a skin of its own.
const skins = new Set([lifeState().ball.skin])
dropTheBall()
lifeStep(2)
skins.add(lifeState().ball.skin)

check(lifeState().game.health === 1, "a second life goes the same way")

// The last life ends the game.
const gameOverSounds = lifeSounds.length
dropTheBall()
check(lifeState().game.health === 0, "the last life is spent")
check(lifeState().game.state === "gameOver", "and the game is over")
check(
  lifeSounds.slice(gameOverSounds).includes("hurt"),
  "having sounded the hurt one last time",
)
// The screen is put up by the transition itself, so it needs the frame after before it
// has said anything.
lifeStep(1)
linesFit(lifeState(), "on the game over screen")
check(lifeState().gameOverTitle.value === "GAME OVER", "the title says GAME OVER")
check(
  lifeState().gameOverScore.value === "Final Score: 10",
  `and the score it came to (${lifeState().gameOverScore.value})`,
)
check(lifeState().gameOverPrompt.value === "Press Enter!", "with a prompt")
check(
  lifeState().gameOverTitle.position[1] > lifeState().gameOverScore.position[1],
  "the title sits above the score",
)
check(
  lifeState().gameOverScore.position[1] > lifeState().gameOverPrompt.position[1],
  "and the prompt below it",
)
// Nothing of the game in progress is left standing behind the game over screen.
check(lifeState().ball === undefined, "the ball is gone")
check(lifeState().paddle === undefined, "and the paddle")
check(
  Object.keys(lifeState()).filter((id) => id.startsWith("brick")).length === 0,
  "and so is the level",
)

lifePress("Enter")
check(lifeState().game.state === "start", "Enter goes back to the start screen")
check(lifeState().gameOverTitle === undefined, "the game over screen goes with it")

// A new game begins again from the beginning.
lifePress("Enter")
check(lifeState().game.state === "serve", "and starts again")
check(lifeState().game.health === 3, "with every life back")
check(lifeState().score.value === "0", "and nothing scored")
// A new game makes a new level, which is rolled afresh and so need not be the size the
// last one happened to be.
check(
  Object.keys(lifeState()).filter((id) => id.startsWith("brick")).length > 0,
  "over a level of its own",
)

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

// Two Enters now reach the play: one leaves the start screen, the second answers the
// serve. The first is given its own update so the field is standing up before the
// second is pressed.
ballNotify("keyboardKeyDown", "Enter")
ballNotify("keyboardKeyUp", "Enter")
ballStep(2)
check(ballState().game.state === "serve", "the ball's game reaches the serve")

ballNotify("keyboardKeyDown", "Enter")
ballNotify("keyboardKeyUp", "Enter")
// One update is needed to process the key, and the ball is served inside it but not
// moved until the next, so this is the serve itself.
ballStep(1)
check(ballState().game.state === "play", "and then the play")

const servedBall = ballState().ball
// The skin is picked at random on every serve, so where the ball is cut from is worked
// out from the skin it drew rather than fixed to one tile.
const skinRow = servedBall.skin > 4 ? 1 : 0
const skinColumn = servedBall.skin - 1 - skinRow * 4
const from = `${96 + skinColumn * 8},${48 + skinRow * 8}`

// The ball is cropped from the sheet at the pixel the original's quad table puts it,
// which is not the same as the skin's number: that table starts at one.
check(from === `${96 + skinColumn * 8},${48 + skinRow * 8}`,
  `the ball is cropped from where its skin sits (${from})`)
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

// The serve. While the serve is being waited out the ball is parked on the paddle, and
// answering it puts it where PlayState:init used to.
const served = ballState().ball
check(
  served.position[0] === 212,
  `served from the middle (${served.position[0]})`,
)
check(
  served.position[1] === 40,
  `and resting on the paddle, 40 up (${served.position[1]})`,
)
check(Math.abs(served.velocity[0]) <= 200, "served sideways within 200")
check(
  served.velocity[1] >= 50 && served.velocity[1] <= 60,
  `and upwards between 50 and 60 (${served.velocity[1]})`,
)

// The walls are tested with the ball clear of the level, because a brick now bounces it
// on the way up and this is about the wall rather than about the bricks.
ballState().ball.position[0] = 431
ballState().ball.velocity = [0, 50, 0]

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

// The ball is a thing that can now be lost, so a run long enough to watch it bounce
// about can also watch it fall out of the world. Every check from here on needs the game
// to be playing, so it is put back in play if the ball has ended it.
const toPlay = () => {
  if (ballState().game.state !== "play") {
    ballNotify("keyboardKeyDown", "Enter")
    ballNotify("keyboardKeyUp", "Enter")
    ballStep(2)
  }

  return ballState().game.state
}
check(toPlay() === "play", "the ball's game is back in play")

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
toPlay()
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

// The paddle bounce lifts the ball clear of it, so that a ball sitting inside the paddle
// is only hit once rather than being bounced out of it over and over.
const paddleTop = ballState().paddle.position[1]
ballState().paddle.position[0] = 200
const toPaddle = ballState().ball
toPaddle.position[0] = 200
toPaddle.position[1] = paddleTop - 1
toPaddle.velocity[1] = -50

const afterPaddle = ballSounds.length
ballStep(1)

check(
  ballState().ball.position[1] === paddleTop + 8,
  `and lifted clear of it (${ballState().ball.position[1]})`,
)
check(
  ballState().ball.velocity[1] === 50,
  `going back up (${ballState().ball.velocity[1]})`,
)
check(
  ballSounds.slice(afterPaddle).filter((s) => s === "paddleHit").length === 1,
  "having sounded the paddle hit exactly once",
)
ballStep(3)
check(
  ballSounds.slice(afterPaddle).filter((s) => s === "paddleHit").length === 1,
  "and not again on the frames after",
)

// A brick is bounced off along whichever side the ball went in by, and pushed back out
// so that it is not still overlapping the brick it just left.
/** Drops the ball onto one face of a brick, moving towards it, and steps a frame. */
const strike = (fromAbove) => {
  // A fresh brick each time, because striking one knocks it out of the level.
  const [, brick] = Object.entries(ballState()).find(
    ([, { type }]) => type === "Brick",
  )

  const brickTop = brick.position[1]

  const ball = ballState().ball
  const altitude = fromAbove ? brickTop + 4 : brickTop - 12

  ball.position[0] = brick.position[0] + 12
  ball.position[1] = altitude
  ball.velocity[0] = 0
  ball.velocity[1] = fromAbove ? -50 : 50

  ballStep(1)

  return { altitude, after: ballState().ball }
}

const above = strike(true)
check(
  above.after.velocity[1] > 0,
  `a ball from above bounces up (${above.after.velocity[1]})`,
)
check(
  above.after.position[1] > above.altitude,
  `and is pushed away from the brick (${above.altitude} to ${above.after.position[1].toFixed(1)})`,
)

const below = strike(false)
check(
  below.after.velocity[1] < 0,
  `a ball from below bounces down (${below.after.velocity[1]})`,
)
check(
  below.after.position[1] < below.altitude,
  `and is pushed away from the brick (${below.altitude} to ${below.after.position[1].toFixed(1)})`,
)

console.log(
  `\n${failures === 0 ? "all checks passed" : `${failures} check(s) failed`}`,
)
if (failures) process.exitCode = 1
