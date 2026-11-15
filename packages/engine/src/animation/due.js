const NO_TIME_PASSED = 0
const WITHIN = 1e-9

/**
 * Whether an interval has passed, for `atFps` and `ticks`. Returns the time to
 * account for on this turn, so that six frames of 1/60 s add up to the 1/10 s
 * an entity moving ten times a second must move by, and the time still to wait.
 *
 * @param {number} interval - Seconds between turns.
 * @returns {(clock: number, dt: number) => { since: number, elapsed?: number }}
 */
export function dueAt(interval) {
  return function isDue(clock, dt) {
    const since = clock + dt

    // Summed frame times fall a hair short of the interval they should reach.
    if (since + interval * WITHIN < interval) return { since }

    return { elapsed: since, since: NO_TIME_PASSED }
  }
}
