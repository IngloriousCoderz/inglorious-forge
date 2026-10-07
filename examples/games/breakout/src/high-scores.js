import { readJSON, writeJSON } from "@inglorious/engine/storage.js"

// The original keeps the table in a text file in LÖVE's save directory, a name on one line
// and a score on the next. The browser's own storage is the same idea here.
const KEY = "breakout.high-scores"

export const ENTRIES = 10
export const NAME_LENGTH = 3
export const EMPTY_ENTRY = "---"

const SEED_NAME = "CTO"
const SEED_STEP = 1000
const SEED_SCORES = Array.from({ length: ENTRIES }, (_, index) => ({
  name: SEED_NAME,
  score: (ENTRIES - index) * SEED_STEP,
}))

/** The ten entries the original starts a fresh table with, best first. */
function seed() {
  return SEED_SCORES.map((entry) => ({ ...entry }))
}

/**
 * The scores kept between games, seeded on first run.
 *
 * A table that has been edited into the wrong shape is not worth refusing a game over, so
 * anything unusable is filled back in rather than thrown away.
 */
export function loadHighScores(storage = globalThis.localStorage) {
  const saved = readJSON(KEY, null, storage)

  const scores = Array.isArray(saved)
    ? Array.from({ length: ENTRIES }, (_, index) => {
        const { name, score } = saved[index] ?? {}

        return {
          name: typeof name === "string" ? name : SEED_NAME,
          score: Number.isFinite(score) ? score : SEED_STEP,
        }
      })
    : seed()

  writeJSON(KEY, scores, storage)

  return scores
}

/** An entry that has never been filled in shows as a dash, as the original shows one. */
export function entryOf(entry) {
  return {
    name: entry?.name || EMPTY_ENTRY,
    score: entry?.score ?? EMPTY_ENTRY,
  }
}

export const FIRST_LETTER = 65
export const LAST_LETTER = 90

const NAME_LETTER = "A"

/** Where a score would go in the table, or null if it would not go at all. */
export function rankOf(scores, score) {
  let rank = null

  for (let index = scores.length - 1; index >= 0; index--) {
    if (score > (scores[index]?.score ?? 0)) rank = index
  }

  return rank
}

/** Puts a name and its score in at the place it earned, moving the rest down. */
export function recordScore(scores, rank, name, score) {
  // Everything below the place earned moves down to make room and the last entry falls off
  // the end, which is what keeps the table the length it is read back at.
  scores.splice(rank, 0, { name, score })
  scores.length = ENTRIES

  return scores
}

/** A name is letters rather than character codes, because that is what a name is. */
export function initialName() {
  return NAME_LETTER.repeat(NAME_LENGTH)
}

/** One letter of a name moved on by `step`, wrapping round at A and at Z. */
export function scrollName(name, index, step) {
  const next = name.charCodeAt(index) + step

  const letter =
    next > LAST_LETTER ? FIRST_LETTER : next < FIRST_LETTER ? LAST_LETTER : next

  return (
    name.slice(0, index) + String.fromCharCode(letter) + name.slice(index + 1)
  )
}

/** Writes the table back down, so that the next game to start reads this one. */
export function saveHighScores(scores, storage = globalThis.localStorage) {
  writeJSON(KEY, scores, storage)
}
