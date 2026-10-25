import { beforeEach, describe, expect, test } from "vitest"

import { createGame } from "../../test.js"
import { slider } from "./slider.js"

// A slider 100 wide, centred on x = 500, so its track runs from 450 to 550.
const A_SLIDER = {
  type: "Slider",
  position: [500, 0, 300],
  size: [100, 0, 20],
  min: 0,
  max: 10,
  step: 1,
}

const ON_THE_LEFT_END = [450, 0, 300]
const ON_THE_RIGHT_END = [550, 0, 300]
const THE_MIDDLE = [500, 0, 300]

describe("a slider", () => {
  let game

  beforeEach(() => {
    game = createGame({
      types: {
        Slider: [slider()],
        Ear: [
          {
            create(entity) {
              entity.changes = []
            },

            valueChange(entity, change) {
              entity.changes.push(change)
            },
          },
        ],
      },
      entities: {
        game: { type: "Game", size: [800, 600] },
        ear: { type: "Ear" },
        one: { ...A_SLIDER, id: "one" },
        two: { ...A_SLIDER, id: "two", position: [100, 0, 100] },
      },
    })
  })

  /** What the sliders have told the world so far. */
  function changes() {
    return game.entity("ear").changes
  }

  test("it starts at the bottom of its range", () => {
    game.step()

    expect(game.entity("one").value).toBe(0)
  })

  test("it keeps the value it was given rather than snapping to the range", () => {
    game = createGame({
      types: { Slider: [slider()] },
      entities: {
        game: { type: "Game", size: [800, 600] },
        one: { ...A_SLIDER, min: 0, max: 10, value: 4 },
      },
    })
    game.step()

    expect(game.entity("one").value).toBe(4)
  })

  test("it is somewhere you can press", () => {
    // given a slider that was never told what shape it is
    game.step()
    const { hitbox } = game.entity("one").collisions

    // then it is a rectangle anyway, because a slider with a size is draggable
    expect(hitbox.shape).toBe("rectangle")
  })

  test("the pointer alone does not move it", () => {
    // given a slider nobody has touched
    game.step()

    // when the pointer moves right across it
    game.notify("mouseMove", ON_THE_RIGHT_END).step()

    // then it stays where it was, because only a slider being dragged follows a pointer
    expect(game.entity("one").value).toBe(0)
  })

  test("it follows the pointer once it has been pressed", () => {
    game.notify("entityPress", "one").step()
    game.notify("mouseMove", ON_THE_RIGHT_END).step()

    expect(game.entity("one").value).toBe(10)
  })

  test("the far end of the track is the top of its range", () => {
    game.notify("entityPress", "one").step()
    game.notify("mouseMove", ON_THE_LEFT_END).step()

    expect(game.entity("one").value).toBe(0)
  })

  test("the middle of the track is halfway up its range", () => {
    game.notify("entityPress", "one").step()
    game.notify("mouseMove", THE_MIDDLE).step()

    expect(game.entity("one").value).toBe(5)
  })

  test("it will not go past either end, however far the pointer goes", () => {
    game.notify("entityPress", "one").step()

    game.notify("mouseMove", [-500, 0, 300]).step()
    expect(game.entity("one").value).toBe(0)

    game.notify("mouseMove", [5000, 0, 300]).step()
    expect(game.entity("one").value).toBe(10)
  })

  test("it stays put when it is let go", () => {
    game.notify("entityPress", "one").step()
    game.notify("mouseMove", THE_MIDDLE).step()
    game.notify("entityRelease", "one").step()

    // when the pointer carries on without it
    game.notify("mouseMove", ON_THE_RIGHT_END).step()

    // then it is left where it was let go
    expect(game.entity("one").value).toBe(5)
  })

  test("it only moves when the value really changes", () => {
    game.notify("entityPress", "one").step()

    game.notify("mouseMove", THE_MIDDLE).step()
    game.notify("mouseMove", THE_MIDDLE).step()

    // A drag crosses far more pixels than a slider has steps, so announcing every one of
    // them would be a hundred reports of the same number.
    expect(changes()).toEqual([{ entityId: "one", value: 5 }])
  })

  test("it says which slider moved", () => {
    // thirteen of them on one screen means every slider hears about every other
    game.notify("entityPress", "two").step()
    game.notify("mouseMove", ON_THE_RIGHT_END).step()

    expect(changes()).toEqual([{ entityId: "two", value: 10 }])
  })

  test("dragging one leaves the other alone", () => {
    game.notify("entityPress", "one").step()
    game.notify("mouseMove", ON_THE_RIGHT_END).step()

    expect(game.entity("two").value).toBe(0)
  })

  test("it sits on the nearest step", () => {
    game = createGame({
      types: { Slider: [slider()] },
      entities: {
        game: { type: "Game", size: [800, 600] },
        one: { ...A_SLIDER, min: 0, max: 1, step: 0.25 },
      },
    })

    game.notify("entityPress", "one").step()
    game.notify("mouseMove", [501, 0, 300]).step()

    // A step of a quarter of the way along a hundred pixels is six pixels and a bit, so
    // a pixel past the middle is nearer the next step than the last one.
    expect(game.entity("one").value).toBe(0.5)
  })

  test("it moves freely when nothing asks for whole numbers", () => {
    game = createGame({
      types: { Slider: [slider()] },
      entities: {
        game: { type: "Game", size: [800, 600] },
        one: { ...A_SLIDER, min: 0, max: 1, step: 0 },
      },
    })

    game.notify("entityPress", "one").step()
    game.notify("mouseMove", [501, 0, 300]).step()

    expect(game.entity("one").value).toBeCloseTo(0.51)
  })
})
