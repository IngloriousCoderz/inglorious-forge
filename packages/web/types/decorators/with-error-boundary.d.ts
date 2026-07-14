import type { TemplateResult } from "lit-html"

import { Api } from "../mount"

export interface ErrorBoundaryBehavior {
  render: (entity: any, api: Api) => TemplateResult | string
}

export declare function withErrorBoundary(
  fallback?: (error: Error, entity: any, api: Api) => TemplateResult | string,
): <T extends Record<string, any>>(type: T) => ErrorBoundaryBehavior
