/**
 * Input selector function that takes state and returns a value
 */
export type InputSelector<TState = any, TResult = any> = (
  state: TState,
) => TResult

/**
 * Output selector function (memoized)
 */
export type OutputSelector<TState = any, TResult = any> = (
  state: TState,
) => TResult

/** Any input selector, whatever state it reads. */
type AnySelector = (state: never) => unknown

/** What the input selectors return, in order: the result function's arguments. */
type SelectedValues<TSelectors extends readonly AnySelector[]> = {
  [K in keyof TSelectors]: ReturnType<TSelectors[K]>
}

/** The state every input selector can read: the intersection of theirs. */
type SelectorsState<TSelectors extends readonly AnySelector[]> =
  UnionToIntersection<Parameters<TSelectors[number]>[0]>

type UnionToIntersection<TUnion> = (
  TUnion extends unknown ? (value: TUnion) => void : never
) extends (value: infer TIntersection) => void
  ? TIntersection
  : never

/**
 * Creates a memoized derived computation from input selectors. Everything is
 * inferred: the result function's arguments, and the state the selector reads.
 */
export function compute<
  const TSelectors extends readonly AnySelector[],
  TResult,
>(
  resultFunc: (...args: SelectedValues<TSelectors>) => TResult,
  inputSelectors: TSelectors,
): OutputSelector<SelectorsState<TSelectors>, TResult>
/** With explicit type arguments: the state, the selected values and the result. */
export function compute<TState, TInputs extends readonly unknown[], TResult>(
  resultFunc: (...args: TInputs) => TResult,
  inputSelectors: {
    [K in keyof TInputs]: InputSelector<TState, TInputs[K]>
  },
): OutputSelector<TState, TResult>

/**
 * Redux-compatible alias for `compute`.
 * Prefer `compute` in new code.
 */
export function createSelector<
  const TSelectors extends readonly AnySelector[],
  TResult,
>(
  inputSelectors: TSelectors,
  resultFunc: (...args: SelectedValues<TSelectors>) => TResult,
): OutputSelector<SelectorsState<TSelectors>, TResult>
/** With explicit type arguments: the state, the selected values and the result. */
export function createSelector<
  TState,
  TInputs extends readonly unknown[],
  TResult,
>(
  inputSelectors: {
    [K in keyof TInputs]: InputSelector<TState, TInputs[K]>
  },
  resultFunc: (...args: TInputs) => TResult,
): OutputSelector<TState, TResult>
