Solid store benchmark with per-chart memoization.

This variant uses Solid `createStore` / `reconcile` and the shared pure
`applyEvent` reducer from `@benchmarks/dashboard-shared`. It is the
store-based counterpart to `solid-store`, with memoized chart derivation
in `src/app.jsx`.

Files of interest:

- `src/app.jsx` — memoizes `getChartData(filteredRows(), chart)` per chart.
- `src/store/use-dashboard-state.js` — uses `createStore` and `reconcile`.

This folder can be run as a separate benchmark alongside the other Solid
variants.
