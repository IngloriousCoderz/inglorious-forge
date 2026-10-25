import { fsm } from "@inglorious/store/behaviors/state-machine/fsm.js"

/**
 * A button that looks pressed while it is being pressed.
 *
 * It answers a press rather than a click, because a browser says `click` only after the
 * pointer is already up again: a button that pressed on `click` would latch down and
 * stay that way, with nothing left to lift it.
 *
 * It announces that it was pressed the way any state machine does -- through
 * `stateChange` -- so whatever the button is *for* is said elsewhere rather than here:
 * a button knows how it looks, not what it does.
 */
export function button() {
  return fsm({
    default: {
      entityPress(entity, id) {
        if (id !== entity.id) return

        entity.state = "pressed"
      },
    },

    pressed: {
      entityRelease(entity, id) {
        if (id !== entity.id) return

        entity.state = "default"
      },
    },
  })
}
