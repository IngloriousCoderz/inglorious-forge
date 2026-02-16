export type MotionVariantDefinition = {
  frames?: Keyframe[] | PropertyIndexedKeyframes
  keyframes?: Keyframe[] | PropertyIndexedKeyframes
  options?: KeyframeAnimationOptions
}

export type MotionVariants = Record<string, MotionVariantDefinition>

export type WithMotionConfig = {
  variants: MotionVariants
  initial?: string
  exitVariant?: string
  classPrefix?: string
  fallbackBufferMs?: number
  animateOnMount?: boolean
}

export function withMotion(config?: WithMotionConfig): (type: object) => object

export function removeWithMotion(
  api: { notify(type: string, payload?: unknown): void },
  entityId: string,
  payload?: { exitVariant?: string },
): void
