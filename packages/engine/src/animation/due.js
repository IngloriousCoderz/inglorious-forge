const NO_TIME_PASSED = 0
// How far short of a rate still counts as reaching it.
const WITHIN = 1e-9

/**
 * Asks whether enough time has passed for something that moves at a rate.
 *
 * Made for the two things that hold themselves back from the loop's pace -- an entity
 * with `atFps`, and a system that keeps its own clock -- so that "has the interval
 * arrived" is written down once rather than twice.
 *
 * It hands back the time to account for on this turn and the time still to come, rather
 * than only saying yes: an entity held to ten frames a second is told how long it has
 * been since its last move, because six frames of a sixtieth of a second have to come
 * to a tenth of a second for a game moving by velocity times dt.
 *
 * This is not the engine's `Ticker`, which answers the same question and then forgets
 * how long it took: it resets its counter to zero as it fires, so by the time the
 * handler ran, the time it had just measured was gone.
 *
 * @param {number} interval - How long between turns, in seconds.
 * @returns {Function} Given the time already waited and the time just passed.
 */
export function dueAt(interval) {
  return function isDue(clock, dt) {
    const since = clock + dt

    // A shade short of the interval counts as reaching it. Frame times are added up, and
    // six of a sixtieth of a second come to a hair under a tenth of one, which would
    // otherwise leave something moving ten times a second moving at nine. An interval of
    // nothing is never short of anything, so that moves every time it is asked.
    if (since + interval * WITHIN < interval) return { since }

    return { elapsed: since, since: NO_TIME_PASSED }
  }
}
