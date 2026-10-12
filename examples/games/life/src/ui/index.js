import { button } from "@inglorious/engine/behaviors/ui/button.js"
import { slider } from "@inglorious/engine/behaviors/ui/slider.js"
import { renderButton } from "@inglorious/renderer-2d/form/button.js"
import { renderSlider } from "@inglorious/renderer-2d/form/slider.js"
import { renderText } from "@inglorious/renderer-2d/text.js"

/**
 * A button that says what it did rather than doing it.
 *
 * The state machine owns the looking-pressed part, and takes over `entityPress`
 * entirely, so a button cannot listen for the press itself. It listens instead for the
 * state machine announcing that it moved -- which is what that announcement is for, and
 * what lets one Button type serve every button in a game.
 */
export function pressable() {
  return {
    stateChange(entity, { entityId, to }, api) {
      if (entityId === entity.id && to === "pressed") {
        api.notify(entity.action)
      }
    },
  }
}

export function buttonType() {
  return [
    {
      // Before the state machine, because a behaviour's `create` replaces any that came
      // before it rather than running alongside: put last, this would quietly take over
      // the one that gives the button its starting state, and every event would then
      // look for a state the button does not have.
      create(entity) {
        // A button with a size is a button you can press. Saying so here means a game
        // does not have to describe the same rectangle twice: once to draw it and once
        // to be hit by it.
        entity.collisions ??= {}
        entity.collisions.hitbox ??= { shape: "rectangle" }
      },

      pause(entity) {
        if (entity.id === "pause") entity.label = "Resume"
      },

      resume(entity) {
        if (entity.id === "pause") entity.label = "Pause"
      },
    },
    button(),
    pressable(),
    { render: renderButton },
  ]
}

/** A line of text that says whatever it is told to say. */
export function readoutType() {
  return [{ render: renderText }]
}

/**
 * A slider that writes the number it is dragged to into the rules of its world.
 *
 * The slider behaviour owns the dragging; this owns the meaning. Each slider carries
 * the `species` and `parameter` it stands for on itself, and reads its own id back out
 * of the announcement -- so one Slider type serves every slider in the game, the same
 * way one Button type serves every button.
 *
 * @param {Object} parameters - The numbers the sliders change, which the world also
 * reads while it runs. Written to rather than replaced, because the world is already
 * holding onto the same object.
 */
export function sliderType(parameters) {
  return [slider(), tweakable(parameters), { render: renderSlider }]
}

/**
 * Writes a slider's number into the rules, when the slider says it moved.
 *
 * Told the change rather than going looking for it: the announcement carries the id of
 * the slider that moved, which is how a slider knows the number is its own to write
 * down rather than another slider's to ignore.
 *
 * @param {Object} parameters - The numbers the sliders change.
 */
export function tweakable(parameters) {
  return {
    valueChange(entity, { entityId, value }) {
      if (entityId !== entity.id) return

      parameters[entity.species][entity.parameter] = value
    },
  }
}

/**
 * Keeps every readout up to date, once a frame, from whatever the world wants to report.
 *
 * The world is handed the entities as they stand this frame rather than asked for them
 * through the api, because a readout that reads a copy says what was true before the
 * frame it is meant to be reporting on.
 *
 * @param {Function} describe - Told the entities, returns what the readouts should say.
 */
export function readouts(describe) {
  return {
    update(entities, dt, api) {
      const value = describe(entities, api)

      for (const entity of Object.values(entities)) {
        if (entity.type === "Readout") {
          entity.value = value
        }
      }
    },
  }
}

/**
 * Remembering whether the world is paused, and being able to change its mind.
 *
 * `pause` and `resume` are the store's own: notifying one halts the updates and
 * notifying the other starts them again. Both still reach every type, which is how the
 * game can record which of the two is in force -- a button has to know whether to say
 * "pause" or "resume", and the store does not say.
 */
export function pausable() {
  return {
    pause(entity) {
      entity.paused = true
    },

    resume(entity) {
      entity.paused = false
    },

    togglePause(entity, event, api) {
      api.notify(entity.paused ? "resume" : "pause")
    },
  }
}
