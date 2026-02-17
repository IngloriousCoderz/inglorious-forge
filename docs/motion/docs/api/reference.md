---
title: API Reference
description: Public API of @inglorious/motion.
---

# API Reference

## `withMotion(config)`

Composes a type with motion behavior.

```ts
type MotionVariantDefinition = {
  frames?: Keyframe[] | PropertyIndexedKeyframes
  keyframes?: Keyframe[] | PropertyIndexedKeyframes
  options?: KeyframeAnimationOptions
}

type MotionVariants = Record<string, MotionVariantDefinition>

type MotionLayoutOptions =
  | boolean
  | {
      duration?: number
      easing?: string
    }

type MotionPresenceOptions = {
  mode?: "sync" | "wait"
  groupKey?: string
}

type WithMotionConfig = {
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

function withMotion(config?: WithMotionConfig): (type: object) => object
```

## Added handlers

`withMotion` adds these handlers to the composed type:

- `motionVariantChange(entity, variant)`
  - Sets `entity.motionVariant`
  - Triggers variant animation on render cycle
- `removeWithMotion(entity, payload, api)`
  - Plays the configured exit variant
  - Notifies `remove` after animation finishes
- `requestRemove(entity, payload, api)`
  - Backward-compatible alias of `removeWithMotion`

`payload` for remove handlers:

```ts
type RemoveWithMotionPayload = string | { exitVariant?: string }
```

## Entity fields used by runtime

- `entity.motionVariant` (current/target variant)
- `entity.motionLayoutId` by default for shared layout
  - configurable via `layoutIdKey`

## Runtime behavior

- Honors `prefers-reduced-motion: reduce`
- Uses WAAPI when available (`Element.animate`)
- Falls back to end-state commit when WAAPI is missing
