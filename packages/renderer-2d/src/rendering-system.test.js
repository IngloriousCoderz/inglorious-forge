import { renderingSystem } from "@inglorious/renderer-2d/rendering-system.js"
import { expect, test } from "vitest"

import { callsTo, createContext } from "./test/canvas.js"

const A_VIEWPORT = [800, 600]
const NO_LAYER = 0

test("it should start with a canvas cleared in the colour of the game", () => {
  // given a game that wants a dark background
  const { calls } = drawing({ game: aGame({ backgroundColor: "black" }) })

  // then the first thing it does is paint the whole canvas that colour
  const [, , , width, height] = callsTo(calls, "fillRect")[0]

  expect(callsTo(calls, "fillStyle")[0]).toEqual(["fillStyle", "black"])
  expect([width, height]).toEqual(A_VIEWPORT)
})

test("it should start with a canvas cleared in a light colour when the game has no say", () => {
  expect(callsTo(drawing({}).calls, "fillStyle")[0]).toEqual([
    "fillStyle",
    "lightgrey",
  ])
})

test("it should put the world back the way it found it", () => {
  // The camera moves every pixel on screen, so a renderer that forgets to put it back
  // would move the next renderer's world too.
  const { calls } = drawing({ entities: { ball: anEntity("ball", [10, 20]) } })

  // The clear comes first, then the world is saved before it is moved about
  expect(calls[0][0]).toBe("fillStyle")
  expect(calls.at(-1)[0]).toBe("restore")
})

test("it should not draw something that is not in the world", () => {
  // given a world
  const { calls } = drawing({
    entities: { ball: anEntity("ball", [10, 20]), ghost: { type: "Ball" } },
  })

  // then the ball is drawn and the thing with no position is skipped, because there is
  // nothing to put on the canvas
  expect(rendered(calls)).toEqual(["ball"])
})

test("it should draw the further things first", () => {
  // given two things on the same layer, one behind the other
  const { calls } = drawing({
    entities: {
      behind: anEntity("behind", [0, 0, 100]),
      ahead: anEntity("ahead", [0, 0, 0]),
    },
  })

  // then the one further away is drawn first and the nearer one lands on top of it
  expect(rendered(calls)).toEqual(["behind", "ahead"])
})

test("it should draw things on separate layers in the order they are numbered", () => {
  // given a front on a lower layer than a back -- the opposite of what you would guess
  const { calls } = drawing({
    entities: {
      front: anEntity("front", [0, 0, 100], 1),
      back: anEntity("back", [0, 0, 0], 0),
    },
  })

  // then the layers win over the position
  expect(rendered(calls)).toEqual(["back", "front"])
})

test("it should draw something from the pool as if it were in the world", () => {
  // given something borrowed out of a pool rather than named in the world
  const { calls } = drawing({
    entities: {},
    pooled: [anEntity("pooled", [0, 0])],
  })

  // then it is drawn all the same
  expect(rendered(calls)).toEqual(["pooled"])
})

test("it should follow the camera when the game is not being developed", () => {
  // given a camera looking at a corner of the world
  const { calls } = drawing({
    entities: { camera: aCamera([100, 0, 200]) },
    game: aGame(),
  })

  // then the world is moved so that the camera is in the middle of the screen: centre,
  // zoom, undo the flip the position decorator puts in, and finally follow the camera
  // The camera is the first thing drawn and it stands where it is too, so its three moves
  // to the world come before its one move to itself.
  expect(moved(calls).slice(0, 3)).toEqual([
    [A_VIEWPORT[0] / 2, A_VIEWPORT[1] / 2],
    [0, -A_VIEWPORT[1]],
    [-100, 200],
  ])
})

test("it should not follow the camera while the game is being developed", () => {
  // given the same camera, and the game in dev mode
  const { calls } = drawing({
    entities: { camera: aCamera([100, 0, 200]) },
    game: aGame({ devMode: true }),
  })

  // then the world is left where it is, because a developer needs to see all of it
  expect(moved(calls)).not.toContainEqual([0, -A_VIEWPORT[1]])
})

test("it should leave a camera that is switched off alone", () => {
  const { calls } = drawing({
    entities: { camera: aCamera([100, 0, 200], false) },
    game: aGame(),
  })

  expect(moved(calls)).not.toContainEqual([0, -A_VIEWPORT[1]])
})

test("it should bring the camera closer by how much it is zoomed in", () => {
  const { calls } = drawing({
    entities: { camera: aCamera([0, 0, 0], true, 2) },
    game: aGame(),
  })

  expect(callsTo(calls, "scale")[0]).toEqual(["scale", 2, 2])
})

test("it should leave a camera with no zoom as it is", () => {
  const { calls } = drawing({
    entities: { camera: aCamera([0, 0, 0]) },
    game: aGame(),
  })

  expect(callsTo(calls, "scale")[0]).toEqual(["scale", 1, 1])
})

/**
 * Where the world was moved to, as opposed to where the things in it were put.
 *
 * The camera is the first thing drawn, so its moves come first; everything after belongs
 * to the entities, which each get a move of their own to stand them where they belong.
 */
function moved(calls) {
  return callsTo(calls, "translate").map(([, x, y]) => [x, y])
}

/** The names of the renderers that were used, in the order they were used. */
function rendered(calls) {
  return callsTo(calls, "fillText").map(([, name]) => name)
}

/** What one update of the world asks a canvas to do. */
function drawing({ entities = {}, game = aGame(), pooled = [] } = {}) {
  const { calls, ctx } = createContext()
  const system = renderingSystem({ getContext: () => ctx })

  system.update({ game, ...entities }, 0, {
    getType: () => ({ render: aRenderer() }),
    getAllActivePoolEntities: () => pooled,
    // The position decorator asks how tall the game is, to know which way up it is.
    getEntity: () => game,
  })

  return { calls }
}

function aGame(properties = {}) {
  return { type: "Game", size: A_VIEWPORT, ...properties }
}

function anEntity(name, position, layer = NO_LAYER) {
  return { type: name, position, layer }
}

function aCamera(position, isActive = true, zoom) {
  return { type: "Camera", position, isActive, zoom }
}

/** A renderer that writes its own name onto the canvas, so the order is easy to read. */
function aRenderer() {
  return (entity, ctx) => {
    ctx.save()
    ctx.fillText(entity.type, 0, 0)
    ctx.restore()
  }
}
