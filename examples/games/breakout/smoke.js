import "./smoke-setup.js"

import { Engine } from "@inglorious/engine/core/engine.js"

import { brickColourOf, brickTierOf } from "./src/atlas.js"
import { LAYER_BRICK } from "./src/constants.js"
import gameConfig from "./src/game.ijs"
import { createLevel } from "./src/levelmaker.ijs"
import { BRICK_COLORS } from "./src/types/brick.ijs"

gameConfig.entities.game.devMode = false
const engine = new Engine(gameConfig)
const state = () => engine.getState()
const firstState = state
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

const TEN = 10
const ARROW_SIZE = 24
const BRICK_HEIGHT = 16
const HEART_WIDTH = 10
const TWENTY_FOUR = 24

const BRICK_WIDTH = 32
const FIFTEEN = 15
const BRICK_MAX_COLS = 13

/**
 * Whether a level's left edge is where an odd number of columns would put it.
 *
 * A level is padded by 8 plus sixteen for every column it is short of the widest level
 * of thirteen. An odd column count is always an even number of columns short, so that
 * padding always lands 8 above a whole brick's width -- and a row that skips its first
 * cell moves the leftmost brick along by a whole cell, which keeps it there. That is why
 * this can say a level was padded for an odd count without being able to say what that
 * count was.
 */
function paddedForOddColumns(leftEdge) {
  return leftEdge >= 8 && (leftEdge - 8) % BRICK_WIDTH === 0
}

let failures = 0
const check = (ok, l) => {
  if (!ok) failures++
  console.log(`${ok ? "PASS" : "FAIL"} ${l}`)
}

step(4)
check(state().game.menuItem === "start", "the menu starts on START")
check(state().title.value === "BREAKOUT", "the title reads BREAKOUT")
// Every line says itself in white, or in the colour the menu picks an item out with. The
// renderer defaults text to black, so a line that leaves its colour out is black rather
// than white, and a screen of black lines on a dark backdrop looks like nothing at all.
const PICKED_OUT = "rgb(103, 255, 255)"
const whiteLines = (state) =>
  Object.entries(state).filter(
    ([id, entity]) =>
      entity?.type !== "game" &&
      typeof entity?.value === "string" &&
      entity.value !== "" &&
      entity.color !== "white" &&
      entity.color !== PICKED_OUT,
  )

check(
  whiteLines(state()).length === 0,
  "every line on the start screen is white",
)
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
// Each menu line is tied to the item it stands for by the string it is given, and that
// tie is invisible until the pick-out stops following one of them.
press("ArrowUp")
step(2)
check(state().start.color === "rgb(103, 255, 255)", "and comes back to START")
press("ArrowDown")
step(2)
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

// The scores kept between games. The second item of the menu reads them rather than
// starting a game.
check(
  state().highScoresTitle === undefined,
  "the table is not up on the title screen",
)
press("ArrowDown")
press("Enter")
step(4)
check(
  state().game.state === "highScores",
  "choosing HIGH SCORES reads the table",
)
check(state().highScoresTitle.value === "High Scores", "the table is titled")
check(state().highScoresTitle.size === 32, "in the large font")
check(
  state().highScoresPrompt.value === "Press Escape to return to the main menu!",
  "and says how to leave",
)
check(state().highScoresPrompt.size === 8, "in the small font")
// Ten rows, and each row is three separately aligned pieces, so thirty entities.
check(
  Object.keys(state()).filter((id) => /^highScore\d+Position$/.test(id))
    .length === TEN,
  "ten rows",
)
check(
  state().highScore0Position.value === "1.",
  "the first row is numbered from one",
)
check(state().highScore9Position.value === "10.", "and the tenth from ten")
check(state().highScore0Position.textAlign === "left", "the position runs left")
check(
  state().highScore0Name.textAlign === "right",
  "the name runs back from its own box",
)
check(
  state().highScore0Score.textAlign === "right",
  "and the score runs back from another",
)
// The boxes are the original's, so these are where each ends rather than where a line of
// text is centred: 108, 108 + 50 + 38, and 216 + 100.
check(
  state().highScore0Position.position[0] === 108,
  "the position column sits at a quarter",
)
check(
  state().highScore0Name.position[0] === 196,
  "the name ends where its box does",
)
check(
  state().highScore0Score.position[0] === 316,
  "and the score where its own does",
)
// Seeded from nothing, the table reads ten thousand down to a thousand, all one name.
check(state().highScore0Name.value === "CTO", "the seed is one name")
check(state().highScore0Score.value === "10000", "from ten thousand")
check(state().highScore9Score.value === "1000", "down to a thousand")
check(state().game.highScores.length === TEN, "ten entries are kept")
// The title belongs at the top of the screen with the rows below it, and the rows belong
// in order from the first to the tenth. Asking that the title clears the first row is
// what catches a title laid out at the height of the middle of the table.
const titleAltitude = state().highScoresTitle.position[1]
const firstRowAltitude = state().highScore0Position.position[1]
const lastRowAltitude = state().highScore9Position.position[1]
check(
  titleAltitude > firstRowAltitude,
  `the title stands above the first row (${titleAltitude} against ${firstRowAltitude})`,
)
check(
  firstRowAltitude > lastRowAltitude,
  "and the rows run down the screen in order",
)
const SCREEN_HEIGHT = 243
check(
  titleAltitude + state().highScoresTitle.size / 2 <= SCREEN_HEIGHT &&
    titleAltitude - state().highScoresTitle.size / 2 > firstRowAltitude,
  "and the whole of it is on the screen, above the first row",
)
check(
  state().highScoresPrompt.position[1] < lastRowAltitude,
  "with the prompt at the bottom, below the last row",
)

