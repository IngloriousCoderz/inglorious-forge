/** Whether an interval has passed: `elapsed` is set when it has, `since` is the clock to carry. */
export interface Due {
  elapsed?: number
  since: number
}

/** Holds something to `interval` seconds: ask with the clock carried so far and the frame's seconds. */
export function dueAt(interval: number): (clock: number, dt: number) => Due
