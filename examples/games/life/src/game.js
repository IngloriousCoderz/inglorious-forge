import { fps } from "@inglorious/engine/behaviors/fps.js"
import { hover } from "@inglorious/engine/behaviors/input/hover.js"
import {
  createMouseEntity,
  mouse,
} from "@inglorious/engine/behaviors/input/mouse.js"
import { renderFps } from "@inglorious/renderer-2d/fps.js"
import { renderMouse } from "@inglorious/renderer-2d/mouse.js"

import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  FPS,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "./constants.js"
import {
  buttonType,
  pausable,
  readouts,
  readoutType,
  sliderType,
} from "./ui/index.js"

const Board = {}

const BUTTON_WIDTH = 100
const BUTTON_HEIGHT = 26

// Everything the screen can be told, down the right-hand side: the line that says how
// the world is getting on first, then a slider for every number it runs on, then the
// two things it can be told to do.
const PANEL_LEFT = 640
const PANEL_WIDTH = 380
const PANEL_CENTER = PANEL_LEFT + PANEL_WIDTH / 2
const READOUT_Z = 555
const FIRST_ROW_Z = 515
const ROW_SPACING = 36
const BUTTON_Z_BELOW = 45

const SLIDER_TRACK_X = 880
const SLIDER_TRACK_WIDTH = 140
const SLIDER_ROW_HEIGHT = 20

const INK = "rgb(220, 220, 220)"
const PANEL = "rgb(40, 52, 64)"
const PANEL_LAYER = 100

/**
 * The part of the game that is the same whichever world is running.
 *
 * Everything that differs between worlds -- what stands on the board, what a generation
 * means, how a thing is drawn -- is handed in. This keeps the parts that have nothing to
 * do with the rules in one place, so that adding a world is a matter of describing it
 * rather than of copying the engine setup.
 */
export function createLifeGame({
  systems = [],
  types,
  entities,
  readout,
  parameters,
  sliders = [],
}) {
  return {
    updateStrategy: "full-clone",
    loop: { type: "fixed", fps: FPS },

    systems: [...systems, ...(readout ? [readouts(readout)] : [])],

    types: {
      Game: [pausable()],
      Board,
      Mouse: [{ render: renderMouse }, mouse(), hover()],
      Fps: [{ render: renderFps }, fps()],
      Button: buttonType(),
      // Only a world with sliders needs a Slider type, and a world with sliders always
      // brings the numbers they change along with them.
      ...(sliders.length > 0 ? { Slider: sliderType(parameters) } : {}),
      Readout: readoutType(),
      ...types,
    },

    entities: {
      // Not pixelated, although the cells would suit it: the flag resamples the whole
      // canvas with nearest neighbour, lettering included, and this game draws no
      // images for smoothing to spoil -- only boxes, circles and text.
      game: {
        type: "Game",
        devMode: false,
        size: [SCREEN_WIDTH, SCREEN_HEIGHT],
        backgroundColor: "rgb(16, 24, 32)",
      },

      board: {
        type: "Board",
        rows: BOARD_ROWS,
        columns: BOARD_COLUMNS,
        position: [0, 0, 0],
      },

      mouse: createMouseEntity({ cursor: "arrow", color: "white" }),

      // Up in the margin over the board, where no cell will ever draw over it: how fast
      // the loop is actually turning, which is what a slow cursor is usually accusing.
      fps: {
        type: "Fps",
        position: [30, 0, 575],
        color: INK,
        layer: PANEL_LAYER,
      },

      ...controls(sliders),

      readout: {
        type: "Readout",
        position: [PANEL_LEFT + 10, 0, READOUT_Z],
        color: INK,
        size: 14,
        layer: PANEL_LAYER,
      },

      ...entities,
    },
  }
}

/**
 * A button for each of the things a game can be told to do from the screen, and a
 * slider for each of the numbers it runs on.
 *
 * The buttons sit below the last slider, so a world with no sliders still reads top to
 * bottom: what is happening, then what to do about it.
 */
function controls(sliders) {
  const buttons = {
    pause: { label: "Pause", action: "togglePause" },
    reset: { label: "Reset", action: "reset" },
  }

  const buttonZ =
    sliders.length > 0
      ? FIRST_ROW_Z - (sliders.length - 1) * ROW_SPACING - BUTTON_Z_BELOW
      : READOUT_Z - BUTTON_Z_BELOW

  return {
    ...Object.fromEntries(
      sliders.map((slider, index) => [
        slider.id,
        {
          type: "Slider",
          species: slider.species,
          parameter: slider.parameter,
          label: slider.label,
          min: slider.min,
          max: slider.max,
          step: slider.step,
          value: slider.value,
          position: [SLIDER_TRACK_X, 0, FIRST_ROW_Z - index * ROW_SPACING],
          size: [SLIDER_TRACK_WIDTH, 0, SLIDER_ROW_HEIGHT],
          color: "rgb(126, 231, 192)",
          backgroundColor: PANEL,
          labelColor: INK,
          layer: PANEL_LAYER,
        },
      ]),
    ),

    ...Object.fromEntries(
      Object.entries(buttons).map(([id, { action, label }], index) => [
        id,
        {
          type: "Button",
          action,
          label,
          position: [
            PANEL_CENTER + (index - 0.5) * (BUTTON_WIDTH + 20),
            0,
            buttonZ,
          ],
          size: [BUTTON_WIDTH, 0, BUTTON_HEIGHT],
          color: INK,
          backgroundColor: PANEL,
          labelColor: INK,
          layer: PANEL_LAYER,
        },
      ]),
    ),
  }
}
