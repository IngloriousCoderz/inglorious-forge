export interface JumpParams {
  maxJump?: number
  maxLeap?: number
  maxSpeed?: number
}

/**
 * Calculates the vertical velocity of a jump.
 */
export function jump(params: JumpParams): number
