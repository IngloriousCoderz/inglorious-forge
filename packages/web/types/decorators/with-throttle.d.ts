import type { LimitedBehavior } from "./limit"

export interface ThrottleOptions {
  /** Also runs the last call of a burst once the delay ends. Defaults to `false`. */
  hasTrailing?: boolean
}

/** Throttles the named handlers, each to once every `delay` milliseconds. */
export declare function withThrottle<TName extends string>(
  delay: number,
  handlerNames: TName[],
  options?: ThrottleOptions,
): <TType extends object>(
  type: TType,
) => LimitedBehavior<TType, TName, "Throttled">

/** Throttles each handler to once per its own delay in milliseconds. */
export declare function withThrottle<TDelays extends Record<string, number>>(
  delays: TDelays,
  handlerNames?: undefined,
  options?: ThrottleOptions,
): <TType extends object>(
  type: TType,
) => LimitedBehavior<TType, keyof TDelays & string, "Throttled">
