/** The direction a view transition is tagged with, and how the stylesheet in
 * this package reacts to it. `forward` and `back` slide, `replace` cross-fades. */
export type ViewTransitionType = "forward" | "back" | "replace"

/** The part of a store this module needs. Declared structurally rather than
 * imported, so any store-shaped object works. */
export interface TransitionsStore<S = unknown> {
  subscribe(listener: (state: S) => void): () => void
  getState(): S
  getType(name: string): unknown
}

export interface WithTransitions {
  <S>(store: TransitionsStore<S>): TransitionsStore<S>
}

export declare const withTransitions: WithTransitions
