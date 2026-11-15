---
title: What is Inglorious Web?
description: What the framework is, what it is not, and whether it suits you
---

# What is Inglorious Web?

Inglorious Web renders the whole UI as a function of a store of entities, and lets [lit-html](https://lit.dev/docs/libraries/standalone-templates/) update only the DOM that changed.

## What it is

- **A rendering layer over [Inglorious Store](https://inglorious.dev/store/)**: state is a map of plain entities, behavior lives in types, and every change is an event.
- **Plain JavaScript**: types are objects of functions, templates are tagged literals, and an app can run with no build step. [JSX](../featured/jsx.md) and [Vue-like templates](../featured/vue-templates.md) compile to the same thing.
- **Full-tree render, minimal DOM update**: on every update the whole template reruns and lit-html patches what changed. There is no reactivity graph and no memo to keep right.
- **No component state**: render functions have no state, no lifecycle and no reason of their own to run. They run when the store updates, and only then. What only lasts for one interaction stays with the browser ([where state lives](./where-state-lives.md)).
- **Entities with a lifecycle**: `create` and `destroy` are where a type opens and closes what it needs from the outside world. The [sensors](../featured/device.md), the [router](../featured/router.md), [forms](../featured/form.md) and the native integrations are all entity types.
- **Composition**: a type is a list of behaviors, so a guard, a debounce or persistence is a reusable piece rather than a base class.
- **Part of [Inglorious Forge](https://github.com/IngloriousCoderz/inglorious-forge)**: with [Inglorious UI](https://inglorious.dev/ui), [charts](https://inglorious.dev/charts/), [motion](https://inglorious.dev/motion/), [SSX](https://inglorious.dev/ssx/), generative UI and the Supabase and Firebase bindings.

## What it is not

- **Not a reactive proxy system.** State changes through named events, not by assigning to a tracked object.
- **Not a signal system.** Nothing subscribes to parts of the state; the whole tree renders, which the [benchmarks](https://dev.to/iceonfire/you-probably-dont-need-to-think-about-ui-optimization-honest-benchmarks-2m5g) put in the same tier as Vue and Svelte.
- **Not a virtual DOM.** lit-html compares a template's expressions with the previous render and touches the DOM where they differ.
- **Not framework-agnostic.** Types work in an Inglorious store. For components that must work anywhere, [Web Components](../featured/web-components.md) are the fit, and Inglorious Web renders them.

## The one piece of magic

Handlers mutate the entity they are given, and [Mutative](https://github.com/unadlib/mutative) turns the mutation into a new immutable state. That entity is a draft that lives until the update ends: write to it before the first `await`, and notify an event for what comes after. The [event system](./event-system.md#the-queue) has the two rules; everything else is plain functions.

## Is it for you?

It suits you when state is the hard part: multi-step flows, requests that answer after the user has moved on, long sessions, realtime data, games, chat and agent interfaces. One store holds it all, every change is an event you can see in the DevTools, and handlers are tested as functions, with no rendering.

It may not, when the app needs components the ecosystem does not have yet, when a team cannot take on a framework with a small community, when updates are sustained, rapid and sparse on weak devices, or when the site is mostly content. The [comparison](../comparison.md) goes framework by framework.
