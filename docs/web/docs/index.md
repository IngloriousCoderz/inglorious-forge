---
layout: home
title: Inglorious Web
description: Lightweight, predictable web framework built on pure JavaScript, entity-based state management, and lit-html

hero:
  name: Inglorious Web
  text: Lightweight & Predictable
  tagline: Full-tree rendering with DOM diffing. Entity-based. No signals. No magic.
  image:
    src: /transparent.png
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
  - title: No Signals or Subscriptions
    details: Full-tree re-renders on state change, lit-html diffs the DOM. Simple. Predictable. Zero framework overhead.
  - title: Entity-Based Rendering
    details: Each entity type defines its own render() method. Compose UIs by invoking api.render(id) to render entities declaratively.
  - title: Type Composition
    details: Types as arrays of behaviors. Add logging, guards, or any cross-cutting concern without wrapper hell or HOCs.
  - title: Zero Component State
    details: All state lives in the store. No refs, no lifecycle hooks, no framework-level memory leaks.
  - title: Built-in Components
    details: Router, forms, tables, select dropdowns, virtual lists—and ecosystem packages like Inglorious Motion and Inglorious Charts.
  - title: Transparent Architecture
    details: Pure JavaScript. No JSX required (though supported). No compiler. No magic. Just functions and events.
---