// This is the one screen the original takes the way out for itself: Escape goes back to
// the menu instead of out of the game.
press("Escape")
step(2)
check(state().game.state === "start", "Escape leaves the table")
check(state().game.quit !== true, "and does not quit the game with it")
check(
  state().highScoresTitle === undefined,
  "the table is taken off the screen",
)
// Left back on START, which is where this section began, so the rest of the title screen
// is walked from the same place it would otherwise have been.
press("ArrowDown")
check(state().game.menuItem === "start", "and the menu is back on START")
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
check(
  state().game.state === "paddleSelect",
  "Enter leaves the start screen for the choice of paddle",
)

// The choice of paddle. Four of them, the same width in four colours, so what is being
// chosen is a look. The arrows either side of it are dimmed when the choice is already as
// far that way as it goes, and reaching one says so rather than doing nothing.
check(
  state().selectPaddlePrompt.value ===
    "Select your paddle with left and right!",
  "which says how",
)
check(state().selectPaddlePrompt.size === 16, "in the medium font")
check(
  state().selectPaddleHint.value === "(Press Enter to continue!)",
  "and that Enter carries on",
)
check(state().selectPaddleHint.size === 8, "in the small font")
check(state().game.paddleSkin === 1, "the first paddle is chosen to begin with")
check(
  state().selectPaddle.position[0] === 184,
  "the paddle is shown in the middle",
)
check(
  state().selectPaddle.position[1] === 81,
  "on the row below the two lines of text",
)
check(state().selectLeftArrow.position[0] === 84, "with an arrow to the left")
check(state().selectRightArrow.position[0] === 324, "and one to the right")
// The arrows sheet holds two of them side by side, so the one on each side is cut from
// its own half of it.
check(
  state().selectLeftArrow.image.id === "arrows",
  "cut from the arrows sheet",
)
check(
  state().selectLeftArrow.image.frameSize.join() === "24,24",
  "both a cell wide",
)
check(state().selectLeftArrow.image.x === 0, "the left one from the left of it")
check(
  state().selectRightArrow.image.x === ARROW_SIZE,
  "and the right one from the right",
)
// Darkened and faded, which is what the original does: a dark grey laid over the arrow at
// half opacity. A white tint leaves an arrow equal to itself, which is the other half of
// saying the same thing.
check(
  state().selectLeftArrow.tint === "rgb(40, 40, 40)",
  "the left one darkened, being already as far left as it goes",
)
check(state().selectLeftArrow.opacity === 128 / 255, "and faded")
check(
  state().selectRightArrow.tint === "white",
  "and the right one is not darkened",
)
check(state().selectRightArrow.opacity === 1, "nor faded")
check(state().selectRightArrow.opacity === 1, "and is drawn as it comes")

press("ArrowLeft")
check(state().game.paddleSkin === 1, "left at the first paddle stays there")
check(played.includes("noSelect"), "and says it cannot go further")
press("ArrowRight")
check(state().game.paddleSkin === 2, "right moves along")
check(played.includes("select"), "with the sound of moving")
check(
  state().selectLeftArrow.tint === "white",
  "so the left arrow is no longer darkened",
)
check(
  state().selectRightArrow.tint === "white",
  "and neither is darkened while there is room both ways",
)
check(state().selectPaddle.skin === 2, "the paddle shown is the one chosen")
for (let i = 0; i < 2; i++) press("ArrowRight")
check(state().game.paddleSkin === 4, "to the last")
check(
  state().selectRightArrow.tint === "rgb(40, 40, 40)",
  "where the right arrow is darkened too",
)
check(
  state().selectPaddle.skin === 4,
  "and the paddle shown has followed the choice",
)
press("ArrowRight")
check(state().game.paddleSkin === 4, "and pressing on stays at the last")

press("Enter")
check(state().game.state === "serve", "Enter leaves the choice for the serve")
// The paddle that gets played with is the one that was chosen, not simply the first.
check(state().paddle.skin === 4, "and it is played with the paddle chosen")
check(state().paddle.image.y === 160, "cut from its own band of the sheet")
check(
  Object.keys(state()).filter((id) => id === "paddle").length === 1,
  "with one paddle standing, not one chosen and one default",
)
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
check(
  state().servePrompt.value === "Press Enter to serve!",
  "the serve says so",
)
check(state().servePrompt.size === 16, "in the medium font")
check(state().score !== undefined, "the score stands on the serve")
check(state().scoreLabel.value === "Score:", "labelled Score")
check(state().score.size === 8, "in the small font")
check(state().score.value === "0", "starting at nothing scored")
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
  state().ball.position[0] === state().paddle.position[0] + 32 - 4,
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

// The original plays its pause sound both pausing and resuming. Which sound came out
// last is not the question, because the ball is live again by the end of the press and
// may have reached something: whether the pause was sounded at all is.
const beforeResume = played.length
press("Space")
check(state().game.state === "play", "space resumes")
check(state().paused.value === "", "and PAUSED goes away")
check(
  played.slice(beforeResume).includes("pause"),
  "resuming sounds the pause again",
)

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
// The label and the number are one line of interface, so they hang from one height --
// and from one edge of the line, because two entities can share a position and still be
// drawn half a font apart if one is anchored by its top and the other by its middle.
check(
  hud.score.value === "0" &&
    hud.scoreLabel.position[1] === hud.score.position[1],
  `the label and the number share a height (${hud.scoreLabel.position[1]})`,
)
check(
  hud.scoreLabel.baseline === hud.score.baseline,
  "and share a baseline, so they are one line and not two",
)
check(
  hud.scoreLabel.baseline === "top" && hud.paused.baseline === "middle",
  "with the printed lines anchored by their top and the centred ones by their middle",
)
check(
  hud.scoreLabel.textAlign === "left",
  "the label runs left from its own edge",
)
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
    if (typeof line.value !== "string" || typeof line.size !== "number")
      continue

    check(
      line.position[1] - line.size >= 0 && line.position[1] <= 243,
      `${where}: ${id} is drawn inside the screen (top at ${line.position[1]})`,
    )
  }
}
linesFit(hud, "on the serve")

