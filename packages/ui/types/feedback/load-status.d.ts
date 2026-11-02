import type { Renderable } from "../shared/renderable"

export interface LoadStatusProps {
  isError?: boolean
  error?: Renderable
  isLoading?: boolean
  /** Replaces the circular progress, such as with the app's own animation. */
  loader?: Renderable
  /** The progress indicator's accessible name. Defaults to `"Loading…"`. */
  loadingLabel?: string
  isEmpty?: boolean
  emptyText?: Renderable
  /** What to render when there is no status to show. Runs only then, so it can read data still loading. */
  content?: () => Renderable
  className?: string
}

export type LoadStatusType = {
  render(props: LoadStatusProps): Renderable
}

export declare const LoadStatus: LoadStatusType
