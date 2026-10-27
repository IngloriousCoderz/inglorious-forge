# Philosophy

## Where it comes from

Forge started as a game engine. Along the way it became clear that its patterns, and above all the entity and event model, worked just as well for ordinary web applications.

So instead of starting from a large framework and cutting it down, Forge went the other way: **start from a small, generic core, and grow outward only when a real need calls for it.** The store came first; the web framework, the design system, server rendering, charts and generative UI each grew from it when a project needed them. None of it was designed as a product first.

## Principles

- **Plain JavaScript.** Types are objects of functions, templates are tagged literals, and an app can run in the browser with no build step. JSX and Vue-like templates are there for those who want them, compiled to the same thing.
- **One model everywhere.** An entity holds data, a type holds behavior, and every change is an event. The same store drives a form, a server-rendered page, a chart, a generated answer and a game loop.
- **State in the store, never in components.** Nothing renders from hidden local state, so there is nothing to subscribe to and nothing to clean up.
- **Re-render everything, update only what changed.** The whole template tree reruns on each change and lit-html patches the DOM, so there is no reactivity graph to reason about.
- **Composition over hierarchy.** Behaviors are composed onto types as arrays, so cross-cutting concerns, such as a route guard or realtime streaming, are reusable pieces rather than inheritance.
- **Predictable over clever.** What happens under the hood should be readable: events are queued and applied in order, renders are pure functions of the state, and tests need no setup.
- **Opt into complexity.** Every package beyond the store is optional, and each adds only what it is for.

## Is it for you?

Forge suits you if you want a single, predictable model from the first prototype to a large application, explicit state transitions you can test without mocking, and plain JavaScript rather than a compiler or a DSL.

It may not, if your team is deeply invested in another framework's ecosystem, or you need components that work without Inglorious: for those, standard Web Components are a better fit, and Inglorious Web [renders them as well](https://inglorious.dev/web/featured/web-components).

Next: [back to the overview](../README.md#documentation).