// Clearing a level ends it, and the next one starts afresh.
const levelEngine = new Engine(gameConfig)
const levelState = () => levelEngine.getState()
const levelStep = (n = 1) => {
  for (let i = 0; i < n; i++) levelEngine.update(1 / 60)
}
const levelPress = (code) => {
  levelEngine._store.notify("keyboardKeyDown", code)
  levelEngine._store.notify("keyboardKeyUp", code)
  levelStep(2)
}
const levelSounds = []
const levelAudio = levelEngine._store.getType("Audio")
const levelPlaySound = levelAudio.soundPlay
levelAudio.soundPlay = function sound(entity, name) {
  levelSounds.push(name)
  return levelPlaySound.call(this, entity, name)
}

levelStep(4)
levelPress("Enter")
check(
  levelState().game.state === "paddleSelect",
  "and the choice of paddle comes before the serve",
)
levelPress("Enter")

check(levelState().game.level === 1, "a new game is on the first level")
check(levelState().level.value === "Level 1", "and the serve says so")

levelPress("Enter")
check(levelState().game.state === "play", "the serve is answered")

// Every brick but the last is taken away, and the last one is hit for real. A brick that
// is only knocked back must not finish the level.
const levelBricks = Object.keys(levelState()).filter((id) =>
  id.startsWith("brick"),
)
const survivor = levelBricks[0]

for (const id of levelBricks.slice(1)) {
  levelEngine._store.notify("remove", id)
}

// Those removals announce themselves, so the level counts itself down to the one brick
// left standing without being told to.
levelStep(1)
check(levelState().game.bricksLeft === 1, "and the level counts what is left")
check(
  levelState().game.state === "play",
  "and the level is not finished while a brick is still standing",
)

// The last one, knocked down with its own hit.
levelState()[survivor].hp = 1
const [sx, sy] = levelState()[survivor].position
levelState().ball.position = [sx + 12, sy - 4, 0]
levelState().ball.velocity = [0, 0, 0]
levelStep(2)

check(levelState()[survivor] === undefined, "the last brick is gone")
check(
  levelState().game.state === "victory",
  `and the level is finished (${levelState().game.state})`,
)
check(levelSounds.includes("victory"), "having sounded the victory")
check(
  levelState().victoryTitle.value === "Level 1 complete!",
  "the victory says so",
)
check(
  levelState().victoryPrompt.value === "Press Enter to serve!",
  "and how to carry on",
)
check(
  levelState().score !== undefined && levelState().heart0 !== undefined,
  "with the score and the lives still standing under it",
)
check(
  levelState().paused === undefined && levelState().servePrompt === undefined,
  "but none of the serve's own lines",
)

const firstLevelBricks = levelBricks.length
levelPress("Enter")

check(levelState().game.state === "serve", "Enter starts the next level")

// A line placed at the middle of the screen is centred on it. Anything else pushes the
// whole line to one side of where it was put -- which reads as misplaced rather than as
// wrong, and is what a left-aligned line at the centre looks like.
const centredLines = (state) =>
  Object.entries(state).filter(
    ([id, entity]) =>
      typeof entity?.value === "string" &&
      entity.value !== "" &&
      entity.position?.[0] === 432 / 2 &&
      entity.textAlign !== "center",
  )
check(
  centredLines(levelState()).length === 0,
  `every line at the middle is centred on it (${centredLines(levelState())
    .map(([id]) => id)
    .join(", ")})`,
)
check(levelState().game.level === 2, "and it is the second")
check(levelState().level.value === "Level 2", "which the serve says")
check(
  levelState().victoryTitle === undefined,
  "with the victory screen taken away",
)
const secondLevelBricks = Object.keys(levelState()).filter((id) =>
  id.startsWith("brick"),
)
// Every brick of the first level had been knocked out, so standing the same ones back up
// would mean the second level is the first one again.
check(
  secondLevelBricks.length > 0 &&
    secondLevelBricks.every((id) => !levelBricks.includes(id)),
  `and a level of its own standing up (${secondLevelBricks.length})`,
)
check(
  secondLevelBricks.every((id) => id.startsWith("brick2-")),
  "whose bricks are named for the level they belong to",
)

// A new game rolls a new level rather than beginning again on the one it left behind.
const beforeNewGame = secondLevelBricks[0]
levelEngine._store.notify("quit")
const fresh = new Engine(gameConfig)
const freshState = () => fresh.getState()
const freshStep = (n = 1) => {
  for (let i = 0; i < n; i++) fresh.update(1 / 60)
}
freshStep(4)
fresh._store.notify("keyboardKeyDown", "Enter")
fresh._store.notify("keyboardKeyUp", "Enter")
freshStep(2)
fresh._store.notify("keyboardKeyDown", "Enter")
fresh._store.notify("keyboardKeyUp", "Enter")
freshStep(2)
check(freshState().game.level === 1, "a new game is back on the first level")
check(
  Object.keys(freshState()).some((id) => id.startsWith("brick1-")),
  "with a level rolled for it",
)

// The ball quickens a little on every brick hit, up to a point.
const capped = new Engine(gameConfig)
const cappedState = () => capped.getState()
const cappedStep = (n = 1) => {
  for (let i = 0; i < n; i++) capped.update(1 / 60)
}
const cappedPress = (code) => {
  capped._store.notify("keyboardKeyDown", code)
  capped._store.notify("keyboardKeyUp", code)
  cappedStep(2)
}
cappedStep(4)
cappedPress("Enter")
cappedPress("Enter")
// Two Enters reach the serve, not the play: the menu asks which paddle first, so the
// serve is the second screen and answering it is a third.
check(cappedState().game.state === "serve", "two Enters reach the serve")
cappedPress("Enter")
check(cappedState().game.state === "play", "and a third answers it")
const cappedBricks = Object.keys(cappedState()).filter((id) =>
  id.startsWith("brick"),
)
const cappedBrick = cappedBricks[0]
const [cx, cy] = cappedState()[cappedBrick].position
cappedState()[cappedBrick].hp = 10

