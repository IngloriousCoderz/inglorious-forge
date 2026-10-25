/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars --
   A shim only TypeScript reads: it accepts any JSX, and is never called. */

export type JSXElement = unknown

export function jsxDEV(type: any, props: any, key?: any): JSXElement {
  return null as any
}

export const jsxs = jsxDEV
export const Fragment = Symbol("Fragment")
