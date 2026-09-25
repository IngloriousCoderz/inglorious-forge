import type { Vector2, Vector3, Vector7 } from "./vector"

/** Alias for `sum`. */
export const add: typeof sum

/** Computes the cross product of same-width 3D or 7D vectors. */
export function cross<T extends Vector3 | Vector7>(...vectors: [T, ...T[]]): T

/** Computes the distance between same-width 2D or 3D vectors. */
export function distance<T extends Vector2 | Vector3>(
  ...vectors: [T, ...T[]]
): number

/** Divides same-width vectors component-wise. */
export function divide<T extends Vector2 | Vector3>(...vectors: [T, ...T[]]): T

/** Computes the dot product of same-width 2D or 3D vectors. */
export function dot<T extends Vector2 | Vector3>(
  ...vectors: [T, ...T[]]
): number

/** Alias for `multiply`. */
export const hadamard: typeof multiply

/** Applies a component-wise modulus to same-width vectors. */
export function mod<T extends Vector2 | Vector3>(...vectors: [T, ...T[]]): T

/** Multiplies same-width vectors component-wise. */
export function multiply<T extends Vector2 | Vector3>(
  ...vectors: [T, ...T[]]
): T

/** Raises same-width vectors component-wise to powers. */
export function power<T extends Vector2 | Vector3>(...vectors: [T, ...T[]]): T

/** Alias for `dot`. */
export const scalarProduct: typeof dot

/** Subtracts same-width vectors component-wise. */
export function subtract<T extends Vector2 | Vector3>(
  ...vectors: [T, ...T[]]
): T

/** Sums same-width vectors component-wise. */
export function sum<T extends Vector2 | Vector3>(...vectors: [T, ...T[]]): T

/** Alias for `cross`. */
export const vectorProduct: typeof cross
