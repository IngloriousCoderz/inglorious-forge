import { BOTTOM_LEFT } from "@inglorious/engine/physics/anchor.js"
import { random } from "@inglorious/utils/math/rng.js"
import { v } from "@inglorious/utils/v.js"

import {
  BRICK_COLORS_PER_TIER,
  BRICK_FIRST_COLOR,
  BRICK_FIRST_TIER,
  BRICK_HEIGHT,
  BRICK_MAX_COLS,
  BRICK_WIDTH,
  HEIGHT,
} from "./constants.js"

const BRICK_ID_PREFIX = "brick"

/**
 * A fair coin, which is what the original's `math.random(2) == 1` is.
 *
 * `random(2)` counts from zero and `math.random(2)` counts from one, so the face this
 * asks for is zero rather than one.
 */
function flip() {
  return random(2) === 0
}

/**
 * The number of columns has to be odd.
 *
 * The screen is padded by sixteen for every column a level is short of the widest one,
 * which centres a level only while the count is odd. An even count would be padded on
 * one side twice as much as the other, putting the level off to one side.
 */
function oddColumns(columns) {
  return columns % 2 === 0 ? columns + 1 : columns
}

/**
 * Makes a level of bricks at random, the way `LevelMaker.createMap` does.
 *
 * Unlike the earlier levels, this one is rolled per row rather than as a single block.
 * Each row independently becomes solid, alternating between two colours, or alternating
 * with every other brick left out, so a level is a mixture of shapes instead of one shape
 * repeated. Which patterns a row may use is bounded by the level: early on there is one
 * tier and a few colours, and both climb as the level does.
 *
 * The bricks are laid out to touch, centred by padding with half a brick's width for
 * however many columns are missing from the widest level.
 *
 * The original's rows count down from the top of the screen, which in this world means
 * counting up from the ceiling, so a row's altitude is the height less the original's y.
 */
export function createLevel(level, layer) {
  const rows = random(1, 5)
  const columns = oddColumns(random(7, BRICK_MAX_COLS))

  // How far along the colours and the tiers this level may reach. Both stop short of the
  // top of the sheet, so a late level cannot ask for a frame that is not there.
  const highestTier = Math.min(3, Math.floor(level / 5))
  const highestColor = Math.min(5, (level % 5) + 3)

  const bricks = []

  for (let row = 0; row < rows; row++) {
    const skips = flip()
    const alternates = flip()

    // The two colours a row alternates between, and the two tiers, are both chosen up
    // front even when the row turns out to be solid, because the original draws them
    // before it decides which pattern to use.
    const alternateColor1 = random(BRICK_FIRST_COLOR, highestColor)
    const alternateColor2 = random(BRICK_FIRST_COLOR, highestColor)
    const alternateTier1 = random(BRICK_FIRST_TIER, highestTier)
    const alternateTier2 = random(BRICK_FIRST_TIER, highestTier)

    // Where each pattern starts, and the colour and tier for a row that is neither.
    let skip = flip()
    let alternate = flip()
    const solidColor = random(BRICK_FIRST_COLOR, highestColor)
    const solidTier = random(BRICK_FIRST_TIER, highestTier)

    for (let column = 0; column < columns; column++) {
      // A skipping row leaves out every other brick. The flag turns over on every column
      // whether or not the row skips, which is what spaces the gaps out evenly rather
      // than clumping them at one end.
      const skipped = skips && skip

      skip = !skip

      if (skipped) continue

      const first = alternates && alternate

      alternate = !alternate

      const [color, tier] = first
        ? [alternateColor1, alternateTier1]
        : [alternateColor2, alternateTier2]

      // The bricks are rolled as a colour and a tier, which is how the original thinks
      // about them, and carried as the hits they are worth, which is one number and the
      // same thing said shorter.
      const hp =
        (alternates ? tier : solidTier) * BRICK_COLORS_PER_TIER +
        (alternates ? color : solidColor)

      bricks.push({
        // Named for where the brick would stand rather than for how many have been made
        // so far, so that a row which skips leaves a gap in the names instead of
        // colliding with the row above it.
        id: brickId(level, row, column, columns),
        type: "Brick",
        layer,
        // A solid row was given a colour and a tier of its own before the alternate pair
        // was looked at, and the alternate pair does not apply to it at all.
        hp,
        position: v(
          column * BRICK_WIDTH + 8 + (BRICK_MAX_COLS - columns) * 16,
          HEIGHT - (row + 1) * BRICK_HEIGHT,
          0,
        ),
        anchor: BOTTOM_LEFT,
        size: v(BRICK_WIDTH, BRICK_HEIGHT, 0),
        solid: true,
      })
    }
  }

  // A level with nothing in it is not a level, so it is made again. Nothing this rolls
  // can come out empty at the sizes it rolls, but the original guards it and so do we.
  return bricks.length === 0 ? createLevel(level, layer) : bricks
}

/**
 * The name a brick stands under, counting positions across the whole level.
 *
 * Counting positions rather than bricks made is what keeps two bricks in different rows
 * from taking the same name when a row has left some out. The level is in the name as
 * well, because a brick belongs to the level it was rolled for and two levels of the
 * same size would otherwise hand out the same names for entirely different bricks.
 */
function brickId(level, row, column, columns) {
  return `${BRICK_ID_PREFIX}${level}-${row * columns + column + 1}`
}
