Solid store benchmark.

This variant uses Solid `createStore` and `reconcile` to apply shared
`applyEvent` state updates from `@benchmarks/dashboard-shared`.

Files of interest:

- `src/app.jsx` — Solid store baseline app.
- `src/store/use-dashboard-state.js` — Solid store implementation using `createStore`.

This benchmark is intended to compare Solid's store-based model with the
signal-first Solid baseline and other framework variants.
