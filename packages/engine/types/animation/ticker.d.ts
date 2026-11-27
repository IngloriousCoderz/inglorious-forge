/** What a ticker counts on: it ticks every `speed` seconds. */
export interface TickerTarget {
  speed: number
  defaultValue?: number
  value?: number
  counter?: number
  state?: string
  animation?: string
  [key: string]: unknown
}

export const Ticker: {
  /** Adds `dt` to the target's counter, and calls `onTick` every `speed` seconds. */
  tick<TTarget extends TickerTarget>(params: {
    target: TTarget
    state?: string
    dt: number
    onTick?: (
      target: TTarget,
      dt: number,
      options: Record<string, unknown>,
    ) => void
    [option: string]: unknown
  }): void
}
