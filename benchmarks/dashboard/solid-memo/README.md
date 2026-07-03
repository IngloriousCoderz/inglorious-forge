Solid signal-based benchmark with per-chart memoization.

This variant uses Solid `createSignal` primitives for state and wraps
`getChartData(filteredRows(), chart)` in a `createMemo` per chart to measure
memoization benefits in a signal-first implementation.
