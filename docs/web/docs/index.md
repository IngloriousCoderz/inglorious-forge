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
    details: Application state lives in the store; hover, focus and a gesture in progress stay with the browser. No refs, no lifecycle hooks. See [where state lives](/guide/where-state-lives).
  - title: Built-in Components
    details: Router, forms, and geolocation in Web; UI primitives in [Inglorious UI](https://inglorious.dev/ui)—all entity-based, all customizable, all testable.
  - title: Transparent Architecture
    details: Pure JavaScript. No JSX required (though supported). No compiler. No magic. Just functions and events.
  - title: Typed, If You Want
    details: Every package ships its own type declarations. Entities, types and the api are checked without casts. See [TypeScript](/guide/typescript).
  - title: Part of Inglorious Forge
    details: Web is the framework of the [Inglorious Forge monorepo](https://github.com/IngloriousCoderz/inglorious-forge), next to the store, UI, charts, motion, SSX, generative UI, Supabase and Firebase bindings, and a game engine.
---
