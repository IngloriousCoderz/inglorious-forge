# Dashboard Unified Benchmark Matrix

This suite now includes both:

- cross-framework baselines (React/Vue/Svelte/Inglorious)
- React state-strategy variants (memoized, RTK, RTK + adapters, Inglorious Store)

## Scope

- **React baseline**: `benchmarks/dashboard/react`
- **React memoized**: `benchmarks/dashboard/react-memo`
- **React + RTK**: `benchmarks/dashboard/react-rtk`
- **React + RTK memoized**: `benchmarks/dashboard/react-rtk-memo`
- **React + RTK + Inglorious adapters**: `benchmarks/dashboard/react-rtk-inglorious`
- **React + RTK + Inglorious adapters memoized**: `benchmarks/dashboard/react-rtk-inglorious-memo`
- **React + Inglorious Store**: `benchmarks/dashboard/react-inglorious`
- **React + Inglorious Store memoized**: `benchmarks/dashboard/react-inglorious-memo`
- **Vue baseline**: `benchmarks/dashboard/vue`
- **Vue + Pinia baseline**: `benchmarks/dashboard/vue-pinia`
- **Svelte baseline**: `benchmarks/dashboard/svelte`
- **Svelte + store baseline**: `benchmarks/dashboard/svelte-store`
- **Svelte + runes baseline**: `benchmarks/dashboard/svelte-runes`
- **Inglorious baseline**: `benchmarks/dashboard/inglorious`
- **Inglorious memoized**: `benchmarks/dashboard/inglorious-memo`
- **Shared model/data/CSS**: `benchmarks/dashboard/shared`

## Fairness Rules

| Rule                              | Status | Notes                                                                          |
| --------------------------------- | ------ | ------------------------------------------------------------------------------ |
| Same dataset and update frequency | ✅     | All apps use `@benchmarks/dashboard-shared`.                                   |
| Same chart model and slicing      | ✅     | Shared `CHARTS` and shared chart derivation helper.                            |
| Same business-logic shape         | ✅     | Event-driven handlers: metrics/table react to the same event names.            |
| Same top-level component shape    | ✅     | React/Vue/Svelte/Inglorious all use dashboard + metrics + chart + table + row. |
| Same styling                      | ✅     | All apps import `@benchmarks/dashboard-shared/style.css`.                      |

## Business Logic Model

Baseline cross-framework variants use the same event-driven logic contract from shared code:

- `randomUpdate`
- `metrics.setFPS`
- `metrics.setFilter`
- `metrics.setSort`
- `table.click`

React/Vue/Svelte baseline apps apply these events through a shared pure reducer (`applyEvent`) and derive rows via shared selectors.
Inglorious applies equivalent events through type handlers and selectors.

React state-strategy variants are intentionally separate implementations to compare architecture cost:

- React local state (`react`, `react-memo`)
- React + RTK (`react-rtk`, `react-rtk-memo`)
- React + RTK slices converted to Inglorious Store (`react-rtk-inglorious`, `react-rtk-inglorious-memo`)
- React + native Inglorious Store (`react-inglorious`, `react-inglorious-memo`)

## Run

```bash
pnpm -C benchmarks/dashboard/react dev
pnpm -C benchmarks/dashboard/react-memo dev
pnpm -C benchmarks/dashboard/react-rtk dev
pnpm -C benchmarks/dashboard/react-rtk-memo dev
pnpm -C benchmarks/dashboard/react-rtk-inglorious dev
pnpm -C benchmarks/dashboard/react-rtk-inglorious-memo dev
pnpm -C benchmarks/dashboard/react-inglorious dev
pnpm -C benchmarks/dashboard/react-inglorious-memo dev
pnpm -C benchmarks/dashboard/vue dev
pnpm -C benchmarks/dashboard/vue-pinia dev
pnpm -C benchmarks/dashboard/svelte dev
pnpm -C benchmarks/dashboard/svelte-store dev
pnpm -C benchmarks/dashboard/svelte-runes dev
pnpm -C benchmarks/dashboard/inglorious dev
pnpm -C benchmarks/dashboard/inglorious-memo dev
```

## Results

| Variant                           | FPS(avg10) Dev | FPS(avg10) Prod | Bundle Size |
| --------------------------------- | -------------- | --------------- | ----------- |
| React                             | 52             | 113             | 62.39kB     |
| React Memoized                    | 112            | 120             | 62.58kB     |
| React + RTK                       | 32             | 92              | 72.21kB     |
| React + RTK Memoized              | 87             | 118             | 72.30kB     |
| React + RTK + Inglorious          | 29             | 74              | 79.18kB     |
| React + RTK + Inglorious Memoized | 69             | 93              | 79.29kB     |
| React + Inglorious Store          | 33             | 95              | 71.98kB     |
| React + Inglorious Store Memoized | 87             | 120             | 72.05kB     |
| Vue                               | 116            | 117             | 26.80kB     |
| Vue + Pinia                       | 117            | 117             | 28.56kB     |
| Svelte                            | 112            | 119             | 16.02kB     |
| Svelte + Store                    | 110            | 119             | 16.04kB     |
| Svelte + Runes                    | 102            | 118             | 14.13kB     |
| Inglorious                        | 105            | 120             | 16.29kB     |
| Inglorious Memoized               | 110            | 120             | 16.35kB     |

### Considerations

1. React without memoization is consistently the weakest setup in dev mode; memoization is the biggest lever in React branches.
2. RTK-based branches remain slower and bigger than plain React memo and native Inglorious Store branches in this workload.
3. RTK-to-Inglorious adapter branches are the slowest React strategy, but still valid as migration paths.
4. Native Inglorious Web is fast by default and gains little from extra memoization, which suggests the baseline update model is already efficient.
5. Removing `StrictMode` was not the main lever; render strategy and state architecture dominate the outcome.

### Beyond FPS

Vue and Svelte are as fast as, and in some runs faster than, Inglorious Web in this benchmark. So raw rendering speed alone is not a differentiator here.

The practical tradeoffs are mostly around architecture ergonomics:

1. Predictability: Inglorious Web keeps explicit event/type boundaries, which can make update flow easier to reason about in complex state-heavy apps.
2. Testability: type handlers and selectors are easy to test in isolation without component harnesses.
3. Debuggability: explicit event notifications and centralized state transitions can reduce "where did this update come from?" ambiguity.
4. DX: less memoization pressure and fewer framework-specific performance patterns to remember in baseline usage.

These are qualitative advantages and should be validated against team familiarity and tooling preferences.

### Svelte Runes Note

The current runes variant is intentionally benchmark-oriented, not a style guide. Some code shape is optimized for parity with other variants rather than idiomatic Svelte 5 composition.

For more idiomatic runes code, prefer:

1. Component-local `$props()` and `$derived` close to usage.
2. Smaller reactive units instead of broad top-level reactive objects.
3. Clear separation between event/update logic and presentational components.

## Planned Extensions

| Variant                                 | Why                                                           |
| --------------------------------------- | ------------------------------------------------------------- |
| Vue + Pinia memoized                    | Measure render-memoization impact under Vue store integration |
| Svelte + explicit store-pattern variant | Added as `svelte-store` baseline                              |
| Svelte + runes variant                  | Added as `svelte-runes` baseline                              |
