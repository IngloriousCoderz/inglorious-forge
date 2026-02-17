export type MotionVariantDefinition = {
  frames?: Keyframe[] | PropertyIndexedKeyframes
  keyframes?: Keyframe[] | PropertyIndexedKeyframes
  options?: KeyframeAnimationOptions
}

export type MotionVariants = Record<string, MotionVariantDefinition>

export type MotionLayoutOptions =
  | boolean
  | {
      duration?: number
      easing?: string
    }

export type MotionPresenceOptions = {
  mode?: "sync" | "wait"
  groupKey?: string
}

export type RemoveWithMotionPayload = string | { exitVariant?: string }

export type WithMotionConfig = {
  variants: MotionVariants
  initial?: string
  exitVariant?: string
  classPrefix?: string
  fallbackBufferMs?: number
  animateOnMount?: boolean
  layout?: MotionLayoutOptions
  layoutIdKey?: string
  presence?: MotionPresenceOptions
}

export function withMotion(config?: WithMotionConfig): (type: object) => object
