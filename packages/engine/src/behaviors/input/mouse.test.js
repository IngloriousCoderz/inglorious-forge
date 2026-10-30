import { beforeEach, describe, expect, test } from "vitest"

import { createGame } from "../../test.js"
import { createMouseEntity, mouse } from "./mouse.js"

const ON_THE_BUTTON = [400, 0, 300]
const OFF_THE_BUTTON = [700, 0, 100]

describe("the mouse", () => {
  let game
  let said

  beforeEach(() => {
    said = []

    const listening = () => ({
      create(entity) {
        entity.presses = []
        entity.releases = []
        entity.scenePresses = []
        entity.sceneReleases = []
      },

      entityPress(entity, id) {
        entity.presses.push(id)
      },

      entityRelease(entity, id) {
        entity.releases.push(id)
      },

      scenePress(entity, position) {
        entity.scenePresses.push(position)
      },

      sceneRelease(entity, position) {
        entity.sceneReleases.push(position)
      },
    })

    game = createGame({
      types: {
        Mouse: [mouse()],
        Button: {},
        Ear: [listening()],
      },
      entities: {
        game: { type: "Game", size: [800, 600] },
        mouse: createMouseEntity(),
        ear: { type: "Ear" },
        button: {
          type: "Button",
          position: ON_THE_BUTTON,
          size: [100, 0, 50],
          solid: true,
        },
      },
    })

    said = new Proxy(
      {},
      {
        get: (_, type) => game.entity("ear")[type],
      },
    )
  })

  test("it follows the pointer about", () => {
    game.notify("mouseMove", ON_THE_BUTTON).step()

    expect(game.entity("mouse").position).toEqual(ON_THE_BUTTON)
  })

  test("it is moved by a press as well as by a move", () => {
    game.notify("mouseDown", ON_THE_BUTTON).step()

    expect(game.entity("mouse").position).toEqual(ON_THE_BUTTON)
  })

  test("a press on a thing says that thing was pressed", () => {
    game.notify("mouseDown", ON_THE_BUTTON).step()

    expect(said.presses).toEqual(["button"])
  })

  test("a press on nothing says the scene was pressed", () => {
    game.notify("mouseDown", OFF_THE_BUTTON).step()

    expect(said.scenePresses).toEqual([OFF_THE_BUTTON])
  })

  test("a release belongs to the press that started it", () => {
    game.notify("mouseDown", ON_THE_BUTTON).step()

    game.notify("mouseUp", OFF_THE_BUTTON).step()

    expect(said.releases).toEqual(["button"])
    expect(said.sceneReleases).toEqual([])
  })

  test("a release with no press behind it says the scene was released", () => {
    game.notify("mouseUp", OFF_THE_BUTTON).step()

    expect(said.sceneReleases).toEqual([OFF_THE_BUTTON])
  })

  test("a press that is over and done with is not released twice", () => {
    game.notify("mouseDown", ON_THE_BUTTON).step()
    game.notify("mouseUp", ON_THE_BUTTON).step()

    game.notify("mouseUp", ON_THE_BUTTON).step()

    expect(said.releases).toEqual(["button"])
    expect(said.sceneReleases).toEqual([ON_THE_BUTTON])
  })
})
