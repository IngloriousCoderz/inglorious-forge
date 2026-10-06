/**
 * The ten best scores, kept between games.
 *
 * The original keeps them in a text file in LÖVE's save directory: a name on one line and
 * a score on the next, ten of each, names three letters long. Here they go in the
 * browser's own storage, which is the same idea on this platform -- but the serialisation
 * is the platform's rather than the original's, since how a score is written down is not a
 * rule of the game. What is the rule of the game is what goes in it.
 *
 * Nothing here records a score. The original does not either, not yet: it reads the table
 * and shows it, and the entries it ships with are the course's own.
 */

const KEY = "breakout.high-scores"

// How many are kept, and how long a name is.
export const ENTRIES = 10
export const NAME_LENGTH = 3

// What the table is seeded with when there is nothing to read: one name, and the ten
// round thousands from ten thousand down.
const SEED_NAME = "CTO"
const SEED_STEP = 1000

// Shown where an entry has never been filled in.
export const EMPTY_ENTRY = "---"

/**
 * The scores kept between games, seeded on first run.
 *
 * @param {Storage} [storage] - Where to keep them. Defaults to the browser's own.
 * @returns {{name: string, score: number}[]} Ten entries, best first.
 */
export function loadHighScores(storage = globalThis.localStorage) {
  const saved = storage?.getItem(KEY)

  if (saved) return read(saved)

  const seeded = seed()

  // Written back so that the table the game reads is the table it shipped, exactly as the
  // original writes its file before reading it back.
  storage?.setItem(KEY, JSON.stringify(seeded))

  return seeded
}

/** The ten entries the original starts a fresh table with, best first. */
function seed() {
  return Array.from({ length: ENTRIES }, (_, index) => ({
    name: SEED_NAME,
    score: (ENTRIES - index) * SEED_STEP,
  }))
}

/**
 * Reads a stored table, filling in whatever is missing.
 *
 * A table that is the wrong shape, or that has been edited into something unreadable, is
 * not worth refusing a game over -- so anything unusable falls back to the seed.
 */
function read(saved) {
  let parsed

  try {
    parsed = JSON.parse(saved)
  } catch {
    return seed()
  }

  if (!Array.isArray(parsed)) return seed()

  return Array.from({ length: ENTRIES }, (_, index) => {
    const entry = parsed[index] ?? {}

    return {
      name: typeof entry.name === "string" ? entry.name : SEED_NAME,
      score: Number.isFinite(entry.score) ? entry.score : SEED_STEP,
    }
  })
}

/**
 * What a score is shown as, and the name beside it.
 *
 * An entry that has never been filled in shows as a dash rather than as a blank, which is
 * how the original shows one.
 */
export function entryOf(entry) {
  return {
    name: entry?.name || EMPTY_ENTRY,
    score: entry?.score ?? EMPTY_ENTRY,
  }
}
