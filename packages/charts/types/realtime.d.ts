import type { ChartType, StreamEntity } from "./index"

/** How a realtime chart streams, on its entity's `realtime` field. */
export interface RealtimeConfig {
  /** How many of the latest points are shown while live. Defaults to 30. */
  visibleWindow?: number
  /** The most points kept; older ones are dropped. Defaults to 2000. */
  maxHistory?: number
  /** Freezes the chart and shows the brush; pushed points wait in `pending`. */
  isPaused?: boolean
  /** The points pushed while paused, added on play. */
  pending?: Array<number | Record<string, unknown>>
}

export interface RealtimeEntity extends StreamEntity {
  realtime?: RealtimeConfig
}

/** The events `withRealtime` adds to a chart type. */
export type RealtimeHandlers = {
  create(entity: RealtimeEntity, payload?: unknown, api?: unknown): void
  /**
   * Adds a point: a number, put at the next index under `streamYKey`, or a
   * whole data point.
   */
  streamPush(
    entity: RealtimeEntity,
    payload: number | Record<string, unknown>,
  ): void
  /** Freezes the chart and shows the brush. Pushed points wait for play. */
  streamPause(entity: RealtimeEntity): void
  /** Adds the points that waited, and follows the newest again. */
  streamPlay(entity: RealtimeEntity): void
}

/**
 * Makes a chart type follow a stream of data the app pushes with `streamPush`:
 * compose it in the store (`LiveLine: [Chart, withRealtime]`) or wrap it
 * (`withRealtime(Chart)`).
 */
export function withRealtime<TType extends Partial<ChartType>>(
  chartType: TType,
): Omit<TType, keyof RealtimeHandlers> & RealtimeHandlers