// Well over the ceiling, so a hit has nothing left to quicken.
cappedState().ball.position = [cx + 12, cy - 4, 0]
cappedState().ball.velocity = [0, 400, 0]
cappedStep(1)
check(
  cappedState().ball.velocity[1] <= 150,
  `a ball already at the ceiling does not quicken (${cappedState().ball.velocity[1].toFixed(0)})`,
)

// Under it, so a hit still does.
cappedState().ball.position = [cx + 12, cy - 4, 0]
cappedState().ball.velocity = [0, 100, 0]
cappedStep(1)
check(
  Math.abs(cappedState().ball.velocity[1]) > 100,
  `and one under it still does (${cappedState().ball.velocity[1].toFixed(1)})`,
)

// Escape quits, and it quits from any state rather than from the play alone -- the
// original checks it in all four of its states, so a way out is never behind a particular
// screen. Quitting is the engine's own: the game only announces it.
check(state().game.quit === undefined, "nothing has asked to quit yet")

press("Escape")
check(state().game.quit === true, "Escape asks the engine to quit")

// And it is the loop that stops rather than the world being halted, so the game is still
// in the state it was in.
// The flag is on the game entity; `paused` on its own is the overlay that says PAUSED.
check(
  state().game.state === "play" && state().game.paused === false,
  "leaving the game exactly where it was, and not paused",
)

// Quitting stops the loop rather than halting the world, so the frame the quit is
// processed on still runs to its end -- and after it, nothing is asked to move again.
const frozenAt = state().ball.position.join()
step(60)
check(
  state().ball.position.join() === frozenAt,
  `and the world is never updated again (${frozenAt})`,
)

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
lifePress("Enter")
check(lifeState().game.state === "play", "a game of its own reaches the play")
const lifeBricks = Object.keys(lifeState()).filter((id) =>
  id.startsWith("brick"),
)
check(lifeBricks.length > 0, "with a level standing above it")

// A brick hit is worth the tier and the colour it was hit at. Rather than wait for the
// ball to find one, a brick is put where the ball already is, which is the collision the
// original would have found for it.
// The ball is put inside one brick's cell and stopped there, rather than a brick being
// put on the ball: a brick's cell holds one brick and nothing else, so exactly one hit
// is resolved. The bounce then pushes the ball clear, so the next hit needs putting it
// back.
const hitBrick = (id) => {
  // Strictly inside the brick's cell, and clear of all four of its edges. Bricks are
  // anchored by their top left corner, so a brick at (x, y) covers x to x+32 across and
  // y-16 to y up, and touching an edge counts as overlapping -- which is right for a game
  // but means a ball parked on a corner would hit this brick and its neighbour at once.
  const [brickX, brickY] = lifeState()[id].position

  lifeState().ball.position = [brickX + 12, brickY - 4, 0]
  lifeState().ball.velocity = [0, 0, 0]
  lifeStep(1)

  // The bounce pushes the ball clear of the brick it hit, but not always clear of the
  // one next to it, so it is put back on the paddle before the frame that lets the score
  // text catch up. Otherwise one hit knocks back two bricks.
  lifeState().ball.position = [212, 40, 0]
  lifeState().ball.velocity = [0, 0, 0]
  lifeStep(1)
}

const scoreOf = (hp) => brickTierOf(hp) * 200 + brickColourOf(hp) * 25

// The brick is given a known place in the order so that what a hit does to it can be
// said outright rather than read off whatever the level happened to roll.
// The lowest row, so that putting the ball in a brick's cell is not the ball hitting the
// ceiling on the way.
const lowestRow = Math.min(
  ...lifeBricks.map((id) => lifeState()[id].position[1]),
)
const firstOfLowestRow = lifeBricks.find(
  (id) => lifeState()[id].position[1] === lowestRow,
)

const study = firstOfLowestRow
lifeState()[study].hp = 5

lifeState().game.score = 0
hitBrick(study)
check(
  lifeState().score.value === String(scoreOf(5)),
  `a brick scores what it was worth before the hit (${lifeState().score.value})`,
)
check(
  lifeState()[study] !== undefined && lifeState()[study].hp === 4,
  "and a hit takes one off it rather than taking it away",
)

// The order runs down the colours of a tier, and at the first colour on to the tier below
// and round to the last colour of that.
const walk = lifeBricks.find(
  (id) => id !== study && lifeState()[id]?.position[1] === lowestRow,
)
lifeState()[walk].hp = 7
const seen = [[1, 2]]
while (lifeState()[walk] !== undefined && seen.length < 20) {
  hitBrick(walk)
  if (lifeState()[walk] !== undefined) {
    seen.push([
      brickTierOf(lifeState()[walk].hp),
      brickColourOf(lifeState()[walk].hp),
    ])
  }
}
// Two of one tier's five colours, then the last four of the tier below, and then nothing
// left to knock off.
check(
  seen.map(([, color]) => color).join() === "2,1,5,4,3,2,1",
  `and the colours run down and round (${seen.map(([, c]) => c).join(",")})`,
)
check(
  seen.every(([tier], i) => tier === (i < 2 ? 1 : 0)),
  `the tier dropping once the colours are used up (${seen.map(([t]) => t).join(",")})`,
)
check(
  lifeState()[walk] === undefined,
  "and a brick with nothing left on it leaves",
)

// Every hit sounds the hit, and only the hit that finally breaks a brick sounds the
// break as well -- so a brick that took seven hits was heard six times and broken once.
const hitCount = lifeSounds.filter((name) => name === "brickHit").length
const brokenCount = lifeSounds.filter((name) => name === "brickBroken").length
check(
  hitCount > brokenCount && brokenCount >= 1,
  `every hit sounds, and only the one that breaks a brick sounds the break (${hitCount} hits, ${brokenCount} breaks)`,
)

