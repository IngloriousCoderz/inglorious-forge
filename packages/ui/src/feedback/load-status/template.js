/**
 * @typedef {import('../../../types/feedback/load-status').LoadStatusProps} LoadStatusProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"

import { Progress } from "../progress/index.js"

/**
 * Renders where a load stands instead of what it loads: an error, a loader or
 * an empty message, in that order of precedence. Otherwise it renders
 * `content`, a function so that it runs only once there is something to show.
 * @param {LoadStatusProps} props
 * @returns {import('../../../types/shared/renderable').Renderable}
 */
export function render(props) {
  const {
    isError = false,
    error,
    isLoading = false,
    loader,
    loadingLabel = "Loading…",
    isEmpty = false,
    emptyText,
    content,
    className = "",
  } = props

  const classes = ["iw-load-status", className].filter(Boolean).join(" ")

  if (isError) return html`<div class=${classes} role="alert">${error}</div>`
  if (isLoading) {
    return html`<div class=${classes} role="status">
      ${
        loader ??
        Progress.render({ variant: "circular", ariaLabel: loadingLabel })
      }
    </div>`
  }
  if (isEmpty) return html`<div class=${classes}>${emptyText}</div>`
  return content ? content() : nothing
}
