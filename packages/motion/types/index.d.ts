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
  layout?: boolean | { duration?: number; easing?: string }
  layoutIdKey?: string
  presence?: {
    mode?: "sync" | "wait"
    groupKey?: string
  }
}

export function withMotion(config?: WithMotionConfig): (type: object) => object
