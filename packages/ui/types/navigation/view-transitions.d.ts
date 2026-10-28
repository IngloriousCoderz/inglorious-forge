/** The direction a view transition is tagged with, and how the stylesheet in
 * this package reacts to it. `forward` and `back` slide, `replace` cross-fades. */
export type ViewTransitionType = "forward" | "back" | "replace"

/** The part of a store this module needs. Declared structurally rather than
 * imported, so any store-shaped object works. */
export interface TransitionsStore<S = unknown> {
  subscribe(listener: () => void): () => void
  getState(): S
  getType(name: string): unknown
}

/** One side of a navigation. */
export interface NavigationSide {
  path: string
  /** The history index the Router stamped on the entry. */
  index: number
  /** The route the Router resolved, if any. */
  route?: string
}

export interface Navigation {
  /** The direction read from the history. */
  type: ViewTransitionType
  from: NavigationSide
  to: NavigationSide
}

export interface TransitionsOptions {
  /** Which navigations animate: those into or out of the named routes, or
   * those the function accepts. Omit it to animate every navigation. */
  routes?: string[] | ((navigation: Navigation) => boolean)
}

export interface WithTransitions {
  /** A store middleware, for the `middlewares` of `createStore`. It returns the store it is given. */
  (
    options?: TransitionsOptions,
  ): <Store extends TransitionsStore<any>>(store: Store) => Store
}

export declare const withTransitions: WithTransitions
