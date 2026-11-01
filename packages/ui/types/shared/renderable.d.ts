import type { TemplateResult } from "@inglorious/web"

/** What a template can render, `nothing` and `when()`'s results included. */
export type Renderable =
  | TemplateResult
  | string
  | number
  | boolean
  | symbol
  | null
  | undefined
  | Renderable[]
