import { beforeEach, describe, expect, test } from "vitest"

import { createGame } from "../../test.js"
import { button } from "./button.js"

describe("a button", () => {
  let game

  beforeEach(() => {
    game = createGame({
      types: { Button: [button()] },
      entities: {
        game: { type: "Game", size: [800, 600] },
        one: { type: "Button", position: [400, 0, 300], size: [100, 0, 50] },
        two: { type: "Button", position: [500, 0, 300], size: [100, 0, 50] },
      },
    })
  })

  test("looks pressed while it is pressed", () => {
    game.notify("entityPress", "one")
    game.step()

    expect(game.entity("one").state).toBe("pressed")
  })

  test("stops looking pressed when let go", () => {
    game.notify("entityPress", "one")
    game.step()

    game.notify("entityRelease", "one")
    game.step()

    expect(game.entity("one").state).toBe("default")
  })

  test("pressing one button does not press them all", () => {
    // A press is told to every entity that can hear about one, so a button has to read
    // the id out of the report -- otherwise a game with any two buttons has none.
    game.notify("entityPress", "one")
    game.step()

    expect(game.entity("one").state).toBe("pressed")
    expect(game.entity("two").state).toBe("default")
  })

  test("letting go of one button does not let go of them all", () => {
    game.notify("entityPress", "one")
    game.notify("entityPress", "two")
    game.step()

    game.notify("entityRelease", "one")
    game.step()

    expect(game.entity("one").state).toBe("default")
    expect(game.entity("two").state).toBe("pressed")
  })

  test("a click on its own leaves it alone", () => {
    // A browser says `click` once the pointer is already up. A button that took its cue
    // from it would latch down here and have nothing left to lift it again.
    game.notify("entityClick", "one")
    game.step()

    expect(game.entity("one").state).toBe("default")
  })

  test("it starts off not pressed", () => {
    game.step()

    expect(game.entity("one").state).toBe("default")
  })
})
