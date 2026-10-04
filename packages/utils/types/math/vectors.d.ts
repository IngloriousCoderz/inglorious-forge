/** Identifies a value created by the vector factory. */
type IsVector = {
  readonly __isVector__: true
}

/** A dynamically sized vector. */
export type Vector<Coordinates extends readonly number[] = readonly number[]> =
  IsVector & Coordinates

/** A two-dimensional vector. */
export type Vector2 = Vector<readonly [number, number]>

/** A three-dimensional vector. */
export type Vector3 = Vector<readonly [number, number, number]>

/** A seven-dimensional vector. */
export type Vector7 = Vector<
  readonly [number, number, number, number, number, number, number]
>

/** The vector with every component at zero. */
export const ZERO_VECTOR: Vector3

/** The vector one unit long along the x axis. */
export const UNIT_VECTOR: Vector3

/** Returns the absolute value of each vector component. */
export function abs<T extends Vector>(vector: T): T

/** Alias for `sum`. */
export const add: typeof sum

/** Calculates the angle of a vector. */
export function angle<T extends Vector>(vector: T): number

/** Clamps a vector by scalar magnitude bounds. */
export function clamp<T extends Vector>(vector: T, min: number, max: number): T

/** Clamps a vector by component-wise vector bounds. */
export function clamp<T extends Vector>(
  vector: T,
  min: readonly number[],
  max: readonly number[],
): T

/** Returns the vector conjugate. */
export function conjugate<T extends Vector>(vector: T): T

/** Creates a 3D vector from a magnitude and angle. */
export function createVector(magnitude: number, angle: number): Vector3

/** Computes the cross product of same-width 3D or 7D vectors. */
export function cross<T extends Vector3 | Vector7>(...vectors: [T, ...T[]]): T

/** Computes the distance between same-width 2D or 3D vectors. */
export function distance<T extends Vector2 | Vector3>(
  ...vectors: [T, ...T[]]
): number

/** Divides same-width vectors component-wise. */
export function divide<T extends Vector2 | Vector3>(...vectors: [T, ...T[]]): T

/** Divides each vector component by a scalar. */
export function divide<T extends Vector2 | Vector3>(
  vector: T,
  scalar: number,
): T

/** Divides a scalar by each vector component. */
export function divideBy<T extends Vector>(scalar: number, vector: T): T

/** Computes the dot product of same-width 2D or 3D vectors. */
export function dot<T extends Vector2 | Vector3>(
  ...vectors: [T, ...T[]]
): number

/** Converts a 2D vector to a 3D vector. */
export function from2D(vector: Vector2): Vector3

/** Creates a 3D unit vector from an angle. */
export function fromAngle(angle: number): Vector3

/** Alias for `multiply`. */
export const hadamard: typeof multiply

/** Checks whether a value is a vector. */
export function isVector<T>(value: T): value is T & Vector

/** Calculates a vector's magnitude. */
export function magnitude<T extends Vector>(vector: T): number

/** Alias for `magnitude`. */
export const length: typeof magnitude

/** Applies a component-wise modulus to same-width vectors. */
export function mod<T extends Vector2 | Vector3>(...vectors: [T, ...T[]]): T

/** Applies a modulus to each vector component. */
export function mod<T extends Vector2 | Vector3>(vector: T, divisor: number): T

/** Applies a scalar modulus to each vector component. */
export function modOf<T extends Vector>(scalar: number, vector: T): T

/** Multiplies same-width vectors component-wise. */
export function multiply<T extends Vector2 | Vector3>(
  ...vectors: [T, ...T[]]
): T

/** Multiplies each vector component by a scalar. */
export function multiply<T extends Vector2 | Vector3>(
  vector: T,
  scalar: number,
): T

/** Normalizes a vector to unit magnitude. */
export function normalize<T extends Vector>(vector: T): T

/** Alias for `power`. */
export const pow: typeof power

/** Raises same-width vectors component-wise to powers. */
export function power<T extends Vector2 | Vector3>(...vectors: [T, ...T[]]): T

/** Raises each vector component to a power. */
export function power<T extends Vector2 | Vector3>(
  vector: T,
  exponent: number,
): T

/** Raises a scalar to each vector component. */
export function powerOf<T extends Vector>(scalar: number, vector: T): T

/** Alias for `mod`. */
export const remainder: typeof mod

/** Rotates a 2D vector. */
export function rotate<T extends Vector2>(vector: T, angle: number): T

/** Rotates a 3D vector around the Y-axis. */
export function rotate<T extends Vector3>(vector: T, angle: number): T

/** Alias for `multiply`. */
export const scale: typeof multiply

/** Sets a vector's angle while preserving its magnitude. */
export function setAngle(vector: Vector, angle: number): Vector3

/** Alias for `setMagnitude`. */
export const setLength: typeof setMagnitude

/** Sets a vector's magnitude while preserving its direction. */
export function setMagnitude<T extends Vector>(vector: T, length: number): T

/** Rotates vector components by an index. */
export function shift<T extends Vector>(vector: T, index: number): T

/** Snaps each vector component to a precision. */
export function snap<T extends Vector>(vector: T, precision?: number): T

/** Subtracts same-width vectors component-wise. */
export function subtract<T extends Vector2 | Vector3>(
  ...vectors: [T, ...T[]]
): T

/** Sums same-width vectors component-wise. */
export function sum<T extends Vector2 | Vector3>(...vectors: [T, ...T[]]): T

/** Alias for `multiply`. */
export const times: typeof multiply

/** Converts a 3D vector to a 2D vector. */
export function to2D(vector: Vector3): Vector2

/** Converts 2D polar coordinates to Cartesian coordinates. */
export function toCartesian<T extends Vector2>(vector: T): T

/** Converts a 3D Cartesian vector to cylindrical coordinates. */
export function toCylindrical<T extends Vector3>(vector: T): T

/** Converts a 2D Cartesian vector to polar coordinates. */
export function toPolar<T extends Vector2>(vector: T): T

/** Formats a vector as a string. */
export function toString<T extends Vector>(vector: T, decimals?: number): string

/** Converts a 3D Cartesian vector to spherical coordinates. */
export function toSpherical<T extends Vector3>(vector: T): T

/** Creates a 3D unit vector. */
export function unit(angle?: number): Vector3

/** Alias for `cross`. */
export const vectorProduct: typeof cross

/** Creates a 3D zero vector. */
export function zero(): Vector3
