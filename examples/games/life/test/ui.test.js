import { createGame } from "@inglorious/engine/test"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { createFoxesAndRabbits } from "../src/foxes-and-rabbits/index.js"
import { createGameOfLife } from "../src/game-of-life/index.js"

const A_FRAME = 1

const EVERY_FRAME = Infinity

describe("the controls on the screen", () => {
  let game

  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    game = createGame(createGameOfLife({ fps: EVERY_FRAME }))
  })

  test("there is a pause button and a reset button", () => {
    expect(game.entity("pause").action).toBe("togglePause")
    expect(game.entity("reset").action).toBe("reset")
  })

  test("a button is somewhere you can press", () => {
    game.step(A_FRAME)
    const { hitbox } = game.entity("pause").collisions

    expect(hitbox.shape).toBe("rectangle")
  })

  test("pressing a button says it looks pressed", () => {
    game.notify("entityPress", "pause")
    game.step(A_FRAME)

    expect(game.entity("pause").state).toBe("pressed")
  })

  test("letting go of a button takes the pressed look off", () => {
    game.notify("entityPress", "pause")
    game.step(A_FRAME)

    game.notify("entityRelease", "pause")
    game.step(A_FRAME)

    expect(game.entity("pause").state).toBe("default")
  })

  test("pressing pause stops the world turning", () => {
    game.step(2 * A_FRAME)

    game.notify("entityPress", "pause")
    game.step(2 * A_FRAME)
    const before = game.entity("board").generation

    game.step(5 * A_FRAME)

    expect(game.entity("game").paused).toBe(true)
    expect(game.entity("board").generation).toBe(before)
  })

  test("pressing pause again sets the world going", () => {
    game.notify("entityPress", "pause")
    game.step(A_FRAME)
    expect(game.entity("game").paused).toBe(true)

    game.notify("entityRelease", "pause")
    game.step(A_FRAME)
    game.notify("entityPress", "pause")
    game.step(A_FRAME)

    expect(game.entity("game").paused).toBe(false)

    game.step(2 * A_FRAME)
    const generation = game.entity("board").generation
    game.step(2 * A_FRAME)

    expect(game.entity("board").generation).toBeGreaterThan(generation)
  })

  test("a button says what it did rather than doing it", () => {
    game.notify("entityPress", "reset")
    game.step(A_FRAME)

    game.step(2 * A_FRAME)
    const generation = game.entity("board").generation
    game.step(3 * A_FRAME)

    expect(game.entity("board").generation).toBeGreaterThan(generation)
  })

  test("reset puts the board back to how it started", () => {
    game.step(20 * A_FRAME)
    const wandered = livingCells(game)

    game.notify("entityPress", "reset")
    game.step(2 * A_FRAME)

    expect(game.entity("board").generation).toBeLessThanOrEqual(2)
    expect(livingCells(game)).toBeLessThan(wandered)
  })

  test("the readout says how the world is getting on", () => {
    game.step(A_FRAME)

    expect(game.entity("readout").value).toMatch(/^Generation \d+ - \d+ cells$/)
  })

  test("the readout sits above the panel rather than on the board", () => {
    const { position } = game.entity("readout")

    expect(position[2]).toBeGreaterThan(500)
  })

  test("the frame rate is on the screen", () => {
    game.step(70 * A_FRAME)

    expect(game.entity("fps").dt.value).toBeCloseTo(0.016)
  })

  test("the frame rate sits over the board rather than on it", () => {
    const { position } = game.entity("fps")

    expect(position[2]).toBeGreaterThan(500)
    expect(position[0]).toBeLessThan(640)
  })
})

describe("the sliders on the screen", () => {
  let game

  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    game = createGame(createFoxesAndRabbits({ fps: EVERY_FRAME }))
  })

  test("there is a slider for every number the world runs on", () => {
    const sliders = Object.values(game.state()).filter(
      ({ type }) => type === "Slider",
    )

    expect(sliders).toHaveLength(13)
  })

  test("a slider starts where its number is", () => {
    expect(game.entity("Fox-breedingAge").value).toBe(10)
    expect(game.entity("Rabbit-maxLitter").value).toBe(5)
    expect(game.entity("start-fox").value).toBe(0.02)
  })

  test("a slider knows the range its number is allowed in", () => {
    const { min, max, step } = game.entity("Fox-reproductionProbability")

    expect([min, max, step]).toEqual([0, 1, 0.01])
  })

  test("dragging a slider moves its number", () => {
    game.notify("entityPress", "Fox-breedingAge").step()

    game.notify("mouseMove", [810, 0, 300]).step()

    expect(game.entity("Fox-breedingAge").value).toBe(1)
  })

  test("a slider keeps working while the world is paused", () => {
    game.notify("entityPress", "pause").step()
    expect(game.entity("game").paused).toBe(true)

    game.notify("entityPress", "Fox-breedingAge").step()
    game.notify("mouseMove", [810, 0, 300]).step()

    expect(game.entity("Fox-breedingAge").value).toBe(1)
  })

  test("the pointer is an arrow, and a hand over a control", () => {
    game.step(A_FRAME)
    expect(game.entity("mouse").cursor).toBe("arrow")

    const { position } = game.entity("Fox-breedingAge")
    game.notify("mouseMove", position).step()

    expect(game.entity("mouse").cursor).toBe("hand")

    game.notify("mouseMove", [400, 0, 300]).step()
    expect(game.entity("mouse").cursor).toBe("arrow")
  })

  test("a slider that is changed changes the world", () => {
    expect(animals(game, "Fox").length).toBeGreaterThan(0)

    game.notify("entityPress", "start-fox").step()
    game.notify("mouseMove", [810, 0, 300]).step()
    game.notify("entityRelease", "start-fox").step()
    game.notify("entityPress", "reset").step()
    game.step(2 * A_FRAME)

    expect(animals(game, "Fox")).toHaveLength(0)
    expect(animals(game, "Rabbit").length).toBeGreaterThan(0)
  })
})

/** How many cells there are on the board. */
function livingCells(game) {
  return Object.values(game.state()).filter((entity) => entity.type === "Cell")
    .length
}

/** Every animal in the world, of one kind if asked. */
function animals(game, type) {
  const living = Object.values(game.state()).filter((entity) =>
    ["Fox", "Rabbit"].includes(entity.type),
  )

  return type ? living.filter((animal) => animal.type === type) : living
}
