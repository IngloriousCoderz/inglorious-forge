# Benchmarks

## Suites

1. Unified dashboard suite: `benchmarks/dashboard`
2. Charts suite: `benchmarks/charts`

Use this file as the top-level index for benchmark suites.

## Dashboard Benchmark

- Dataset: 1000 rows
- Update pressure: 10 random rows every 10ms
- Live panels: dashboard + metrics + 4 charts + table + row
- FPS sampling: use the automatic 30-second sampler
- Record final numbers only when `30s: DONE` is shown
- Use `FPS(avg10)` as the reported FPS value

### Run

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

### Results and docs

- `benchmarks/dashboard/README.md`

## Charts Benchmark

The charts suite compares chart-focused rendering/state strategies.

### Run

```bash
pnpm -C benchmarks/charts dev
pnpm -C benchmarks/charts build
pnpm -C benchmarks/charts preview
```

### Results and docs

- `benchmarks/charts/README.md`
