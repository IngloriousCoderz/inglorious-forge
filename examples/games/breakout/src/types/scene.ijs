import { LAYER_BRICK } from "../constants.js"
import { createLevel } from "../levelmaker.ijs"
import { createPlayScene } from "./entities.ijs"
import { createPausedEntity, createStartScene } from "./text-entities.ijs"

/**
 * What stands in each state.
 *
 * In the original a state builds its own world when it is entered and drops it when it
 * is left, so each of these returns everything that should be standing there. Pausing is
 * not a state, so the pause overlay lives in the play scene and decides for itself
 * whether it has anything to say.
 *
 * The level is made on entry rather than listed, because it is made at random and would
 * otherwise be a different set of entities every time.
 */
const SCENES = {
  start: () => createStartScene(),
  play: () => [
    ...createPlayScene(createLevel(LAYER_BRICK)),
    createPausedEntity(),
  ],
}

/**
 * Builds the scene a state calls for and takes the old one away.
 *
 * This is what reacts to the machine announcing its transitions, so the machine itself
 * stays a description of when it moves rather than also being the place that knows what
 * the screen is made of.
 */
export function buildScene(entity, state, api) {
  entity.scene?.forEach(({ id }) => api.notify("remove", id))

  const scene = SCENES[state]?.() ?? []

  scene.forEach((added) => api.notify("add", added))

  entity.scene = scene
}
