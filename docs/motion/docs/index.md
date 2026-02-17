---
layout: home
title: Inglorious Motion
description: CSS-first motion primitives for Inglorious Web.

hero:
  name: Inglorious Motion
  text: CSS-First Motion for Entities
  tagline: Variant lifecycle, presence orchestration, and layout transitions for @inglorious/web.
  image:
    src: /transparent.png
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: What is Inglorious Motion?
      link: /guide/what-is
    - theme: alt
      text: API Reference
      link: /api/reference

features:
  - title: Type Composition First
    details: Add motion as a behavior with `withMotion(config)` and keep your entities event-driven.
  - title: WAAPI by Default
    details: Uses native `Element.animate()` and gracefully falls back when smooth tweening is unavailable.
  - title: Variant Lifecycle
    details: Drive transitions via `motionVariantChange` and `removeWithMotion` with phase classes on the host.
  - title: Presence Orchestration
    details: '`presence.mode = "wait"` serializes exits in a group for predictable UI sequencing.'
  - title: FLIP Layout Animations
    details: "Enable `layout: true` to animate position and size changes with browser-native transforms."
  - title: Shared Layout
    details: Use `motionLayoutId` to animate between related elements across UI states.
---
