import type { TemplateResult } from "@inglorious/web"

import type { Renderable } from "../shared/renderable"

export interface PullToRefreshProps {
  id?: string
  /** Keeps the spinner showing, and the content down, until the refresh ends. */
  isRefreshing?: boolean
  isDisabled?: boolean
  /** The spinner's accessible name while refreshing. Defaults to `"Refreshing"`. */
  refreshingLabel?: string
  children?: Renderable
  className?: string
  /** Called when the content is pulled past the threshold and let go. */
  onRefresh?: () => void
}

export type PullToRefreshType = {
  render(props: PullToRefreshProps): TemplateResult
}

export declare const PullToRefresh: PullToRefreshType
