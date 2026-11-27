/** A call the context recorded: its name, then its arguments. */
export type Call = [name: string, ...args: unknown[]]

/** The calls a context recorded, and the last box it drew, in canvas coordinates. */
export type Calls = Call[] & {
  box?: { left: number; right: number; top: number; bottom: number }
}

/** A context that records what is drawn, and where it lands, for tests. */
export function createContext(): {
  calls: Calls
  /** Where a point lands with the current transform. */
  at: (point: readonly [number, number]) => [number, number]
  ctx: CanvasRenderingContext2D
}

/** The recorded calls to one method or property. */
export function callsTo(calls: Calls, name: string): Call[]