// How many hits a brick takes, which is a plain function of where it sits in the palette:
// down through its colours, then on to the tier below and round to the last colour of
// that. This is what all the bricks looked alike got in the way of seeing.
const hitsToBreak = (hp) => {
  const engine = new Engine(gameConfig)
  const at = () => engine.getState()
  const run = (n = 1) => {
    for (let i = 0; i < n; i++) engine.update(1 / 60)
  }
  const key = (code) => {
    engine._store.notify("keyboardKeyDown", code)
    engine._store.notify("keyboardKeyUp", code)
    run(2)
  }

  run(4)
  key("Enter")
  key("Enter")
  // Two Enters reach the serve, because the menu asks which paddle first; this one is
  // about hits landing, so it wants the play.
  key("Enter")
  check(
    at().game.state === "play",
    "the brick of a given number of hits is being played at",
  )

  const bricks = Object.keys(at()).filter((id) => id.startsWith("brick"))
  const lowest = Math.min(...bricks.map((id) => at()[id].position[1]))
  const brick = bricks.find((id) => at()[id].position[1] === lowest)

  at()[brick].hp = hp

  const [x, y] = at()[brick].position
  let hits = 0

  while (at()[brick] && hits < FIFTEEN) {
    at().ball.position = [x + 12, y - 4, 0]
    at().ball.velocity = [0, 0, 0]
    run(1)
    hits++
  }

  return hits
}

check(hitsToBreak(1) === 1, "the plainest brick takes one hit")
check(hitsToBreak(5) === 5, "the last colour of a tier takes five")
check(hitsToBreak(6) === 6, "and the first colour of the tier above takes six")
check(hitsToBreak(10) === 10, "while the hardest brick on the sheet takes ten")

// The debris a brick throws off when it is hit.
const debrisOf = (engine) =>
  engine._store.extras
    .getAllActivePoolEntities()
    .filter((p) => p.type === "Particle")

const dustEngine = new Engine(gameConfig)
const dustState = () => dustEngine.getState()
const dustStep = (n = 1) => {
  for (let i = 0; i < n; i++) dustEngine.update(1 / 60)
}
const dustPress = (code) => {
  dustEngine._store.notify("keyboardKeyDown", code)
  dustEngine._store.notify("keyboardKeyUp", code)
  dustStep(2)
}

dustStep(4)
dustPress("Enter")
dustPress("Enter")
dustPress("Enter")

const dustBricks = Object.keys(dustState()).filter((id) =>
  id.startsWith("brick"),
)
const dustLowest = Math.min(
  ...dustBricks.map((id) => dustState()[id].position[1]),
)
const dustBrick = dustBricks.find(
  (id) => dustState()[id].position[1] === dustLowest,
)
dustState()[dustBrick].hp = 8

check(
  debrisOf(dustEngine).length === 0,
  "a level on its own throws off no debris",
)

const [dustX, dustY] = dustState()[dustBrick].position
dustState().ball.position = [dustX + 12, dustY - 4, 0]
dustState().ball.velocity = [0, 0, 0]
dustStep(1)

const debris = debrisOf(dustEngine)
check(
  debris.length === 64,
  `a brick hit throws off ${64} pieces (${debris.length})`,
)
// The debris is tinted. The brick it came off is *not*: a brick's own `color` is a number
// saying where it sits in the palette, and a renderer reading that as a colour to draw it
// in is handed something the canvas ignores without complaint, leaving the brick black.
check(
  debris.every((p) => p.tint === BRICK_COLORS[3]),
  "every piece tinted with the colour of the brick it came off",
)
check(
  debris.every((p) =>
    p.tint === undefined ? false : typeof p.tint === "string",
  ),
  "in a colour the canvas understands rather than a number",
)
check(
  dustState()[dustBrick].tint === undefined,
  "while the brick itself is left untinted",
)
check(
  debris.every((p) => p.startOpacity === (55 / 255) * 2),
  "and as opaque as the tier it was hit at says",
)
check(
  debris.every(
    (p) =>
      Math.abs(p.position[0] - (dustX + 16)) <= 10 &&
      Math.abs(p.position[1] - (dustY - 8)) <= 10,
  ),
  "thrown from the middle of it, scattered within a box",
)
// Downwards here, where the original counts the other way up the screen.
check(
  debris.every(
    (p) =>
      p.acceleration[1] <= 0 &&
      p.acceleration[1] >= -80 &&
      Math.abs(p.acceleration[0]) <= 15,
  ),
  "every piece falling, and within the sideways spread it is given",
)
check(
  debris.every((p) => p.life >= [0.5, 1][0] && p.life <= [0.5, 1][1]),
  "each lasting its own time, between half a second and a second",
)
// Drawn after the bricks and before the paddle, which is where the original draws them.
check(
  debris.every((p) => p.layer === 0.5) && LAYER_BRICK < 0.5 && 0.5 < 1,
  "drawn over the bricks and under the paddle",
)

// The ball is put back on the paddle first. Left sitting in the brick's cell it keeps
// being hit -- the bounce pushes it only as far as the overlap, which is not far enough to
// leave -- and a brick that is never done being hit throws off debris for ever.
dustState().ball.position = [212, 40, 0]
dustState().ball.velocity = [0, 0, 0]

// Each piece has its own lifetime, so the longest has to be waited out before the burst
// has all gone.
const longestLife = Math.max(...debris.map((p) => p.life))
dustStep(Math.ceil(longestLife * 60) + 2)
check(
  debrisOf(dustEngine).length === 0,
  "and gone again once they have lived their time",
)

// A higher brick throws brighter debris, which is what a tier is for.
const brighter = new Engine(gameConfig)
const brighterState = () => brighter.getState()
const brighterStep = (n = 1) => {
  for (let i = 0; i < n; i++) brighter.update(1 / 60)
}
const brighterPress = (code) => {
  brighter._store.notify("keyboardKeyDown", code)
  brighter._store.notify("keyboardKeyUp", code)
  brighterStep(2)
}
brighterStep(4)
brighterPress("Enter")
brighterPress("Enter")
brighterPress("Enter")
const brighterBricks = Object.keys(brighterState()).filter((id) =>
  id.startsWith("brick"),
)
const brighterBrick = brighterBricks[0]
const [bx, by] = brighterState()[brighterBrick].position
brighterState()[brighterBrick].hp = 1
brighterState().ball.position = [bx + 12, by - 4, 0]
brighterState().ball.velocity = [0, 0, 0]
brighterStep(1)
const lowTier = debrisOf(brighter).map((p) => p.startOpacity)

