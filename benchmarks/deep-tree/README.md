# Deep Tree Sparse-Update Benchmark

This benchmark targets a specific concern: deep component hierarchies with infrequent updates affecting only one leaf at a time.

## Goal

Compare how these runtimes behave under sparse deep updates:

- React
- Vue
- Svelte
- Inglorious Web

## Workload

- Tree depth: `8`
- Branching factor: `3`
- Total nodes: generated at runtime (shown in UI)
- Leaf updates: `1` random leaf every `300ms`
- Metrics:
  - `FPS(avg10)`
  - `30s` sampler (`Mean/Min/Max`)
  - commit latency (`Commit(now)` and `Commit(avg10)`)

## Design Intent

This benchmark is explicitly designed to test sparse updates in deep trees.

- React/Vue/Svelte variants use localized leaf-state updates (fine-grained path).
- Inglorious Web still renders through the full tree render function.

This isolates the question: how much full-tree rendering costs when only a tiny part of the state changes.

## Run

```bash
pnpm -C benchmarks/deep-tree/react dev
pnpm -C benchmarks/deep-tree/vue dev
pnpm -C benchmarks/deep-tree/svelte dev
pnpm -C benchmarks/deep-tree/inglorious dev
```

## Results Table

| Variant        | FPS(avg10) Dev | FPS(avg10) Prod | Bundle Size (kB) |
| -------------- | -------------- | --------------- | ---------------- |
| React          | 120            | 120             | 62.16            |
| Vue            | 120            | 120             | 25.84            |
| Svelte         | 120            | 120             | 14.68            |
| Inglorious Web | 120            | 120             | 15.00            |

## Resource Diagnostics Table (Prod-only)

| Variant        | Main Thread Time (ms) | Scripting (ms) | Rendering (ms) | System (ms) | JS Heap (MB) | Listeners (#) | GC Events (#) |
| -------------- | --------------------- | -------------- | -------------- | ----------- | ------------ | ------------- | ------------- |
| React          | 251.3                 | 37             | 124            | 61          | 23.9-24.5    | 184-184       | 2             |
| Vue            | 196.0                 | 38             | 89             | 53          | 28.8-29.6    | 73-73         | 1             |
| Svelte         | 206.1                 | 34             | 74             | 82          | 49.3-49.8    | 43-43         | 1             |
| Inglorious Web | 338.8                 | 135            | 122            | 62          | 11.4-28.1    | 69-69         | 6             |

## Conclusions

1. In this sparse single-leaf update benchmark, all variants reach the same FPS cap (`120`) in both dev and prod.
2. Under that cap, CPU-side cost is where differences show up: Inglorious Web uses more main-thread/scripting time than the fine-grained variants in this specific scenario.
3. The data is consistent with a time/space tradeoff: Inglorious Web spends more CPU time during sparse updates, while keeping a relatively small memory footprint and smaller bundles.
4. Bundle size remains a strong point for Inglorious Web (much smaller than React, close to Svelte).
5. Battery impact from this specific gap is likely modest on modern devices in normal use: the app stays smooth at the FPS cap, and the extra scripting time is measurable but still a small absolute share of wall-clock time.
6. This result does not mean Inglorious Web is broadly "slow"; it shows that full-tree rendering has a measurable cost when updates are highly localized and infrequent, in exchange for a simpler and more explicit update model.
