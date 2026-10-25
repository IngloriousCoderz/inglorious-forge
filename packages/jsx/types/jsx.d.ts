/* eslint-disable @typescript-eslint/no-explicit-any --
   JSX here compiles to lit-html templates, which TypeScript cannot describe. */

declare global {
  namespace JSX {
    /** What a JSX expression compiles to: a lit-html template. */
    type Element = any

    interface IntrinsicElements {
      [elemName: string]: any
    }

    interface IntrinsicAttributes {
      key?: string | number
    }
  }
}

export {}
