import { createGame } from "@inglorious/engine/test.js"
import { beforeEach, describe, expect, test } from "vitest"

import { createMouseEntity, mouse } from "./mouse.js"

const ON_THE_BUTTON = [400, 0, 300]
const OFF_THE_BUTTON = [700, 0, 100]

describe("the mouse", () => {
  let game
  let said

  beforeEach(() => {
    // What the mouse says is recorded by something that can hear it, rather than by
    // standing in for the api: the events themselves are what a game acts on, so a test
    // that watched the api would pass even if nothing ever received them.
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
    // A press carries a position like any other, so the cursor is drawn under the finger
    // even on the very first touch of the page.
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
    // given a press on the button, and then a drag off it -- which is what every slider
    // in the game does the moment it is nudged
    game.notify("mouseDown", ON_THE_BUTTON).step()

    // when the pointer is let go somewhere else entirely
    game.notify("mouseUp", OFF_THE_BUTTON).step()

    // then the button is released rather than the empty scene under the pointer, which
    // would otherwise leave it stuck pressed for the rest of the game
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
