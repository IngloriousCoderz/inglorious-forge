import type { LimitedBehavior } from "./limit"

/** Debounces the named handlers, each by `delay` milliseconds. */
export declare function withDebounce<TName extends string>(
  delay: number,
  handlerNames: TName[],
): <TType extends object>(
  type: TType,
) => LimitedBehavior<TType, TName, "Debounced">

/** Debounces each handler by its own delay in milliseconds. */
export declare function withDebounce<TDelays extends Record<string, number>>(
  delays: TDelays,
): <TType extends object>(
  type: TType,
) => LimitedBehavior<TType, keyof TDelays & string, "Debounced">
