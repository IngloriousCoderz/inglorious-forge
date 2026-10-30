---
title: Inglorious Store
description: A Redux-compatible, entity-based state library for elegant state management.
layout: home
hero:
  name: Inglorious Store
  text: Entity-Based State Management
  tagline: Drop-in Redux replacement. Inspired by game engines. No boilerplate.
  image:
    src: /transparent.png
    alt: Inglorious Store
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: What is it?
      link: /guide/what-is
    - theme: alt
      text: Compare
      link: /comparison
features:
  - icon: 🎮
    title: Entity-Based
    details: Manage multiple instances effortlessly without reshaping state. Add entities at runtime.
  - icon: ⚡
    title: Drop-In Replacement
    details: Same API as Redux. Works with react-redux and Redux DevTools. Just replace your store.
  - icon: 🔄
    title: Event-Driven
    details: Clean, predictable pub/sub system for state updates. No action creators or thunks.
  - icon: 📦
    title: No Boilerplate
    details: No slices, no reducers, no middleware ceremony. Just define types and entities.
  - icon: ♻️
    title: Built-in Lifecycle
    details: create and destroy events for entities. Perfect for cleanup and initialization.
  - icon: 🚀
    title: Fast Immutable Updates
    details: Write plain mutations; Mutative turns them into immutable updates. Its authors benchmark it at up to 10x faster than Immer, the engine inside Redux Toolkit.
---
