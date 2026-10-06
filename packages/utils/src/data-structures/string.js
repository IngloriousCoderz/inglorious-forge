/**
 * Convert kebab-case or PascalCase to camelCase.
 *
 * @param {string} input - The string to convert.
 * @returns {string} The camelCased string.
 */
export function toCamelCase(input) {
  const [firstChar, ...rest] = input.replace(/-([a-z0-9])/gi, (_, c) =>
    c.toUpperCase(),
  )

  return [firstChar.toLowerCase(), ...rest].join("")
}

// How long a row or column is by one, which is the whole of what the offsets below mean.
// The grid's own edges are counted by the same one.
const ONE = 1
const NONE = 0
const FIRST = 0

/**
 * How far one string is from another, in single-character edits.
 *
 * The grid is built in full rather than in the one row that would do, because this is
 * short and the short version is where an off-by-one hides.
 *
 * @example
 * ```js
 * import { editDistance } from "@inglorious/utils/data-structures/string.js"
 *
 * editDistance("audio", "audi") // 1
 * ```
 *
 * @param {string} a - The string that was asked about.
 * @param {string} b - The string to compare it with.
 * @returns {number} How many edits turn one into the other.
 */
export function editDistance(a, b) {
  const grid = Array.from({ length: a.length + ONE }, () =>
    Array.from({ length: b.length + ONE }, () => NONE),
  )

  for (let i = FIRST; i <= a.length; i++) grid[i][FIRST] = i
  for (let j = FIRST; j <= b.length; j++) grid[FIRST][j] = j

  for (let i = ONE; i <= a.length; i++) {
    for (let j = ONE; j <= b.length; j++) {
      grid[i][j] = Math.min(
        grid[i - ONE][j] + ONE,
        grid[i][j - ONE] + ONE,
        grid[i - ONE][j - ONE] + (a[i - ONE] === b[j - ONE] ? NONE : ONE),
      )
    }
  }

  return grid[a.length][b.length]
}

// How far a string may be from the one asked about and still be worth suggesting. A
// mistyped name is nearly always one or two edits away from the right one; anything
// further off is a different string rather than a wrong one.
const NEAR_ENOUGH = 3

/**
 * The strings closest to one that was asked for, nearest first.
 *
 * Case is folded, because a name differing from a declared one only by a capital is the
 * commonest kind of mistake and the one where saying nothing is least helpful.
 *
 * @example
 * ```js
 * import { namesNear } from "@inglorious/utils/data-structures/string.js"
 *
 * namesNear("audio", ["Game", "Audio"]) // ["Audio"]
 * ```
 *
 * @param {string} wanted - The string that was asked for.
 * @param {string[]} candidates - Every string that could have been meant.
 * @returns {string[]} The ones worth suggesting, which may be none of them.
 */
export function namesNear(wanted, candidates) {
  const target = wanted.toLowerCase()
  const allowed = Math.max(ONE, Math.floor(target.length / NEAR_ENOUGH))

  return candidates
    .map((name) => [name, editDistance(target, name.toLowerCase())])
    .filter(([, d]) => d <= allowed)
    .sort(([, a], [, b]) => a - b)
    .map(([name]) => name)
}
