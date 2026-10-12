import { createGame } from "@inglorious/engine/test"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { createFoxesAndRabbits } from "../src/foxes-and-rabbits/index.js"
import { createGameOfLife } from "../src/game-of-life/index.js"

const A_FRAME = 1

describe("the controls on the screen", () => {
  let game

  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    game = createGame(createGameOfLife())
  })

  test("there is a pause button and a reset button", () => {
    expect(game.entity("pause").action).toBe("togglePause")
    expect(game.entity("reset").action).toBe("reset")
  })

  test("a button is somewhere you can press", () => {
    // given a button that was never told what shape it is
    game.step(A_FRAME)
    const { hitbox } = game.entity("pause").collisions

    // then it is a rectangle anyway, because a button with a size is pressable
    expect(hitbox.shape).toBe("rectangle")
  })

  test("pressing a button says it looks pressed", () => {
    // when the pause button is pressed
    game.notify("entityPress", "pause")
    game.step(A_FRAME)

    // then it is pressed
    expect(game.entity("pause").state).toBe("pressed")
  })

  test("letting go of a button takes the pressed look off", () => {
    game.notify("entityPress", "pause")
    game.step(A_FRAME)

    // when the pointer comes up
    game.notify("entityRelease", "pause")
    game.step(A_FRAME)

    // then it is not pressed any more, which is what would not happen if nothing in the
    // engine ever reported a release
    expect(game.entity("pause").state).toBe("default")
  })

  test("pressing pause stops the world turning", () => {
    // given a world that is turning
    game.step(2 * A_FRAME)

    // when pause is pressed, and a frame goes past for the pause to arrive
    game.notify("entityPress", "pause")
    game.step(2 * A_FRAME)
    const before = game.entity("board").generation

    // and more frames go by
    game.step(5 * A_FRAME)

    // then nothing more happens, and the board keeps the generation it was left on
    expect(game.entity("game").paused).toBe(true)
    expect(game.entity("board").generation).toBe(before)
  })

  test("pressing pause again sets the world going", () => {
    game.notify("entityPress", "pause")
    game.step(A_FRAME)
    expect(game.entity("game").paused).toBe(true)

    // when it is pressed again
    game.notify("entityRelease", "pause")
    game.step(A_FRAME)
    game.notify("entityPress", "pause")
    game.step(A_FRAME)

    // then the world is turning once more
    expect(game.entity("game").paused).toBe(false)

    game.step(2 * A_FRAME)
    const generation = game.entity("board").generation
    game.step(2 * A_FRAME)

    expect(game.entity("board").generation).toBeGreaterThan(generation)
  })

  test("a button says what it did rather than doing it", () => {
    // pressing reset is said out loud, and the world listens -- which is what lets one
    // Button type serve every button in the game
    game.notify("entityPress", "reset")
    game.step(A_FRAME)

    game.step(2 * A_FRAME)
    const generation = game.entity("board").generation
    game.step(3 * A_FRAME)

    expect(game.entity("board").generation).toBeGreaterThan(generation)
  })

  test("reset puts the board back to how it started", () => {
    // given a world that has run for a good while and wandered a long way from where
    // it began
    game.step(20 * A_FRAME)
    const wandered = livingCells(game)

    // when it is reset
    game.notify("entityPress", "reset")
    game.step(2 * A_FRAME)

    // then it is counting from zero again, and the board is back down to the few cells
    // it started with rather than the many it had wandered into
    expect(game.entity("board").generation).toBeLessThanOrEqual(2)
    expect(livingCells(game)).toBeLessThan(wandered)
  })

  test("the readout says how the world is getting on", () => {
    game.step(A_FRAME)

    expect(game.entity("readout").value).toMatch(/^Generation \d+ - \d+ cells$/)
  })

  test("the readout sits above the panel rather than on the board", () => {
    // given a readout
    const { position } = game.entity("readout")

    // then it is up in the margin, where no cell will ever draw over it
    expect(position[2]).toBeGreaterThan(500)
  })

  test("the frame rate is on the screen", () => {
    // given a world that has been turning for a good while
    game.step(70 * A_FRAME)

    // then the counter has ticked over and says how long a frame is taking
    expect(game.entity("fps").dt.value).toBeCloseTo(0.016)
  })

  test("the frame rate sits over the board rather than on it", () => {
    const { position } = game.entity("fps")

    // up in the top margin, off to the left where the panel is not
    expect(position[2]).toBeGreaterThan(500)
    expect(position[0]).toBeLessThan(640)
  })
})

describe("the sliders on the screen", () => {
  let game

  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    game = createGame(createFoxesAndRabbits())
  })

  test("there is a slider for every number the world runs on", () => {
    const sliders = Object.values(game.state()).filter(
      ({ type }) => type === "Slider",
    )

    // seven numbers a fox lives by, four a rabbit lives by, and two for how many of
    // each the world starts with
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
    // given the breeding-age slider, whose track runs from 810 to 950
    game.notify("entityPress", "Fox-breedingAge").step()

    // when it is dragged to the far left end
    game.notify("mouseMove", [810, 0, 300]).step()

    // then it sits on the bottom of its range
    expect(game.entity("Fox-breedingAge").value).toBe(1)
  })

  test("a slider keeps working while the world is paused", () => {
    // given a world that has been stopped
    game.notify("entityPress", "pause").step()
    expect(game.entity("game").paused).toBe(true)

    // when a slider is dragged
    game.notify("entityPress", "Fox-breedingAge").step()
    game.notify("mouseMove", [810, 0, 300]).step()

    // then it still follows the pointer, because only `update` is halted and a drag is
    // not an update
    expect(game.entity("Fox-breedingAge").value).toBe(1)
  })

  test("the pointer is an arrow, and a hand over a control", () => {
    // given a world that is up and standing, and the everyday pointer
    game.step(A_FRAME)
    expect(game.entity("mouse").cursor).toBe("arrow")

    // when it moves onto a slider
    const { position } = game.entity("Fox-breedingAge")
    game.notify("mouseMove", position).step()

    // then it offers a hand, and takes it back when it leaves again
    expect(game.entity("mouse").cursor).toBe("hand")

    game.notify("mouseMove", [400, 0, 300]).step()
    expect(game.entity("mouse").cursor).toBe("arrow")
  })

  test("a slider that is changed changes the world", () => {
    // given the dice always come up fox, so the board starts full of them
    expect(animals(game, "Fox").length).toBeGreaterThan(0)

    // when foxes are turned off at the start and the world is begun again
    game.notify("entityPress", "start-fox").step()
    game.notify("mouseMove", [810, 0, 300]).step()
    game.notify("entityRelease", "start-fox").step()
    game.notify("entityPress", "reset").step()
    game.step(2 * A_FRAME)

    // then there is not a fox left on it, because every square rolled a rabbit instead
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