check(
  debris[0].startOpacity > lowTier[0],
  "a brick higher up the sheet throws brighter debris",
)

// A higher brick is worth knocking down than a low one, which is the whole reason a level
// bothers with colour.
check(scoreOf(20) > scoreOf(5), "a tier is worth more than a colour")

// The level is one level across the whole game, so losing a life does not roll a new one
// and quietly put back every brick knocked out so far.
const remaining = Object.keys(lifeState()).filter((id) =>
  id.startsWith("brick"),
)
const knockedOut = lifeBricks.length - remaining.length
check(
  knockedOut === 1,
  `and only the broken one is gone (${knockedOut} of ${lifeBricks.length})`,
)

const hurtBefore = lifeSounds.length
dropTheBall()
check(
  lifeState().game.state === "serve",
  "a ball past the floor means another serve",
)
check(lifeState().game.health === 2, "and costs a life")
check(lifeSounds.slice(hurtBefore).includes("hurt"), "having sounded the hurt")
// The hearts fill from the left, so only the last one empties. They are asked on the
// frame after the loss, because whichever entity asks first in a frame sees the life
// count as it was when the frame began.
lifeStep(1)
check(lifeState().heart0.image.x === 0, "the first heart is still full")
check(
  lifeState().heart2.image.x === HEART_WIDTH,
  "and the last one has emptied",
)

// Every serve is a new ball with a skin of its own.
const skins = new Set([lifeState().ball.skin])
dropTheBall()
lifeStep(2)
skins.add(lifeState().ball.skin)

check(lifeState().game.health === 1, "a second life goes the same way")

