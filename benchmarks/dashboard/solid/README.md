Signal-first Solid variant for the dashboard benchmark.

This variant implements the state using Solid `createSignal` primitives
instead of `createStore`. Rows are represented as objects with accessor
properties that read individual signals so components can stay unchanged
while benefiting from fine-grained reactivity.

See `src/store/useDashboardState.js` for implementation details.