// The last life ends the game.
const finalScore = lifeState().game.score
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
check(
  lifeState().gameOverTitle.value === "GAME OVER",
  "the title says GAME OVER",
)
check(
  lifeState().gameOverScore.value === `Final Score: ${finalScore}`,
  `and the score it came to (${lifeState().gameOverScore.value})`,
)
check(lifeState().gameOverPrompt.value === "Press Enter!", "with a prompt")
check(
  lifeState().gameOverTitle.position[1] > lifeState().gameOverScore.position[1],
  "the title sits above the score",
)
check(
  lifeState().gameOverScore.position[1] >
    lifeState().gameOverPrompt.position[1],
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
check(
  lifeState().gameOverTitle === undefined,
  "the game over screen goes with it",
)

// A score good enough to be worth writing down does not go back to the menu: it goes to
// the screen where a name is written in. The table it is weighed against is the seeded
// one, ten thousand down to a thousand, so anything past ten thousand beats all of it.
lifeState().game.state = "gameOver"
lifeState().game.score = 10500
lifeStep(2)
check(lifeState().game.state === "gameOver", "the game is over")
lifePress("Enter")
check(
  lifeState().game.state === "enterHighScore",
  "a score past all of them earns a name",
)
check(lifeSounds.includes("highScore"), "and says so with the high score sound")
check(
  lifeState().yourScore.value === "Your score: 10500",
  "the score it came to is said across the top",
)
check(lifeState().yourScore.size === 16, "in the medium font")
check(
  lifeState().enterScorePrompt.value === "Press Enter to confirm!",
  "and a line at the bottom says how to finish",
)
check(lifeState().enterScorePrompt.size === 8, "in the small font")

// Three letters, all on A, with the first picked out as the one being changed.
check(lifeState().game.name === "AAA", "the name starts as three letters of A")
check(lifeState().enteredLetter0.value === "A", "the first reads A")
check(lifeState().enteredLetter1.value === "A", "and so does the second")
check(lifeState().enteredLetter2.value === "A", "and the third")
check(
  lifeState().enteredLetter0.color === "rgb(103, 255, 255)",
  "the first is picked out",
)
check(lifeState().enteredLetter1.color === "white", "and the second is not")
check(lifeState().enteredLetter2.color === "white", "nor the third")
// The letters are laid out about the middle of the screen with a gap either side.
check(
  lifeState().enteredLetter0.position[0] === 188,
  "the first letter stands left",
)
check(lifeState().enteredLetter1.position[0] === 210, "the second after it")
check(lifeState().enteredLetter2.position[0] === 236, "and the third last")

// Up and down scroll the letter being changed, wrapping round at A and at Z. No sound:
// the original plays one only for moving between the letters.
const soundsBeforeScroll = lifeSounds.length
lifePress("ArrowUp")
check(lifeState().game.name === "BAA", "up scrolls the letter on")
check(
  lifeSounds.length === soundsBeforeScroll,
  "and says nothing while doing it",
)
for (let i = 0; i < TWENTY_FOUR; i++) lifePress("ArrowUp")
check(lifeState().game.name === "ZAA", "up to Z")
lifePress("ArrowUp")
check(lifeState().game.name === "AAA", "and wraps round to A")
lifePress("ArrowDown")
check(lifeState().game.name === "ZAA", "down from A wraps round to Z")
lifePress("ArrowUp")
check(lifeState().game.name === "AAA", "and up again comes back to A")

// Left and right choose which letter is being changed, and say so.
const soundsBeforeMove = lifeSounds.length
lifePress("ArrowLeft")
check(
  lifeState().game.letter === 1,
  "the first letter is already being changed",
)
check(lifeSounds.length === soundsBeforeMove, "and moving onto it says nothing")
lifePress("ArrowRight")
check(lifeState().game.letter === 2, "right moves to the second")
check(lifeSounds.includes("select"), "with the select sound")
check(
  lifeState().enteredLetter0.color === "white",
  "leaving the first unpicked",
)
check(
  lifeState().enteredLetter1.color === "rgb(103, 255, 255)",
  "and picking out the second",
)
lifePress("ArrowRight")
lifePress("ArrowRight")
check(lifeState().game.letter === 3, "and on to the third")
lifePress("ArrowRight")
check(lifeState().game.letter === 3, "which will not go past the third")

// Scrolling now changes the third letter, not the first.
lifePress("ArrowDown")
check(lifeState().game.name === "AAZ", "so it is the third that is changed")
lifePress("ArrowDown")
check(lifeState().game.name === "AAY", "and down again")

// Enter writes the name in at the place it earned and shows the table.
lifePress("Enter")
check(
  lifeState().game.state === "highScores",
  "confirming writes the name in and shows the table",
)
check(
  lifeState().game.highScores.length === TEN,
  "which is still ten entries long",
)
check(
  lifeState().highScore0Name.value === "AAY",
  "the new name is at the top, having beaten everything",
)
check(
  lifeState().highScore0Score.value === "10500",
  "with the score it came to",
)
check(lifeState().highScore1Name.value === "CTO", "and the rest moved down")
check(
  lifeState().highScore1Score.value === "10000",
  "carrying their scores with them",
)

// A score that beats nothing goes back to the menu, and is not written down.
lifePress("Escape")
lifeState().game.state = "gameOver"
lifeState().game.score = 500
lifeStep(2)
lifePress("Enter")
check(
  lifeState().game.state === "start",
  "a score beating nothing goes back to the menu",
)
// The table's own entities are off the screen at the menu, so this asks the table rather
// than what is drawn of it.
check(
  !lifeState().game.highScores.some((entry) => entry.score === 500),
  "and is not written into the table",
)
check(
  lifeState().game.highScores[0].name === "AAY",
  "which still has the score written in earlier at the top of it",
)

// A new game begins again from the beginning, from the menu the last score left us at.
// The first Enter only reaches the choice of paddle: a new game's lives and score are
// settled when that choice is confirmed, not before, so nothing is back yet.
lifePress("Enter")
check(lifeState().game.state === "paddleSelect", "and asks which paddle first")
lifePress("Enter")
check(lifeState().game.state === "serve", "and then it starts")
check(lifeState().game.health === 3, "with every life back")
check(lifeState().score.value === "0", "and back to nothing scored")
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

// Three Enters reach the play: one leaves the menu, one confirms the paddle, and one
// answers the serve. Each is given its own update so the field is standing up before the
// next is pressed.
ballNotify("keyboardKeyDown", "Enter")
ballNotify("keyboardKeyUp", "Enter")
ballStep(2)
check(
  ballState().game.state === "paddleSelect",
  "the ball's game reaches the choice of paddle",
)
ballNotify("keyboardKeyDown", "Enter")
ballNotify("keyboardKeyUp", "Enter")
ballStep(2)
check(ballState().game.state === "serve", "and then the serve")

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
check(
  from === `${96 + skinColumn * 8},${48 + skinRow * 8}`,
  `the ball is cropped from where its skin sits (${from})`,
)
check(
  servedBall.image.frameSize.join() === "8,8",
  `and is 8x8 (${servedBall.image.frameSize.join("x")})`,
)

// The level, laid out the way the original lays it out: rows and columns both at random,
// bricks 32 wide and touching, padded by 8 plus half a brick for each missing column.
const brickList = Object.values(ballState()).filter(
  ({ type }) => type === "Brick",
)
const rows = new Set(brickList.map(({ position }) => position[1])).size

check(rows >= 1 && rows <= 5, `the level has between 1 and 5 rows (${rows})`)
// How many columns the level rolled cannot be read back off it -- a row that skips its
// first cell moves the leftmost brick a whole cell right, which is exactly the gap
// between one possible padding and the next -- so all that can be said is that it is no
// fuller than the widest level, and not empty.
check(
  brickList.length > 0 && brickList.length <= rows * BRICK_MAX_COLS,
  `with a brick for most cells, and none at all for some (${brickList.length})`,
)
check(
  brickList.every(({ size }) => size[0] === 32 && size[1] === 16),
  "each 32x16",
)
// Bricks are laid out in cells one brick wide, and a row that skips leaves a whole cell
// empty between neighbours -- so a row's bricks are either touching or one cell apart,
// and never closer than touching.
const xs = [...new Set(brickList.map(({ position }) => position[0]))].sort(
  (a, b) => a - b,
)
check(
  xs.every((x, i) => i === 0 || x - xs[i - 1] === 32 || x - xs[i - 1] === 64),
  `laid out on the grid, touching or one cell apart (${xs.join(", ")})`,
)
// And no two bricks share a cell, whichever row they are in.
check(
  new Set(brickList.map(({ position }) => position.join(","))).size ===
    brickList.length,
  "with no cell holding two bricks",
)
check(
  paddedForOddColumns(xs[0]),
  `and padded for an odd number of columns (${xs[0]})`,
)
check(
  xs.every((x) => x >= xs[0] && (x - xs[0]) % BRICK_WIDTH === 0),
  "with every brick on the same grid of cells",
)
// Hanging from the ceiling, which is where the original starts them.
const ys = [...new Set(brickList.map(({ position }) => position[1]))].sort(
  (a, b) => b - a,
)
check(
  ys[0] === 227 && ys[ys.length - 1] === 243 - rows * 16,
  `from just under the ceiling down (${ys.join(", ")})`,
)

// How many hits a brick has left is what says which of the twenty frames it draws from, so
// each brick's own crop is checked against that rather than against a fixed tile. On the
// first level the tiers never leave zero, so a brick is worth at most four hits.
// Where a brick's frame starts on the sheet, in pixels: its quad's column and row, each
// turned into a place by the cell it is cut on.
const frameOf = (hp) => {
  const quad = (brickColourOf(hp) - 1) * 4 + brickTierOf(hp)
  return `${(quad % 6) * BRICK_WIDTH},${Math.floor(quad / 6) * BRICK_HEIGHT}`
}
check(
  brickList.every(({ hp }) => hp >= 1 && hp <= 4),
  `every brick is worth between one and four hits on the first level (${[...new Set(brickList.map((b) => b.hp))].sort().join(", ")})`,
)
check(
  brickList.every(({ image, hp }) => `${image.x},${image.y}` === frameOf(hp)),
  "each brick cropped from the frame however many hits it has left put it",
)
// A row is solid or alternating or skipping, and a row is one of the three all the way
// along: bricks in a row that share a colour and a tier are all of them or none of them.
const byRow = new Map()
for (const brick of brickList) {
  const row = Math.round((243 - brick.position[1]) / 16) - 1
  byRow.set(row, [...(byRow.get(row) ?? []), brick])
}
check(
  [...byRow.values()].every((bricks) => {
    const cells = bricks.map(({ position }) => position[0])
    const skipping = cells.some((x, i) => i > 0 && x - cells[i - 1] === 64)
    const solid =
      new Set(bricks.map(({ color, tier }) => `${color},${tier}`)).size === 1

    // A skipping row says nothing about its colours, because it never got to choose.
    return (
      skipping ||
      solid ||
      new Set(bricks.map((b) => `${b.color},${b.tier}`)).size <= 2
    )
  }),
  "every row is one pattern the whole way along",
)

// The levelmaker is reached here directly, because a single game only ever plays the
// first level and so cannot show what a later one asks for. Every level is bounded by its
// own colour and tier reach, which is what stops a late level asking for a frame that is
// not on the sheet.
const LEVEL_ROLLS = 60
const LEVELS = [1, 4, 5, 9, 20, 24, 100]
const rolled = LEVELS.flatMap((level) =>
  Array.from({ length: LEVEL_ROLLS }, () => createLevel(level, 0)),
)
check(
  rolled.every((bricks) => bricks.length > 0),
  `every level made something (${rolled.length} levels)`,
)
check(
  LEVELS.every((level) => {
    const highestTier = Math.min(3, Math.floor(level / 5))
    const highestColor = Math.min(5, (level % 5) + 3)

    return Array.from({ length: LEVEL_ROLLS }, () => createLevel(level, 0))
      .flat()
      .every(
        ({ hp }) =>
          brickColourOf(hp) <= highestColor && brickTierOf(hp) <= highestTier,
      )
  }),
  "and nothing on it went past the colours and tiers its level allows",
)
check(
  rolled.every(
    (bricks) => new Set(bricks.map(({ id }) => id)).size === bricks.length,
  ),
  "with no two bricks in a level sharing a name",
)
// The palette is rolled rather than fixed, so across enough levels more than one colour
// has to turn up -- which a single level cannot promise, since every one of its rows may
// roll solid on the same colour.
check(
  new Set(rolled.flat().map(({ hp }) => hp)).size > 1,
  `and the bricks are rolled, not fixed (${[...new Set(rolled.flat().map((b) => b.hp))].sort().join(", ")})`,
)
check(
  Array.from({ length: LEVEL_ROLLS }, () => createLevel(1, 0)).every((bricks) =>
    paddedForOddColumns(Math.min(...bricks.map(({ position }) => position[0]))),
  ),
  "every level is padded for an odd number of columns",
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

// A life back. A brick is worth points, and enough points is worth a life -- and the bar
// for it doubles every time one is recovered, so the gaps grow the further on the game
// gets. This is the one thing a player earns back rather than loses.
const recovered = new Engine(gameConfig)
const healState = () => recovered.getState()
const healStep = (n = 1) => {
  for (let i = 0; i < n; i++) recovered.update(1 / 60)
}
const healSounds = []
const healAudio = recovered._store.getType("Audio")
const healPlaySound = healAudio.soundPlay
healAudio.soundPlay = function sound(entity, name) {
  healSounds.push(name)
  return healPlaySound.call(this, entity, name)
}
const healPress = (code) => {
  recovered._store.notify("keyboardKeyDown", code)
  recovered._store.notify("keyboardKeyUp", code)
  healStep(2)
}

// The engine announces `start` and then begins the loop. There is no loop to run here,
// so the announcement is made on its own -- which is still the whole of what `start` does.
recovered._store.notify("start")
healStep(4)
healPress("Enter")
healPress("Enter")
healPress("Enter")
check(healState().game.state === "play", "a game of its own reaches the play")
check(
  whiteLines(healState()).length === 0,
  `and every line in play is white too (${whiteLines(healState())
    .map(([id]) => id)
    .join(", ")})`,
)
check(
  healState().game.recoverPoints === 3000,
  "healing starts at three thousand points",
)
check(healState().game.health === 3, "with every life already in hand")
check(healSounds.includes("music"), "and the music running under it all")

// Under the bar, a life is not earned.
const healBricks = Object.keys(healState()).filter((id) =>
  id.startsWith("brick"),
)
const healBrick = healBricks[0]
healState()[healBrick].hp = 1
healState().ball.position = [
  healState()[healBrick].position[0] + 12,
  healState()[healBrick].position[1] - 4,
  0,
]
healState().ball.velocity = [0, 0, 0]
healStep(1)
check(
  healState().game.score < 3000,
  `a first brick is under the bar (${healState().game.score})`,
)
check(healState().game.health === 3, "so no life is recovered")

// Over it, a life is.
const recoverSoundsBefore = healSounds.length
healState().game.score = 3001
const healBricksAfter = Object.keys(healState()).filter((id) =>
  id.startsWith("brick"),
)
const healBrickAfter = healBricksAfter.find((id) => id !== healBrick)
healState()[healBrickAfter].hp = 1
healState().ball.position = [
  healState()[healBrickAfter].position[0] + 12,
  healState()[healBrickAfter].position[1] - 4,
  0,
]
healState().ball.velocity = [0, 0, 0]
healStep(1)
check(
  healState().game.health === 3,
  "still no life at three lives already in hand",
)
check(
  healState().game.recoverPoints === 6000,
  "but the bar has doubled to six thousand",
)
check(
  healSounds.slice(recoverSoundsBefore).includes("recover"),
  "and the recovering sound",
)
check(
  healSounds.filter((name) => name === "music").length === 1,
  "the music played once, not per state",
)
